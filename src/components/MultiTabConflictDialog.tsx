import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ConflictItem {
  productId: string;
  variantId: string;
  qty: number;
  productName?: string;
  variantName?: string;
  price?: number;
  image?: string;
}

interface ConflictData {
  id: string;
  key: string;
  currentValue: ConflictItem[];
  incomingValue: ConflictItem[];
  timestamp: number;
  sourceTabId: string;
  conflictType: 'modification' | 'deletion' | 'addition';
}

interface MultiTabConflictDialogProps {
  conflicts: ConflictData[];
  isOpen: boolean;
  onClose: () => void;
  onResolve: (conflictId: string, strategy: string, customResolution?: any) => void;
  onResolveAll: (strategy: string) => void;
}

const MultiTabConflictDialog = ({
  conflicts,
  isOpen,
  onClose,
  onResolve,
  onResolveAll
}: MultiTabConflictDialogProps) => {
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [resolutionMode, setResolutionMode] = useState<'single' | 'batch'>('single');

  useEffect(() => {
    if (conflicts.length > 0 && !selectedConflict) {
      setSelectedConflict(conflicts[0]);
    }
  }, [conflicts, selectedConflict]);

  const getConflictDescription = (conflict: ConflictData) => {
    const timeDiff = Date.now() - conflict.timestamp;
    const timeAgo = timeDiff < 60000 ? 'just now' : `${Math.floor(timeDiff / 60000)}m ago`;
    
    switch (conflict.conflictType) {
      case 'addition':
        return `Items added from another tab ${timeAgo}`;
      case 'deletion':
        return `Items removed in another tab ${timeAgo}`;
      case 'modification':
        return `Cart modified in another tab ${timeAgo}`;
      default:
        return `Changes detected ${timeAgo}`;
    }
  };

  const getItemDifferences = (conflict: ConflictData) => {
    const current = conflict.currentValue || [];
    const incoming = conflict.incomingValue || [];
    
    const differences = {
      added: incoming.filter(inc => !current.find(cur => 
        cur.productId === inc.productId && cur.variantId === inc.variantId
      )),
      removed: current.filter(cur => !incoming.find(inc => 
        inc.productId === cur.productId && inc.variantId === cur.variantId
      )),
      modified: current.filter(cur => {
        const incItem = incoming.find(inc => 
          inc.productId === cur.productId && inc.variantId === cur.variantId
        );
        return incItem && incItem.qty !== cur.qty;
      }).map(cur => {
        const incItem = incoming.find(inc => 
          inc.productId === cur.productId && inc.variantId === cur.variantId
        );
        return { current: cur, incoming: incItem };
      })
    };

    return differences;
  };

  const calculateTotals = (items: ConflictItem[]) => {
    return items.reduce((total, item) => total + (item.price || 0) * item.qty, 0);
  };

  const handleSingleResolve = (strategy: string) => {
    if (!selectedConflict) return;
    onResolve(selectedConflict.id, strategy);
  };

  if (!isOpen || conflicts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cart Synchronization Conflict
            {conflicts.length > 1 && (
              <Badge variant="secondary">{conflicts.length} conflicts</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Your cart has been modified in another tab. Choose how to resolve the conflicts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conflict selection for multiple conflicts */}
          {conflicts.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select Conflict to Review:</h4>
              <div className="flex flex-wrap gap-2">
                {conflicts.map((conflict, index) => (
                  <Button
                    key={conflict.id}
                    variant={selectedConflict?.id === conflict.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    Conflict {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedConflict && (
            <div className="space-y-4">
              {/* Conflict info */}
              <div className="flex items-center gap-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  {getConflictDescription(selectedConflict)}
                </span>
                <Users className="h-4 w-4 text-amber-600 ml-auto" />
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  Tab ID: {selectedConflict.sourceTabId.slice(0, 6)}...
                </span>
              </div>

              {/* Item differences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current state */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Current Cart
                    <Badge variant="outline">
                      {calculateTotals(selectedConflict.currentValue).toLocaleString('en-NG', {
                        style: 'currency',
                        currency: 'NGN'
                      })}
                    </Badge>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedConflict.currentValue.map((item, index) => (
                      <div key={`current-${index}`} className="flex justify-between items-center p-2 bg-card rounded border">
                        <div>
                          <p className="text-sm font-medium">{item.productName || `Product ${item.productId}`}</p>
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Qty: {item.qty}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency((item.price || 0) * item.qty)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incoming state */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Other Tab's Cart
                    <Badge variant="outline">
                      {calculateTotals(selectedConflict.incomingValue).toLocaleString('en-NG', {
                        style: 'currency',
                        currency: 'NGN'
                      })}
                    </Badge>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedConflict.incomingValue.map((item, index) => (
                      <div key={`incoming-${index}`} className="flex justify-between items-center p-2 bg-card rounded border">
                        <div>
                          <p className="text-sm font-medium">{item.productName || `Product ${item.productId}`}</p>
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Qty: {item.qty}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency((item.price || 0) * item.qty)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed differences */}
              {(() => {
                const diffs = getItemDifferences(selectedConflict);
                return (
                  <div className="space-y-3">
                    {diffs.added.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                          Items Added in Other Tab ({diffs.added.length})
                        </h5>
                        <div className="space-y-1">
                          {diffs.added.map((item, index) => (
                            <div key={`added-${index}`} className="text-sm p-2 bg-green-50 dark:bg-green-950/20 rounded">
                              + {item.productName || `Product ${item.productId}`} (Qty: {item.qty})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diffs.removed.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                          Items Removed in Other Tab ({diffs.removed.length})
                        </h5>
                        <div className="space-y-1">
                          {diffs.removed.map((item, index) => (
                            <div key={`removed-${index}`} className="text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded">
                              - {item.productName || `Product ${item.productId}`} (Qty: {item.qty})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diffs.modified.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                          Quantity Changes ({diffs.modified.length})
                        </h5>
                        <div className="space-y-1">
                          {diffs.modified.map((diff, index) => (
                            <div key={`modified-${index}`} className="text-sm p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                              {diff.current.productName || `Product ${diff.current.productId}`}: 
                              {diff.current.qty} → {diff.incoming?.qty}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <Separator />

          {/* Resolution options */}
          <div className="space-y-4">
            <h4 className="font-medium">Choose Resolution Strategy:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => handleSingleResolve('last-write-wins')}
              >
                <div>
                  <div className="font-medium">Use Other Tab's Cart</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Replace current cart with the other tab's version
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => handleSingleResolve('keep-current')}
              >
                <div>
                  <div className="font-medium">Keep Current Cart</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Ignore changes from other tab
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => handleSingleResolve('cart-merge')}
              >
                <div>
                  <div className="font-medium">Smart Merge</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Combine items intelligently, sum quantities
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => handleSingleResolve('max-quantity')}
              >
                <div>
                  <div className="font-medium">Maximum Quantities</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Use higher quantity for each item
                  </div>
                </div>
              </Button>
            </div>

            {conflicts.length > 1 && (
              <div className="pt-4 border-t">
                <h5 className="font-medium mb-3">Resolve All Conflicts:</h5>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onResolveAll('cart-merge')}
                  >
                    Smart Merge All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onResolveAll('last-write-wins')}
                  >
                    Use Latest Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onResolveAll('keep-current')}
                  >
                    Keep Current State
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiTabConflictDialog;