import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Login = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // TODO: Implement actual login logic
      if (import.meta.env.DEV) console.log('Login data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to account page after successful login
      navigate('/account');
    } catch (error) {
      setFormError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // TODO: Implement actual signup logic
      if (import.meta.env.DEV) console.log('Signup data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to account page after successful signup
      navigate('/account');
    } catch (error) {
      setFormError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormError(null); // Clear any form errors when switching modes
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle Background Element */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-primary/3 to-transparent rounded-full translate-x-40 translate-y-40"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <BackButton fallback="/" variant="icon-only" />
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 relative z-10 flex items-center">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo/Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 neu-surface rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {isSignup ? 'Join Sky for a better way to shop.' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isSignup 
                ? 'Create your account to start shopping' 
                : 'Sign in to continue shopping'
              }
            </p>
          </div>

          {/* Form */}
          <div className="neu-card p-4 mb-4 shadow-xl">
            {/* Error message with aria-live for screen readers */}
            {formError && (
              <div 
                className="mb-4 p-3 neu-surface rounded-lg border-l-4 border-destructive"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-destructive font-medium">{formError}</p>
              </div>
            )}
            
            {isSignup ? (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Your full name"
                              className="neu-input pl-10 h-11 text-sm"
                              disabled={isLoading}
                              {...field}
                              onBlur={(e) => {
                                const value = e.target.value.trim();
                                const words = value.split(/\s+/).filter(Boolean);
                                const capitalized = words.map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(' ');
                                field.onChange(capitalized);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Your email address"
                              className="neu-input pl-10 h-11 text-sm"
                              disabled={isLoading}
                              {...field}
                              onBlur={(e) => field.onChange(e.target.value.trim().toLowerCase())}
                            />
                          </div>
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Choose a password"
                              className="neu-input pl-10 pr-10 h-11 text-sm"
                              disabled={isLoading}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              tabIndex={0}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                          <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="neu-button-enhanced w-full h-11 mt-4 text-sm font-semibold"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Your email address"
                              className="neu-input pl-10 h-11 text-sm"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                          <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Your password"
                              className="neu-input pl-10 pr-10 h-11 text-sm"
                              disabled={isLoading}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              tabIndex={0}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                          <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end mb-1">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="neu-button-enhanced w-full h-11 mt-4 text-sm font-semibold"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          {/* Toggle Mode */}
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-sm">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="text-primary font-semibold hover:underline transition-all duration-200 hover:scale-105"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Terms */}
          {isSignup && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
                  Privacy Policy
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;