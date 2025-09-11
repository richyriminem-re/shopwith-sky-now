import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CheckoutHybrid from '@/pages/CheckoutHybrid';
import { useCartStore, useCheckoutStore } from '@/lib/store';

// Mock stores
vi.mock('@/lib/store', () => ({
  useCartStore: vi.fn(),
  useCheckoutStore: vi.fn(),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock WhatsApp components
vi.mock('@/components/whatsapp/WhatsAppOrderGenerator', () => ({
  default: ({ orderReference, onGenerate }: any) => (
    <div data-testid="whatsapp-generator">
      <span data-testid="order-ref">{orderReference}</span>
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

describe('CheckoutHybrid Integration Tests', () => {
  const mockCartStore = {
    items: [
      { id: '1', name: 'Test Product', price: 99.99, quantity: 2, image: '/test.jpg' }
    ],
    totalPrice: 199.98,
    clearCart: vi.fn(),
  };

  const mockCheckoutStore = {
    orderReference: 'ORD-INTEGRATION-123',
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

  describe('End-to-End Receipt to WhatsApp Flow', () => {
    it('should complete full flow: form fill → lock → receipt → WhatsApp', async () => {
      renderCheckoutHybrid();
      
      // Step 1: Fill form
      await userEvent.type(screen.getByLabelText(/email/i), 'integration@test.com');
      await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
      await userEvent.type(screen.getByLabelText(/house number/i), '123');
      await userEvent.type(screen.getByLabelText(/street/i), 'Integration St');
      await userEvent.type(screen.getByLabelText(/city/i), 'Test City');
      
      // Step 2: Lock information
      const lockButton = screen.getByText(/lock information/i);
      await userEvent.click(lockButton);
      
      // Verify form is locked
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      
      // Step 3: Download receipt
      const downloadButton = screen.getByText(/download receipt/i);
      await userEvent.click(downloadButton);
      
      // Step 4: Verify WhatsApp is unlocked with correct order reference
      await waitFor(() => {
        expect(screen.getByTestId('whatsapp-generator')).toBeInTheDocument();
        expect(screen.getByTestId('order-ref')).toHaveTextContent('ORD-INTEGRATION-123');
      });
      
      // Step 5: Generate WhatsApp
      const generateButton = screen.getByTestId('generate-whatsapp');
      await userEvent.click(generateButton);
      
      // Verify cart is NOT cleared
      expect(mockCartStore.clearCart).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle missing order reference gracefully', () => {
      (useCheckoutStore as any).mockReturnValue({
        ...mockCheckoutStore,
        orderReference: null,
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Should not crash, should redirect
      expect(() => renderCheckoutHybrid()).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle corrupted localStorage data', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('checkoutFormData', 'invalid-json');
      
      // Should not crash
      expect(() => renderCheckoutHybrid()).not.toThrow();
    });

    it('should handle missing receipt state in localStorage', () => {
      renderCheckoutHybrid();
      
      // WhatsApp should be locked initially
      expect(screen.getByText(/download your receipt first/i)).toBeInTheDocument();
    });

    it('should handle form submission with minimum required fields', async () => {
      renderCheckoutHybrid();
      
      // Fill only required fields
      await userEvent.type(screen.getByLabelText(/email/i), 'min@test.com');
      await userEvent.type(screen.getByLabelText(/phone/i), '9876543210');
      await userEvent.type(screen.getByLabelText(/house number/i), '1');
      await userEvent.type(screen.getByLabelText(/street/i), 'St');
      await userEvent.type(screen.getByLabelText(/city/i), 'C');
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /place order/i });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('State Persistence Across Interactions', () => {
    it('should maintain form state during lock/unlock cycles', async () => {
      renderCheckoutHybrid();
      
      // Fill form
      const emailValue = 'persist@test.com';
      await userEvent.type(screen.getByLabelText(/email/i), emailValue);
      
      // Lock and unlock
      await userEvent.click(screen.getByText(/lock information/i));
      await userEvent.click(screen.getByText(/unlock to edit/i));
      
      // Value should be preserved
      expect(screen.getByDisplayValue(emailValue)).toBeInTheDocument();
    });

    it('should maintain receipt state across component re-renders', async () => {
      const receiptKey = `hasDownloadedReceipt_${mockCheckoutStore.orderReference}`;
      
      // First render - download receipt
      const { unmount } = renderCheckoutHybrid();
      const downloadButton = screen.getByText(/download receipt/i);
      await userEvent.click(downloadButton);
      
      // Verify localStorage is set
      expect(localStorage.getItem(receiptKey)).toBe('true');
      
      // Unmount and re-render
      unmount();
      renderCheckoutHybrid();
      
      // WhatsApp should still be unlocked
      expect(screen.getByTestId('whatsapp-generator')).toBeInTheDocument();
    });
  });

  describe('Multiple Order Reference Scenarios', () => {
    it('should handle different order references correctly', async () => {
      // First order reference
      renderCheckoutHybrid();
      const downloadButton = screen.getByText(/download receipt/i);
      await userEvent.click(downloadButton);
      
      const firstKey = `hasDownloadedReceipt_${mockCheckoutStore.orderReference}`;
      expect(localStorage.getItem(firstKey)).toBe('true');
      
      // Change order reference
      const newOrderRef = 'ORD-NEW-456';
      (useCheckoutStore as any).mockReturnValue({
        ...mockCheckoutStore,
        orderReference: newOrderRef,
      });
      
      // Re-render with new order reference
      const { unmount } = render(<BrowserRouter><CheckoutHybrid /></BrowserRouter>);
      unmount();
      renderCheckoutHybrid();
      
      // Should be locked again for new order
      expect(screen.getByText(/download your receipt first/i)).toBeInTheDocument();
      
      // New key should not exist
      const newKey = `hasDownloadedReceipt_${newOrderRef}`;
      expect(localStorage.getItem(newKey)).toBeNull();
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle various email formats', async () => {
      renderCheckoutHybrid();
      const emailInput = screen.getByLabelText(/email/i);
      
      // Test various valid email formats
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.net',
        'user123@sub.domain.co.uk'
      ];
      
      for (const email of validEmails) {
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, email);
        await userEvent.tab();
        
        await waitFor(() => {
          expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should handle special characters in house number', async () => {
      renderCheckoutHybrid();
      const houseInput = screen.getByLabelText(/house number/i);
      
      const specialCases = [
        '123A',
        '45/67',
        '12-34',
        '#56',
        '78, Unit B'
      ];
      
      for (const houseNumber of specialCases) {
        await userEvent.clear(houseInput);
        await userEvent.type(houseInput, houseNumber);
        
        expect(houseInput).toHaveValue(houseNumber);
      }
    });

    it('should format phone numbers consistently', async () => {
      renderCheckoutHybrid();
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      await userEvent.type(phoneInput, '1234567890');
      
      // Should be formatted
      expect(phoneInput).toHaveValue('(123) 456-7890');
    });
  });
});