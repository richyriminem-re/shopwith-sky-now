import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, GripVertical, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminFAQs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingFaq?.question || !editingFaq?.answer) {
      toast({
        title: 'Error',
        description: 'Question and answer are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      if (editingFaq.id) {
        // Update existing
        const { error } = await supabase
          .from('faqs')
          .update({
            question: editingFaq.question,
            answer: editingFaq.answer,
            is_active: editingFaq.is_active,
            display_order: editingFaq.display_order,
          })
          .eq('id', editingFaq.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'FAQ updated successfully',
        });
      } else {
        // Create new
        const maxOrder = Math.max(...faqs.map(f => f.display_order), 0);
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: editingFaq.question,
            answer: editingFaq.answer,
            is_active: editingFaq.is_active,
            display_order: maxOrder + 1,
          });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'FAQ created successfully',
        });
      }

      setShowDialog(false);
      setEditingFaq(null);
      loadFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to save FAQ',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaqId) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', deletingFaqId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'FAQ deleted successfully',
      });

      setDeletingFaqId(null);
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !faq.is_active })
        .eq('id', faq.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `FAQ ${!faq.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      loadFAQs();
    } catch (error) {
      console.error('Error toggling FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to update FAQ status',
        variant: 'destructive',
      });
    }
  };

  const handleMoveUp = async (faq: FAQ, index: number) => {
    if (index === 0) return;

    const prevFaq = faqs[index - 1];
    const updates = [
      supabase.from('faqs').update({ display_order: prevFaq.display_order }).eq('id', faq.id),
      supabase.from('faqs').update({ display_order: faq.display_order }).eq('id', prevFaq.id),
    ];

    try {
      await Promise.all(updates);
      loadFAQs();
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder FAQs',
        variant: 'destructive',
      });
    }
  };

  const handleMoveDown = async (faq: FAQ, index: number) => {
    if (index === faqs.length - 1) return;

    const nextFaq = faqs[index + 1];
    const updates = [
      supabase.from('faqs').update({ display_order: nextFaq.display_order }).eq('id', faq.id),
      supabase.from('faqs').update({ display_order: faq.display_order }).eq('id', nextFaq.id),
    ];

    try {
      await Promise.all(updates);
      loadFAQs();
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder FAQs',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage FAQs</h1>
          <p className="text-muted-foreground">Create and manage frequently asked questions</p>
        </div>
        <Button
          onClick={() => {
            setEditingFaq({
              id: '',
              question: '',
              answer: '',
              display_order: 0,
              is_active: true,
              created_at: '',
              updated_at: '',
            });
            setShowDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={faq.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex flex-col gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(faq, index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(faq, index)}
                      disabled={index === faqs.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <CardDescription className="mt-2">{faq.answer}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${faq.id}`} className="text-sm">
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </Label>
                    <Switch
                      id={`active-${faq.id}`}
                      checked={faq.is_active}
                      onCheckedChange={() => handleToggleActive(faq)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingFaq(faq);
                      setShowDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingFaqId(faq.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {faqs.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No FAQs yet</p>
                <Button
                  onClick={() => {
                    setEditingFaq({
                      id: '',
                      question: '',
                      answer: '',
                      display_order: 0,
                      is_active: true,
                      created_at: '',
                      updated_at: '',
                    });
                    setShowDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaq?.id ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
            <DialogDescription>
              {editingFaq?.id ? 'Update the FAQ details below' : 'Add a new FAQ to your help center'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={editingFaq?.question || ''}
                onChange={(e) =>
                  setEditingFaq(editingFaq ? { ...editingFaq, question: e.target.value } : null)
                }
                placeholder="Enter the question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={editingFaq?.answer || ''}
                onChange={(e) =>
                  setEditingFaq(editingFaq ? { ...editingFaq, answer: e.target.value } : null)
                }
                placeholder="Enter the answer"
                rows={6}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={editingFaq?.is_active || false}
                onCheckedChange={(checked) =>
                  setEditingFaq(editingFaq ? { ...editingFaq, is_active: checked } : null)
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingFaq?.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingFaqId} onOpenChange={() => setDeletingFaqId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the FAQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFAQs;
