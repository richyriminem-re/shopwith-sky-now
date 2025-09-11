import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Trash2, Eye } from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import { mockProductsAPI, type CreateProductData, type UpdateProductData } from '@/services/mockProductsAPI';
import { ProductCreateEditModal } from '@/components/admin/ProductCreateEditModal';
import AdminDataTable, { type TableColumn, type TableAction } from '@/components/admin/AdminDataTable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { products } from '@/lib/products';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';

const AdminProducts: React.FC = () => {
  const { setCurrentView } = useAdminStore();
  const { toast } = useToast();
  const { isMobile } = useResponsiveDesign();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentView('products');
  }, [setCurrentView]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'secondary';
    return 'default';
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  const columns: TableColumn[] = [
    {
      key: 'title',
      label: 'Product',
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 flex-shrink-0">
            <img
              src={row.images[0]}
              alt={row.title}
              className="h-10 w-10 rounded-lg object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {row.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {row.brand || 'No brand'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'primaryCategory',
      label: 'Category',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value.replace('-', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'variants',
      label: 'Price',
      sortable: true,
      render: (variants: Product['variants']) => {
        const prices = variants.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        return (
          <div className="text-sm">
            {minPrice === maxPrice ? (
              <span className="font-medium">{formatPrice(minPrice)}</span>
            ) : (
              <span className="font-medium">
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'variants',
      label: 'Stock',
      sortable: true,
      render: (variants: Product['variants']) => {
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
        return (
          <Badge 
            variant={getStockBadgeVariant(totalStock) as any}
            className="text-xs"
          >
            {getStockLabel(totalStock)} ({totalStock})
          </Badge>
        );
      },
    },
    {
      key: 'variants',
      label: 'Variants',
      render: (variants: Product['variants']) => (
        <span className="text-sm text-muted-foreground">
          {variants.length} variant{variants.length !== 1 ? 's' : ''}
        </span>
      ),
    },
  ];

  const handleDeleteProduct = async (product: Product) => {
    try {
      await mockProductsAPI.deleteProduct(product.id);
      const updatedProducts = await mockProductsAPI.getProducts();
      setFilteredProducts(updatedProducts);
      toast({
        title: 'Product Deleted',
        description: `${product.title} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Delete product error:', error);
      toast({
        title: 'Delete Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const actions: TableAction[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (product: Product) => {
        window.open(`/product/${product.handle}`, '_blank');
      },
    },
    {
      label: 'Edit Product',
      icon: Edit,
      onClick: (product: Product) => {
        setEditingProduct(product);
      },
    },
    {
      label: 'Delete Product',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDeleteProduct,
    },
  ];

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await mockProductsAPI.searchProducts(query);
      setFilteredProducts(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (data: CreateProductData) => {
    setIsSubmitting(true);
    try {
      const newProduct = await mockProductsAPI.createProduct(data);
      const updatedProducts = await mockProductsAPI.getProducts();
      setFilteredProducts(updatedProducts);
      setShowCreateModal(false);
      toast({
        title: 'Product Created',
        description: `${newProduct.title} has been created successfully.`,
      });
    } catch (error) {
      console.error('Create product error:', error);
      toast({
        title: 'Create Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: CreateProductData) => {
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      const updateData: UpdateProductData = { ...data, id: editingProduct.id };
      await mockProductsAPI.updateProduct(updateData);
      const updatedProducts = await mockProductsAPI.getProducts();
      setFilteredProducts(updatedProducts);
      setEditingProduct(null);
      toast({
        title: 'Product Updated',
        description: `${data.title} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Update product error:', error);
      toast({
        title: 'Update Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-h2 font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your store's product catalog
          </p>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="tap-target-md"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new product listing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Products
              </p>
              <p className="text-xl font-bold lg:text-2xl">
                {products.length}
              </p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                In Stock
              </p>
              <p className="text-xl font-bold lg:text-2xl text-success">
                {products.filter(p => p.variants.some(v => v.stock > 0)).length}
              </p>
            </div>
            <div className="h-3 w-3 bg-success rounded-full" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Low Stock
              </p>
              <p className="text-xl font-bold lg:text-2xl text-warning">
                {products.filter(p => p.variants.some(v => v.stock > 0 && v.stock < 10)).length}
              </p>
            </div>
            <div className="h-3 w-3 bg-warning rounded-full" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Out of Stock
              </p>
              <p className="text-xl font-bold lg:text-2xl text-destructive">
                {products.filter(p => p.variants.every(v => v.stock === 0)).length}
              </p>
            </div>
            <div className="h-3 w-3 bg-destructive rounded-full" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <AdminDataTable
        title="Product Inventory"
        description="Manage your product catalog, pricing, and stock levels"
        columns={columns}
        data={filteredProducts}
        actions={actions}
        searchPlaceholder="Search products..."
        onSearch={handleSearch}
        isLoading={isLoading}
        emptyMessage="No products found. Add your first product to get started."
        pagination={{
          page: 1,
          pageSize: 20,
          total: filteredProducts.length,
          onPageChange: (page) => {
            // TODO: Implement pagination
            console.log('Page changed to:', page);
          },
        }}
      />
    </div>
  );
};

export default AdminProducts;