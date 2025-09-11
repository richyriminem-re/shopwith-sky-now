/**
 * Circuit Breaker Pattern Implementation for API Resilience
 * 
 * Provides protection against cascading failures by tracking API health
 * and automatically opening/closing circuits based on failure rates.
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

export interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening
  recoveryTimeout: number;      // Time in ms before attempting recovery
  monitoringWindow: number;     // Time window for tracking failures
  successThreshold: number;     // Successes needed to close from half-open
  maxRetryAttempts: number;     // Max retry attempts with backoff
  baseRetryDelay: number;       // Base delay for exponential backoff
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  successRate: number;
  nextRetryTime: number | null;
}

export interface CircuitBreakerEvent {
  type: 'state_change' | 'request' | 'failure' | 'success' | 'retry';
  timestamp: number;
  state: CircuitState;
  endpoint: string;
  details?: any;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private nextRetryTime: number | null = null;
  private failureHistory: number[] = [];
  private readonly name: string;
  private eventListeners: ((event: CircuitBreakerEvent) => void)[] = [];

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 60 seconds
      monitoringWindow: 60000, // 60 seconds
      successThreshold: 3,
      maxRetryAttempts: 3,
      baseRetryDelay: 1000, // 1 second
      ...config,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptRecovery()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        this.emitEvent('request', { rejected: true });
        if (fallback) {
          return typeof fallback === 'function' ? await fallback() : fallback;
        }
        throw new CircuitBreakerError(`Circuit breaker is OPEN for ${this.name}`, this.name);
      }
    }

    this.totalRequests++;
    this.emitEvent('request', { state: this.state });

    try {
      const result = await this.executeWithRetry(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      
      // Try fallback if available
      if (fallback && this.state === CircuitState.OPEN) {
        try {
          return typeof fallback === 'function' ? await fallback() : fallback;
        } catch (fallbackError) {
          // If fallback also fails, throw original error
          throw error;
        }
      }
      
      throw error;
    }
  }

  /**
   * Execute operation with exponential backoff retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Don't retry on client errors (4xx) or auth errors
      if (this.isClientError(error) || attempt >= this.config.maxRetryAttempts) {
        throw error;
      }

      const delay = this.calculateRetryDelay(attempt);
      this.emitEvent('retry', { attempt, delay, error: error.message });
      
      await this.sleep(delay);
      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateRetryDelay(attempt: number): number {
    const exponentialDelay = this.config.baseRetryDelay * Math.pow(2, attempt - 1);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  /**
   * Check if error is a client error that shouldn't trigger circuit breaker
   */
  private isClientError(error: any): boolean {
    if (error?.code) {
      const clientErrorCodes = ['AUTH_ERROR', 'VALIDATION_ERROR', 'NOT_FOUND'];
      return clientErrorCodes.includes(error.code);
    }
    
    if (error?.status) {
      return error.status >= 400 && error.status < 500;
    }
    
    return false;
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.successes++;
    
    this.emitEvent('success', {});

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.reset();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Clean old failures from history
      this.cleanFailureHistory();
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: any): void {
    // Don't count client errors as circuit breaker failures
    if (this.isClientError(error)) {
      return;
    }

    this.lastFailureTime = Date.now();
    this.failures++;
    this.failureHistory.push(Date.now());
    
    this.emitEvent('failure', { error: error.message });

    // Clean old failures from history
    this.cleanFailureHistory();

    // Check if we should open the circuit
    if (this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN) {
      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
        this.scheduleRecoveryAttempt();
      }
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;
    
    this.emitEvent('state_change', {
      from: previousState,
      to: newState,
    });

    console.log(`Circuit breaker ${this.name}: ${previousState} -> ${newState}`);
  }

  /**
   * Schedule recovery attempt after timeout
   */
  private scheduleRecoveryAttempt(): void {
    this.nextRetryTime = Date.now() + this.config.recoveryTimeout;
  }

  /**
   * Check if we should attempt recovery from OPEN state
   */
  private shouldAttemptRecovery(): boolean {
    return this.nextRetryTime !== null && Date.now() >= this.nextRetryTime;
  }

  /**
   * Clean old failures from history based on monitoring window
   */
  private cleanFailureHistory(): void {
    const cutoff = Date.now() - this.config.monitoringWindow;
    this.failureHistory = this.failureHistory.filter(time => time > cutoff);
    this.failures = this.failureHistory.length;
  }

  /**
   * Reset circuit breaker to initial state
   */
  private reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.failureHistory = [];
    this.nextRetryTime = null;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    this.cleanFailureHistory();
    
    const successRate = this.totalRequests > 0 
      ? (this.totalRequests - this.failures) / this.totalRequests 
      : 1;

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      successRate: Math.round(successRate * 100) / 100,
      nextRetryTime: this.nextRetryTime,
    };
  }

  /**
   * Force state change (for testing)
   */
  forceState(state: CircuitState): void {
    this.transitionTo(state);
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: CircuitBreakerEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: CircuitBreakerEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(type: CircuitBreakerEvent['type'], details: any): void {
    const event: CircuitBreakerEvent = {
      type,
      timestamp: Date.now(),
      state: this.state,
      endpoint: this.name,
      details,
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in circuit breaker event listener:', error);
      }
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker name
   */
  getName(): string {
    return this.name;
  }
}

/**
 * Circuit Breaker Error class
 */
export class CircuitBreakerError extends Error {
  public readonly circuitName: string;

  constructor(message: string, circuitName: string) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
  }
}

/**
 * Circuit Breaker Registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private defaultConfigs: Map<string, Partial<CircuitBreakerConfig>> = new Map();

  private constructor() {}

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  /**
   * Get or create circuit breaker for endpoint
   */
  getCircuitBreaker(endpoint: string): CircuitBreaker {
    if (!this.circuitBreakers.has(endpoint)) {
      const config = this.defaultConfigs.get(endpoint) || {};
      const circuitBreaker = new CircuitBreaker(endpoint, config);
      this.circuitBreakers.set(endpoint, circuitBreaker);
    }
    return this.circuitBreakers.get(endpoint)!;
  }

  /**
   * Set default configuration for an endpoint
   */
  setDefaultConfig(endpoint: string, config: Partial<CircuitBreakerConfig>): void {
    this.defaultConfigs.set(endpoint, config);
    
    // Update existing circuit breaker if it exists
    if (this.circuitBreakers.has(endpoint)) {
      const existingCircuit = this.circuitBreakers.get(endpoint)!;
      // Force recreate with new config
      this.circuitBreakers.delete(endpoint);
      const newCircuit = new CircuitBreaker(endpoint, config);
      this.circuitBreakers.set(endpoint, newCircuit);
    }
  }

  /**
   * Get all circuit breakers
   */
  getAllCircuitBreakers(): CircuitBreaker[] {
    return Array.from(this.circuitBreakers.values());
  }

  /**
   * Get metrics for all circuit breakers
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    
    for (const [name, circuit] of this.circuitBreakers) {
      metrics[name] = circuit.getMetrics();
    }
    
    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const circuit of this.circuitBreakers.values()) {
      circuit.forceState(CircuitState.CLOSED);
    }
  }
}

// Default endpoint configurations
export const endpointConfigs: Record<string, Partial<CircuitBreakerConfig>> = {
  // Products API: 5 failures threshold, 30-second timeout
  'products': {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    monitoringWindow: 60000,
    successThreshold: 3,
    maxRetryAttempts: 3,
    baseRetryDelay: 1000,
  },
  
  // Cart API: 3 failures threshold, 15-second timeout  
  'cart': {
    failureThreshold: 3,
    recoveryTimeout: 15000,
    monitoringWindow: 45000,
    successThreshold: 2,
    maxRetryAttempts: 2,
    baseRetryDelay: 500,
  },
  
  // Orders API: 2 failures threshold, 45-second timeout
  'orders': {
    failureThreshold: 2,
    recoveryTimeout: 45000,
    monitoringWindow: 90000,
    successThreshold: 2,
    maxRetryAttempts: 3,
    baseRetryDelay: 2000,
  },
  
  // Authentication API: 10 failures threshold, 60-second timeout
  'auth': {
    failureThreshold: 10,
    recoveryTimeout: 60000,
    monitoringWindow: 120000,
    successThreshold: 5,
    maxRetryAttempts: 2,
    baseRetryDelay: 1000,
  },
  
  // Search API: 8 failures threshold, 20-second timeout
  'search': {
    failureThreshold: 8,
    recoveryTimeout: 20000,
    monitoringWindow: 60000,
    successThreshold: 3,
    maxRetryAttempts: 3,
    baseRetryDelay: 800,
  },
};

// Initialize default configurations
const registry = CircuitBreakerRegistry.getInstance();
Object.entries(endpointConfigs).forEach(([endpoint, config]) => {
  registry.setDefaultConfig(endpoint, config);
});

export { registry as circuitBreakerRegistry };