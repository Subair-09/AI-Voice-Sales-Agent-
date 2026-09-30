import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { ProductStatsCards } from './ProductStatsCards';
import { ProductCatalogueTable, ProductRecord } from './ProductCatalogueTable';
import { ProductDetailsDrawer } from './ProductDetailsDrawer';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { DeleteProductModal } from './DeleteProductModal';
import { BottomCtaCards } from './BottomCtaCards';
import { safeFetchJson } from '../utils/api';

interface ProductsViewProps {
  onAgentSettings?: () => void;
  onViewOrders?: (orderId?: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onAgentSettings,
  onViewOrders,
}) => {
  const [products, setProducts] = useState<ProductRecord[]>(() => {
    try {
      const saved = localStorage.getItem('baked_by_doja_cached_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('Jun 17, 2025 - Jun 24, 2025');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  const [productToDelete, setProductToDelete] = useState<ProductRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch products from backend API
  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        category: categoryFilter,
        status: statusFilter,
        page: currentPage.toString(),
        limit: '10',
      });

      const data = await safeFetchJson(`/api/admin/products?${queryParams.toString()}`);
      if (!data) return;

      const prods = data.products || [];
      setProducts(prods);
      try {
        localStorage.setItem('baked_by_doja_cached_products', JSON.stringify(prods));
      } catch (e) {}
      setTotalCount(data.totalCount || 0);
      setMetrics(data.metrics || null);

      // Auto select first product if none selected or if current selection was removed
      if (data.products && data.products.length > 0) {
        if (!selectedProduct || !data.products.find((p: ProductRecord) => p.id === selectedProduct.id)) {
          setSelectedProduct(data.products[0]);
        }
      } else {
        setSelectedProduct(null);
      }
    } catch {
      // Silently preserve cached products during reloads
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 8000);
    return () => clearInterval(interval);
  }, [searchQuery, categoryFilter, statusFilter, currentPage]);

  // Handler for stock update
  const handleUpdateStock = async (
    productId: string,
    stockQuantity: number,
    lowStockThreshold: number
  ) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity, lowStockThreshold }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? data.product : p))
        );
        if (selectedProduct?.id === productId) {
          setSelectedProduct(data.product);
        }
        showToast(`Stock updated for ${data.product.name} (${stockQuantity} units).`);
      }
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  // Handler for category update
  const handleUpdateCategory = async (productId: string, category: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? data.product : p))
        );
        if (selectedProduct?.id === productId) {
          setSelectedProduct(data.product);
        }
        showToast(`Category updated to "${category}".`);
      }
    } catch (err) {
      console.error('Failed to update category', err);
    }
  };

  // Handler for status toggle (Deactivate / Activate)
  const handleToggleStatus = async (product: ProductRecord) => {
    const newStatus = product.status === 'Active' ? 'Archived' : 'Active';
    try {
      const res = await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
        if (selectedProduct?.id === product.id) {
          setSelectedProduct(data.product);
        }
        showToast(
          `${data.product.name} is now ${newStatus === 'Active' ? 'Active' : 'Deactivated'}.`
        );
      }
    } catch (err) {
      console.error('Failed to update product status', err);
    }
  };

  // Handler for adding image
  const handleAddImage = async (productId: string, imageUrl: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        showToast('Image added to product gallery.');
      }
    } catch (err) {
      console.error('Failed to add image', err);
    }
  };

  // Handler for removing image
  const handleRemoveImage = async (productId: string, imageIndex: number) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageIndex}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        showToast('Image removed from gallery.');
      }
    } catch (err) {
      console.error('Failed to remove image', err);
    }
  };

  // Handler for duplicating product
  const handleDuplicateProduct = async (product: ProductRecord) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${product.name} (Copy)`,
          subtitle: product.subtitle,
          category: product.category,
          price: product.price,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          description: product.description,
          status: 'Draft',
          image: product.image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        setSelectedProduct(data.product);
        showToast(`Created duplicate "${data.product.name}".`);
      }
    } catch (err) {
      console.error('Failed to duplicate product', err);
    }
  };

  // Handler for opening delete confirmation modal
  const handleDeleteProduct = (product: ProductRecord) => {
    setProductToDelete(product);
  };

  // Handler for executing confirmed product deletion
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const target = productToDelete;
    const targetId = target.id || (target as any)._id;
    setIsDeleting(true);

    // Optimistically remove from state and cache immediately
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== target.id && (p as any)._id !== targetId);
      try {
        localStorage.setItem('baked_by_doja_cached_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (selectedProduct?.id === target.id || (selectedProduct as any)?._id === targetId) {
      setSelectedProduct(null);
    }

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Permanently deleted "${target.name}".`);
      } else {
        showToast(`Notice: ${data.message || data.error || 'Deleted'}`);
      }
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      showToast('Error removing product from database.');
      await fetchProducts();
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#17243A] text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-[#F9B91A]/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#F9B91A]" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-black text-[#17243A] tracking-tight">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Manage your product catalogue, inventory and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E6E7EB] rounded-xl text-xs font-semibold text-[#17243A] shadow-2xs hover:border-[#CBD5E1] transition-colors cursor-pointer">
            <Calendar className="w-4 h-4 text-[#64748B]" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </div>

          {/* + Add Product Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 bg-[#F9B91A] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#17243A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. PRODUCT METRIC CARDS (4 Cards) */}
      <ProductStatsCards metrics={metrics} />

      {/* 3. MAIN WORKSPACE GRID: CATALOGUE & DETAILS DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Catalogue (Span 8 or full if drawer closed) */}
        <div className={isDetailsVisible ? 'xl:col-span-8 space-y-5' : 'xl:col-span-12 space-y-5'}>
          <ProductCatalogueTable
            products={products}
            selectedProductId={selectedProduct?.id || ''}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setIsDetailsVisible(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalProductsCount={totalCount}
            onEditProduct={(prod) => {
              setSelectedProduct(prod);
              setIsEditModalOpen(true);
            }}
            onDuplicateProduct={handleDuplicateProduct}
            onUpdateStock={(prod) => {
              setSelectedProduct(prod);
              setIsDetailsVisible(true);
            }}
            onArchiveProduct={(prod) => handleToggleStatus(prod)}
            onDeleteProduct={handleDeleteProduct}
          />

          {/* Bottom CTA Cards */}
          <BottomCtaCards
            onAgentSettings={onAgentSettings}
            onManageProducts={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        {/* Right Column: Product Details Drawer (Span 4) */}
        {isDetailsVisible && (
          <div className="xl:col-span-4 sticky top-6">
            <ProductDetailsDrawer
              product={selectedProduct}
              onClose={() => setIsDetailsVisible(false)}
              onEditProduct={(prod) => {
                setSelectedProduct(prod);
                setIsEditModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onUpdateStock={handleUpdateStock}
              onUpdateCategory={handleUpdateCategory}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
              onViewAllSales={() => {
                if (onViewOrders) onViewOrders();
              }}
              onViewOrder={(orderId) => {
                if (onViewOrders) onViewOrders(orderId);
              }}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={(newProd) => {
          setProducts((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
          setSelectedProduct(newProd);
          setIsDetailsVisible(true);
          fetchProducts();
          showToast(`Successfully added "${newProd.name}" to catalogue.`);
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        product={selectedProduct}
        onClose={() => setIsEditModalOpen(false)}
        onProductUpdated={(updatedProd) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
          );
          setSelectedProduct(updatedProd);
          fetchProducts();
          showToast(`Successfully updated "${updatedProd.name}".`);
        }}
      />

      {/* Delete Product Confirmation Modal */}
      <DeleteProductModal
        isOpen={!!productToDelete}
        product={productToDelete}
        onClose={() => {
          if (!isDeleting) setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
