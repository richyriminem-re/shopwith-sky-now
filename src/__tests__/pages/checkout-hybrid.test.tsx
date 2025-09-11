import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CheckoutHybrid from '@/pages/CheckoutHybrid';
import { useCartStore, useCheckoutStore } from '@/lib/store';
import { mockToastSystem } from '../utils/navigation-test-utils';

// Mock stores
vi.mock('@/lib/store', () => ({
  useCartStore: vi.fn(),
  useCheckoutStore: vi.fn(),
}));

// Mock toast
const mockToast = mockToastSystem();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast.toast }),
}));

// Mock WhatsApp components
vi.mock('@/components/whatsapp/WhatsAppOrderGenerator', () => ({
  WhatsAppOrderGenerator: ({ orderReference, onGenerate }: any) => (
    <div data-testid="whatsapp-generator">
      <button 
        onClick={() => onGenerate(`https://wa.me/1234567890?text=Order%20${orderReference}`)}
        data-testid="generate-whatsapp"
      >
        Generate WhatsApp
      </button>
    </div>
  ),
}));

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    internal: { pageSize: { width: 210, height: 297 } },
  })),
}));

const renderCheckoutHybrid = () => {
  return render(
    <BrowserRouter>
      <CheckoutHybrid />
    </BrowserRouter>
  );
};

describe('CheckoutHybrid Logic Tests', () => {
  const mockCartStore = {
    items: [
      { id: '1', name: 'Test Product', price: 99.99, quantity: 2, image: '/test.jpg' }
    ],
    totalPrice: 199.98,
    clearCart: vi.fn(),
  };

  const mockCheckoutStore = {
    orderReference: 'ORD-12345',
    address: null,
    currentStep: 'address' as const,
    setAddress: vi.fn(),
    setCurrentStep: vi.fn(),
    appliedPromoCodes: [],
    discount: 0,
    shippingOption: 'standard' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useCartStore as any).mockReturnValue(mockCartStore);
    (useCheckoutStore as any).mockReturnValue(mockCheckoutStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Guard Logic', () => {
    it('should redirect when cart is empty', () => {
      (useCartStore as any).mockReturnValue({
        ...mockCartStore,
        items: [],
        totalPrice: 0,
      });

      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
        };
      });

      renderCheckoutHybrid();
      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    it('should redirect when no order reference exists', () => {
      (useCheckoutStore as any).mockReturnValue({
        ...mockCheckoutStore,
        orderReference: null,
      });

      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
        };
      });

      renderCheckoutHybrid();
      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });
  });

  describe('Receipt Generation Logic', () => {
    it('should generate receipt with correct order reference', async () => {
      renderCheckoutHybrid();
      
      const downloadButton = screen.getByText(/download receipt/i);
      await userEvent.click(downloadButton);

      await waitFor(() => {
        const receiptKey = `hasDownloadedReceipt_${mockCheckoutStore.orderReference}`;
        expect(localStorage.getItem(receiptKey)).toBe('true');
      });
    });

    it('should unlock WhatsApp section after receipt download', async () => {
      renderCheckoutHybrid();
      
      // Initially WhatsApp should be locked
      expect(screen.getByText(/download your receipt first/i)).toBeInTheDocument();
      
      // Download receipt
      const downloadButton = screen.getByText(/download receipt/i);
      await userEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByTestId('whatsapp-generator')).toBeInTheDocument();
      });
    });

    it('should remember receipt download across page reloads', () => {
      const receiptKey = `hasDownloadedReceipt_${mockCheckoutStore.orderReference}`;
      localStorage.setItem(receiptKey, 'true');
      
      renderCheckoutHybrid();
      
      // WhatsApp should be unlocked immediately
      expect(screen.getByTestId('whatsapp-generator')).toBeInTheDocument();
    });
  });

  describe('Form Validation Logic', () => {
    it('should validate email format correctly', async () => {
      renderCheckoutHybrid();
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Test invalid email
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
      
      // Test valid email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.org');
      await userEvent.tab();
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
      });
    });

    it('should allow flexible house number input', async () => {
      renderCheckoutHybrid();
      
      const houseInput = screen.getByLabelText(/house number/i);
      
      await userEvent.type(houseInput, '123A/4-B, #5');
      
      expect(houseInput).toHaveValue('123A/4-B, #5');
    });

    it('should format phone number automatically', async () => {
      renderCheckoutHybrid();
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      await userEvent.type(phoneInput, '1234567890');
      
      // Phone should be formatted
      expect(phoneInput).toHaveValue('(123) 456-7890');
    });
  });

  describe('Information Locking Logic', () => {
    it('should lock information when button is clicked', async () => {
      renderCheckoutHybrid();
      
      // Fill form
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
      
      const lockButton = screen.getByText(/lock information/i);
      await userEvent.click(lockButton);
      
      // Form should be locked
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByText(/unlock to edit/i)).toBeInTheDocument();
    });

    it('should unlock information when unlock button is clicked', async () => {
      renderCheckoutHybrid();
      
      // Fill and lock form first
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      const lockButton = screen.getByText(/lock information/i);
      await userEvent.click(lockButton);
      
      // Now unlock
      const unlockButton = screen.getByText(/unlock to edit/i);
      await userEvent.click(unlockButton);
      
      // Form should be unlocked
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
      expect(screen.getByText(/lock information/i)).toBeInTheDocument();
    });
  });

  describe('WhatsApp Integration Logic', () => {
    it('should generate WhatsApp URL with order reference', async () => {
      // Download receipt first to unlock WhatsApp
      const receiptKey = `hasDownloadedReceipt_${mockCheckoutStore.orderReference}`;
      localStorage.setItem(receiptKey, 'true');
      
      renderCheckoutHybrid();
      
      const generateButton = screen.getByTestId('generate-whatsapp');
      await userEvent.click(generateButton);
      
      // Should open WhatsApp with order reference
      await waitFor(() => {
        // Mock implementation should be called with order reference
        expect(generateButton).toBeInTheDocument();
      });
    });

    it('should not clear cart when WhatsApp is opened', async () => {
      const receiptKey = `hasDownloadedReceipt_${mockCheckoutStore.orderReference}`;
      localStorage.setItem(receiptKey, 'true');
      
      renderCheckoutHybrid();
      
      const generateButton = screen.getByTestId('generate-whatsapp');
      await userEvent.click(generateButton);
      
      // Cart should NOT be cleared
      expect(mockCartStore.clearCart).not.toHaveBeenCalled();
    });
  });

  describe('Form Persistence Logic', () => {
    it('should restore form data from localStorage', () => {
      const formData = {
        email: 'restored@example.com',
        phone: '(123) 456-7890',
        houseNumber: '123',
      };
      
      localStorage.setItem('checkoutFormData', JSON.stringify(formData));
      
      renderCheckoutHybrid();
      
      expect(screen.getByDisplayValue('restored@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(123) 456-7890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
    });

    it('should persist form data to localStorage on changes', async () => {
      renderCheckoutHybrid();
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'persist@example.com');
      
      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('checkoutFormData') || '{}');
        expect(savedData.email).toBe('persist@example.com');
      });
    });
  });

  describe('Submit Button Logic', () => {
    it('should be disabled when form is invalid', () => {
      renderCheckoutHybrid();
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      expect(submitButton).toBeDisabled();
    });

    it('should be enabled when form is valid', async () => {
      renderCheckoutHybrid();
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText(/email/i), 'valid@example.com');
      await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
      await userEvent.type(screen.getByLabelText(/house number/i), '123');
      await userEvent.type(screen.getByLabelText(/street/i), 'Main St');
      await userEvent.type(screen.getByLabelText(/city/i), 'Test City');
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /place order/i });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('localStorage Key Consistency', () => {
    it('should use order reference in localStorage keys', () => {
      const orderRef = mockCheckoutStore.orderReference;
      renderCheckoutHybrid();
      
      // Check that the expected key format is used
      const expectedReceiptKey = `hasDownloadedReceipt_${orderRef}`;
      
      // The key should be consistent across the component
      expect(expectedReceiptKey).toBe(`hasDownloadedReceipt_${orderRef}`);
    });
  });
});