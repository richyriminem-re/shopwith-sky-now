import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import { useAuthPagePreloading } from '@/hooks/useDeepPagePreloading';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SEOHead from '@/components/SEOHead';
import PageWithNavigation from '@/components/PageWithNavigation';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Deep page preloading for auth-related routes
  useAuthPagePreloading();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Password reset logic would go here
      console.log('Password reset requested for:', data.email);
      
      setIsSubmitted(true);
    } catch (error) {
      setFormError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWithNavigation fallbackRoute="/login">
      <SEOHead 
        title="Forgot Password - Shop With Sky"
        description="Reset your Shop With Sky account password"
      />
      <div className="min-h-screen flex items-center justify-center p-4 bg-neu">
        <div className="w-full max-w-md">
          <div className="neu-surface p-8 rounded-2xl">
            <div className="text-center mb-8">
              <div className="neu-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound size={24} className="text-neu-primary" />
              </div>
              <h1 className="text-2xl font-bold text-neu-primary mb-2">Forgot Password?</h1>
              <p className="text-sm text-neu-muted">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {!isSubmitted ? (
              <>
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
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-neu-primary">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="neu-input"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage aria-live="polite" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full neu-button-primary"
                      disabled={isLoading}
                      aria-busy={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="neu-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Mail size={24} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neu-primary mb-2">Check Your Email</h2>
                  <p className="text-sm text-neu-muted">
                    We've sent a password reset link to {form.getValues('email')}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <BackButton 
                fallback="/login" 
                text="Back to Login" 
                variant="compact"
                breadcrumbHints={['Login', 'Password Recovery']} 
              />
            </div>
          </div>
        </div>
      </div>
    </PageWithNavigation>
  );
};

export default ForgotPassword;