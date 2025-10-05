import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

type ShippingMethod = {
  id: string;
  name: string;
  cost: number;
  estimated_delivery: string;
  is_active: boolean;
  display_order: number;
};

type PromoCode = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  description: string | null;
  min_order_amount: number | null;
  max_discount: number | null;
  expiry_date: string | null;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
};

const AdminShippingPromos = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  // Shipping method dialog state
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
  const [shippingForm, setShippingForm] = useState({
    name: '',
    cost: '',
    estimated_delivery: '',
    is_active: true,
  });

  // Promo code dialog state
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'shipping',
    discount_value: '',
    description: '',
    min_order_amount: '',
    max_discount: '',
    expiry_date: '',
    is_active: true,
    usage_limit: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shippingRes, promoRes, settingsRes] = await Promise.all([
        supabase.from('shipping_methods').select('*').order('display_order'),
        supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*').eq('setting_key', 'free_shipping_threshold').single(),
      ]);

      if (shippingRes.data) setShippingMethods(shippingRes.data);
      if (promoRes.data) setPromoCodes(promoRes.data);
      if (settingsRes.data) setFreeShippingThreshold(settingsRes.data.setting_value);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Shipping Methods
  const handleSaveShipping = async () => {
    const data = {
      name: shippingForm.name,
      cost: parseFloat(shippingForm.cost),
      estimated_delivery: shippingForm.estimated_delivery,
      is_active: shippingForm.is_active,
    };

    try {
      if (editingShipping) {
        const { error } = await supabase
          .from('shipping_methods')
          .update(data)
          .eq('id', editingShipping.id);
        if (error) throw error;
        toast.success('Shipping method updated');
      } else {
        const { error } = await supabase.from('shipping_methods').insert(data);
        if (error) throw error;
        toast.success('Shipping method added');
      }
      setShippingDialogOpen(false);
      resetShippingForm();
      fetchData();
    } catch (error) {
      console.error('Error saving shipping method:', error);
      toast.error('Failed to save shipping method');
    }
  };

  const handleDeleteShipping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) return;
    try {
      const { error } = await supabase.from('shipping_methods').delete().eq('id', id);
      if (error) throw error;
      toast.success('Shipping method deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      toast.error('Failed to delete shipping method');
    }
  };

  const resetShippingForm = () => {
    setShippingForm({
      name: '',
      cost: '',
      estimated_delivery: '',
      is_active: true,
    });
    setEditingShipping(null);
  };

  const openShippingDialog = (shipping?: ShippingMethod) => {
    if (shipping) {
      setEditingShipping(shipping);
      setShippingForm({
        name: shipping.name,
        cost: shipping.cost.toString(),
        estimated_delivery: shipping.estimated_delivery,
        is_active: shipping.is_active,
      });
    } else {
      resetShippingForm();
    }
    setShippingDialogOpen(true);
  };

  // Promo Codes
  const handleSavePromo = async () => {
    const data = {
      code: promoForm.code.toUpperCase(),
      discount_type: promoForm.discount_type,
      discount_value: parseFloat(promoForm.discount_value),
      description: promoForm.description || null,
      min_order_amount: promoForm.min_order_amount ? parseFloat(promoForm.min_order_amount) : null,
      max_discount: promoForm.max_discount ? parseFloat(promoForm.max_discount) : null,
      expiry_date: promoForm.expiry_date || null,
      is_active: promoForm.is_active,
      usage_limit: promoForm.usage_limit ? parseInt(promoForm.usage_limit) : null,
    };

    try {
      if (editingPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update(data)
          .eq('id', editingPromo.id);
        if (error) throw error;
        toast.success('Promo code updated');
      } else {
        const { error } = await supabase.from('promo_codes').insert(data);
        if (error) throw error;
        toast.success('Promo code added');
      }
      setPromoDialogOpen(false);
      resetPromoForm();
      fetchData();
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error('Failed to save promo code');
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promo code deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Failed to delete promo code');
    }
  };

  const resetPromoForm = () => {
    setPromoForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      description: '',
      min_order_amount: '',
      max_discount: '',
      expiry_date: '',
      is_active: true,
      usage_limit: '',
    });
    setEditingPromo(null);
  };

  const openPromoDialog = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        code: promo.code,
        discount_type: promo.discount_type as 'percentage' | 'fixed' | 'shipping',
        discount_value: promo.discount_value.toString(),
        description: promo.description || '',
        min_order_amount: promo.min_order_amount?.toString() || '',
        max_discount: promo.max_discount?.toString() || '',
        expiry_date: promo.expiry_date ? promo.expiry_date.split('T')[0] : '',
        is_active: promo.is_active,
        usage_limit: promo.usage_limit?.toString() || '',
      });
    } else {
      resetPromoForm();
    }
    setPromoDialogOpen(true);
  };

  // Free Shipping Threshold
  const handleUpdateThreshold = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: freeShippingThreshold })
        .eq('setting_key', 'free_shipping_threshold');
      if (error) throw error;
      toast.success('Free shipping threshold updated');
    } catch (error) {
      console.error('Error updating threshold:', error);
      toast.error('Failed to update threshold');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shipping & Promotions</h1>
        <p className="text-muted-foreground mt-2">Manage shipping methods, promo codes, and settings</p>
      </div>

      {/* Free Shipping Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Free Shipping Threshold</CardTitle>
          <CardDescription>Set minimum order amount for free shipping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="threshold">Minimum Order Amount (₦)</Label>
              <Input
                id="threshold"
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdateThreshold}>Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Methods */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Shipping Methods</CardTitle>
              <CardDescription>Manage available shipping options</CardDescription>
            </div>
            <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openShippingDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingShipping ? 'Edit' : 'Add'} Shipping Method</DialogTitle>
                  <DialogDescription>Configure shipping method details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shipping-name">Name</Label>
                    <Input
                      id="shipping-name"
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      placeholder="Standard Shipping"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-cost">Cost (₦)</Label>
                    <Input
                      id="shipping-cost"
                      type="number"
                      value={shippingForm.cost}
                      onChange={(e) => setShippingForm({ ...shippingForm, cost: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-delivery">Estimated Delivery</Label>
                    <Input
                      id="shipping-delivery"
                      value={shippingForm.estimated_delivery}
                      onChange={(e) => setShippingForm({ ...shippingForm, estimated_delivery: e.target.value })}
                      placeholder="5-7 business days"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="shipping-active"
                      checked={shippingForm.is_active}
                      onCheckedChange={(checked) => setShippingForm({ ...shippingForm, is_active: checked })}
                    />
                    <Label htmlFor="shipping-active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShippingDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveShipping}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="hidden sm:table-cell">Delivery Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippingMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{formatCurrency(method.cost)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{method.estimated_delivery}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        method.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {method.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openShippingDialog(method)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteShipping(method.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Promo Codes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Promo Codes</CardTitle>
              <CardDescription>Manage discount codes and promotions</CardDescription>
            </div>
            <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openPromoDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPromo ? 'Edit' : 'Add'} Promo Code</DialogTitle>
                  <DialogDescription>Configure promo code details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promo-code">Code</Label>
                      <Input
                        id="promo-code"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        placeholder="SAVE20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promo-type">Discount Type</Label>
                      <Select value={promoForm.discount_type} onValueChange={(value: any) => setPromoForm({ ...promoForm, discount_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="shipping">Free Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="promo-value">
                      {promoForm.discount_type === 'percentage' ? 'Discount (%)' : 'Discount Amount (₦)'}
                    </Label>
                    <Input
                      id="promo-value"
                      type="number"
                      value={promoForm.discount_value}
                      onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                      placeholder={promoForm.discount_type === 'percentage' ? '20' : '10000'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="promo-description">Description</Label>
                    <Input
                      id="promo-description"
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      placeholder="20% off your order"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promo-min">Min Order (₦)</Label>
                      <Input
                        id="promo-min"
                        type="number"
                        value={promoForm.min_order_amount}
                        onChange={(e) => setPromoForm({ ...promoForm, min_order_amount: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promo-max">Max Discount (₦)</Label>
                      <Input
                        id="promo-max"
                        type="number"
                        value={promoForm.max_discount}
                        onChange={(e) => setPromoForm({ ...promoForm, max_discount: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promo-expiry">Expiry Date</Label>
                      <Input
                        id="promo-expiry"
                        type="date"
                        value={promoForm.expiry_date}
                        onChange={(e) => setPromoForm({ ...promoForm, expiry_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="promo-limit">Usage Limit</Label>
                      <Input
                        id="promo-limit"
                        type="number"
                        value={promoForm.usage_limit}
                        onChange={(e) => setPromoForm({ ...promoForm, usage_limit: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="promo-active"
                      checked={promoForm.is_active}
                      onCheckedChange={(checked) => setPromoForm({ ...promoForm, is_active: checked })}
                    />
                    <Label htmlFor="promo-active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSavePromo}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="hidden md:table-cell">Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                    <TableCell className="capitalize">{promo.discount_type}</TableCell>
                    <TableCell>
                      {promo.discount_type === 'percentage' 
                        ? `${promo.discount_value}%` 
                        : promo.discount_type === 'shipping'
                        ? 'Free'
                        : formatCurrency(promo.discount_value)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {promo.usage_count}{promo.usage_limit ? `/${promo.usage_limit}` : ''}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openPromoDialog(promo)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePromo(promo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShippingPromos;
