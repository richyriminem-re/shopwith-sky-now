import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { canApplyCode, calculatePromoDiscount, getAvailableCodes, getPromoDescription } from '@/utils/promo';
import { X } from 'lucide-react';

interface PromoCodeProps {
  onApplyCode: (code: string) => void;
  onRemoveCode: (code: string) => void;
  subtotal: number;
  shipping: number;
  appliedCodes: string[];
}


const PromoCode = ({ onApplyCode, onRemoveCode, subtotal, shipping, appliedCodes }: PromoCodeProps) => {
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();


  const handleApplyCode = async () => {
    if (!promoCode.trim()) return;
    
    const code = promoCode.toUpperCase();
    const context = { subtotal, shipping, appliedCodes };
    
    // Check if code can be applied
    const { canApply, error } = canApplyCode(code, context);
    if (!canApply) {
      toast({
        title: "Cannot apply promo code",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { discount, error: calcError } = calculatePromoDiscount(code, context);
      if (calcError) {
        toast({
          title: "Cannot apply promo code",
          description: calcError,
          variant: "destructive",
        });
        return;
      }
      
      onApplyCode(code);
      setPromoCode('');
      
      const description = getPromoDescription(code);
      toast({
        title: "Promo code applied!",
        description: `${description} - You saved ${formatCurrency(discount)}`,
      });
    } catch (error) {
      toast({
        title: "Failed to apply code",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCode = (code: string) => {
    onRemoveCode(code);
    toast({
      title: "Promo code removed",
      description: `${code} has been removed from your order`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCode();
    }
  };

  return (
    <div className="neu-surface p-3 sm:p-4 rounded-xl">
      <h3 className="font-semibold mb-3 text-sm sm:text-base">Promo Code</h3>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Enter code"
          className="flex-1 px-3 sm:px-4 py-3 text-sm sm:text-base min-h-[44px] rounded-lg border border-border bg-background min-w-0"
          disabled={isApplying}
          maxLength={20}
        />
        <button 
          onClick={handleApplyCode} 
          className="neu-pressable px-4 sm:px-6 min-h-[44px] text-sm sm:text-base disabled:opacity-50 flex-shrink-0 sm:w-auto w-full"
          disabled={!promoCode.trim() || isApplying}
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </button>
      </div>
      
      <div className="mt-3 space-y-1">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Try: {getAvailableCodes().join(', ')}
        </p>
        {appliedCodes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {appliedCodes.map((code) => (
              <div 
                key={code}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
              >
                <span>{code} ✓</span>
                <button
                  onClick={() => handleRemoveCode(code)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${code} promo code`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCode;