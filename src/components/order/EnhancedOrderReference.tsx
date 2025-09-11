import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnhancedOrderReferenceProps {
  reference: string;
  className?: string;
  showCopy?: boolean;
}

export const EnhancedOrderReference = ({ 
  reference, 
  className,
  showCopy = true 
}: EnhancedOrderReferenceProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      toast({
        title: "Reference Copied",
        description: "Order reference copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "font-mono text-xs px-3 py-1.5 bg-primary/5 border-primary/20",
          "animate-fade-in"
        )}
      >
        <span className="text-muted-foreground mr-1">REF:</span>
        <span className="text-primary font-bold">{reference}</span>
      </Badge>
      
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0 hover:bg-primary/10"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success animate-scale-in" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  );
};

// Enhanced order reference generator with better formatting
export const generateOrderReference = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const timeStamp = Date.now().toString().slice(-4);
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `SWS${year}${month}${day}-${timeStamp}-${randomStr}`;
};