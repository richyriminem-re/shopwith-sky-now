/**
 * Form Recovery Dialog Component
 * Shows when saved form data is detected and allows user to recover or dismiss
 */

import React from 'react';
import { Clock, Shield, Trash2, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface SavedFormData {
  timestamp: number;
  fieldCount: number;
  secureFields: number;
  formType: string;
}

interface FormRecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecover: () => void;
  onDiscard: () => void;
  savedData: SavedFormData;
}

export const FormRecoveryDialog: React.FC<FormRecoveryDialogProps> = ({
  isOpen,
  onClose,
  onRecover,
  onDiscard,
  savedData
}) => {
  const timeAgo = formatDistanceToNow(new Date(savedData.timestamp), { addSuffix: true });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-500" />
            <AlertDialogTitle>Form Data Found</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              We found previously saved form data for your {savedData.formType}.
              Would you like to restore it?
            </p>
            
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Saved
                </span>
                <span className="text-muted-foreground">{timeAgo}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Fields saved</span>
                <Badge variant="secondary">{savedData.fieldCount}</Badge>
              </div>
              
              {savedData.secureFields > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-500" />
                    Encrypted fields
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {savedData.secureFields}
                  </Badge>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Your data is stored locally and {savedData.secureFields > 0 ? 'encrypted for security' : 'saved securely'}.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={onDiscard}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Discard
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRecover}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Restore Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};