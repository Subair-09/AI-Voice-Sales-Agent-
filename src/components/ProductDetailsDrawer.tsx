import React, { useState } from 'react';
import {
  X,
  Package,
  Clock,
  Sparkles,
  Tag,
  Edit2,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Power,
  Upload,
} from 'lucide-react';
import { ProductRecord } from './ProductCatalogueTable';

interface ProductDetailsDrawerProps {
  product: ProductRecord | null;
  onClose?: () => void;
  onEditProduct?: (product: ProductRecord) => void;
  onToggleStatus?: (product: ProductRecord) => void;
  onUpdateStock?: (productId: string, stockQuantity: number, lowStockThreshold: number) => void;
  onUpdateCategory?: (productId: string, category: string) => void;
  onAddImage?: (productId: string, imageUrl: string) => void;
  onRemoveImage?: (productId: string, imageIndex: number) => void;
  onViewAllSales?: () => void;
  onViewOrder?: (orderId: string) => void;
  onDeleteProduct?: (product: ProductRecord) => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  product,
  onClose,
  onEditProduct,
  onToggleStatus,
  onUpdateStock,
  onUpdateCategory,
  onAddImage,
  onRemoveImage,
  onViewAllSales,
  onViewOrder,
  onDeleteProduct,
}) => {
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [stockQty, setStockQty] = useState(product?.stockQuantity || 50);
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold || 10);

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(product?.category || 'Breads');

  const [showAddImagePrompt, setShowAddImagePrompt] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Keep local state in sync when selected product changes
  React.useEffect(() => {
    if (product) {
      setStockQty(product.stockQuantity);
      setLowStockThreshold(product.lowStockThreshold);
      setSelectedCategory(product.category);
      setIsEditingStock(false);
      setIsEditingCategory(false);
      setShowAddImagePrompt(false);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs text-center text-[#64748B]">
        <p className="text-sm font-semibold text-[#17243A]">No product selected</p>
        <p className="text-xs mt-1">Select a product from the catalogue to view details.</p>
      </div>
    );
  }

  const handleSaveStock = () => {
    if (onUpdateStock) {
      onUpdateStock(product.id, stockQty, lowStockThreshold);
    }
    setIsEditingStock(false);
  };

  const handleSaveCategory = () => {
    if (onUpdateCategory) {
      onUpdateCategory(product.id, selectedCategory);
    }
    setIsEditingCategory(false);
  };

  const handleAddImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageUrl.trim() && onAddImage) {
      onAddImage(product.id, newImageUrl.trim());
      setNewImageUrl('');
      setShowAddImagePrompt(false);
    }
  };

  const categoriesList = [
    'Breads',
    'Cakes',
    'Cookies',
    'Cupcakes',
    'Brownies',
    'Pastries',
    'Snacks',
  ];

  const isActive = product.status === 'Active';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs space-y-6">
      {/* Header with Title and Close button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
        <h3 className="text-base font-bold text-[#17243A]">Product Details</h3>
        <div className="flex items-center gap-1.5">
          {onDeleteProduct && (
            <button
              onClick={() => onDeleteProduct(product)}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete this product"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#17243A] hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}
        </div>
      </div>

      {/* Product Hero Info */}
      <div className="flex items-start gap-4">
        {/* Large Product Image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[#E6E7EB]/80 bg-[#FAF7F0] shadow-xs">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=400&q=80';
            }}
          />
        </div>

        {/* Product Details Header Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base sm:text-lg font-bold text-[#17243A] leading-tight">
              {product.name}
            </h4>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-[#E8F7EF] text-[#15966B]'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {product.status}
            </span>
          </div>

          <p className="text-xs text-[#64748B] mt-0.5 font-normal">
            {product.subtitle}
          </p>

          <div className="mt-2">
            <span className="text-lg sm:text-xl font-black text-[#17243A]">
              {product.formattedPrice}
            </span>
          </div>

          <div className="mt-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF3E0] text-[#D97706]">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Compact Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Stock */}
        <div className="bg-[#FAF7F0] rounded-xl p-3 border border-[#F1EADA] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[#15966B] mb-1">
            <Package className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium text-[#64748B]">Stock</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#15966B] truncate">
            {product.stock}
          </span>
        </div>

        {/* Total Sold */}
        <div className="bg-[#FAF7F0] rounded-xl p-3 border border-[#F1EADA] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[#64748B] mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium text-[#64748B]">Total Sold</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#17243A]">
            {product.sales}
          </span>
        </div>

        {/* Added On */}
        <div className="bg-[#FAF7F0] rounded-xl p-3 border border-[#F1EADA] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[#D97706] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium text-[#64748B]">Added On</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#17243A] truncate">
            {product.addedOn}
          </span>
        </div>
      </div>

      {/* Description Section */}
      <div>
        <h5 className="text-xs font-bold text-[#17243A] uppercase tracking-wider mb-1.5">
          Description
        </h5>
        <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9]">
          {product.description}
        </p>
      </div>

      {/* Pricing & Inventory Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
            Pricing & Inventory
          </h5>
          {!isEditingStock ? (
            <button
              onClick={() => setIsEditingStock(true)}
              className="text-[11px] text-[#D97706] hover:text-[#B45309] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveStock}
                className="text-[11px] bg-[#15966B] text-white px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setStockQty(product.stockQuantity);
                  setLowStockThreshold(product.lowStockThreshold);
                  setIsEditingStock(false);
                }}
                className="text-[11px] text-[#64748B] hover:text-[#17243A] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 bg-[#FAF7F0] p-3 rounded-xl border border-[#F1EADA]">
          {/* Price */}
          <div>
            <div className="text-[11px] text-[#64748B] mb-0.5">Price</div>
            <div className="text-xs sm:text-sm font-bold text-[#17243A]">
              {product.formattedPrice}
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <div className="text-[11px] text-[#64748B] mb-0.5 flex items-center justify-between">
              <span>Stock Quantity</span>
            </div>
            {isEditingStock ? (
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-[#E6E7EB] rounded px-1.5 py-0.5 text-[#17243A]"
              />
            ) : (
              <div className="text-xs sm:text-sm font-bold text-[#17243A] flex items-center justify-between">
                <span>{product.stockQuantity}</span>
                <Edit2
                  onClick={() => setIsEditingStock(true)}
                  className="w-3 h-3 text-[#94A3B8] hover:text-[#17243A] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div>
            <div className="text-[11px] text-[#64748B] mb-0.5 flex items-center justify-between">
              <span>Low Stock Alert</span>
            </div>
            {isEditingStock ? (
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-[#E6E7EB] rounded px-1.5 py-0.5 text-[#17243A]"
              />
            ) : (
              <div className="text-xs sm:text-sm font-bold text-[#17243A] flex items-center justify-between">
                <span>{product.lowStockThreshold}</span>
                <Edit2
                  onClick={() => setIsEditingStock(true)}
                  className="w-3 h-3 text-[#94A3B8] hover:text-[#17243A] cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
            Product Categories
          </h5>
          {!isEditingCategory ? (
            <button
              onClick={() => setIsEditingCategory(true)}
              className="text-[11px] text-[#D97706] hover:text-[#B45309] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCategory}
                className="text-[11px] bg-[#15966B] text-white px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditingCategory(false)}
                className="text-[11px] text-[#64748B] hover:text-[#17243A] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditingCategory ? (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-9 px-3 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#F1EADA] bg-[#FAF7F0]">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="text-xs font-bold text-[#17243A]">
                {product.category}
              </span>
            </div>
            <Edit2
              onClick={() => setIsEditingCategory(true)}
              className="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#17243A] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Product Images Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
            Product Images
          </h5>
          <span className="text-[11px] text-[#94A3B8]">
            {product.images?.length || 1} images
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {product.images?.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative group w-16 h-16 rounded-xl overflow-hidden border border-[#E6E7EB] bg-[#FAF7F0] shrink-0"
            >
              <img
                src={imgUrl}
                alt={`Product thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=200&q=80';
                }}
              />
              {idx > 0 && onRemoveImage && (
                <button
                  onClick={() => onRemoveImage(product.id, idx)}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Upload / Add image square button */}
          <button
            onClick={() => setShowAddImagePrompt(!showAddImagePrompt)}
            className="w-16 h-16 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#F9B91A] flex flex-col items-center justify-center text-[#94A3B8] hover:text-[#D97706] hover:bg-[#FAF7F0] transition-colors cursor-pointer shrink-0"
            title="Add image"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add image input box if toggled */}
        {showAddImagePrompt && (
          <form onSubmit={handleAddImageSubmit} className="mt-2.5 flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 border border-[#E6E7EB] rounded-lg focus:outline-none focus:border-[#F9B91A]"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#F9B91A] hover:bg-[#ECAE0E] text-[#17243A] font-bold text-xs rounded-lg cursor-pointer"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* Recent Sales Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-bold text-[#17243A] uppercase tracking-wider">
            Recent Sales
          </h5>
          {onViewAllSales && (
            <button
              onClick={onViewAllSales}
              className="text-[11px] font-semibold text-[#D97706] hover:text-[#B45309] flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(!product.recentSales || product.recentSales.length === 0) ? (
            <div className="text-xs text-[#94A3B8] py-2 text-center bg-[#FAF7F0] rounded-xl border border-[#F1EADA]">
              No recent sales recorded yet
            </div>
          ) : (
            product.recentSales.map((sale, i) => (
              <div
                key={i}
                onClick={() => onViewOrder && onViewOrder(sale.orderId)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#F1F5F9] hover:border-[#E6E7EB] hover:bg-[#FAF7F0] transition-colors cursor-pointer text-xs"
              >
                <span className="text-[#64748B] font-medium">{sale.date}</span>
                <span className="font-bold text-[#17243A]">{sale.amount}</span>
                <span className="font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md text-[11px]">
                  {sale.orderId}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-2 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onEditProduct && onEditProduct(product)}
            className="flex-1 h-10 bg-[#F9B91A] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#17243A] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Edit Product</span>
          </button>

          <button
            onClick={() => onToggleStatus && onToggleStatus(product)}
            className={`flex-1 h-10 border font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isActive
                ? 'border-[#E2E8F0] hover:bg-stone-100 text-[#475569]'
                : 'border-[#15966B] bg-[#E8F7EF] text-[#15966B] hover:bg-[#D1FAE5]'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isActive ? 'Deactivate' : 'Activate Product'}</span>
          </button>
        </div>

        {onDeleteProduct && (
          <button
            onClick={() => onDeleteProduct(product)}
            className="w-full h-10 border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Permanently Delete Product</span>
          </button>
        )}
      </div>
    </div>
  );
};
