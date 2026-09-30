import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { ProductRecord } from './ProductCatalogueTable';

interface EditProductModalProps {
  isOpen: boolean;
  product: ProductRecord | null;
  onClose: () => void;
  onProductUpdated: (updatedProduct: ProductRecord) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onProductUpdated,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Breads');
  const [price, setPrice] = useState('10000');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Out of Stock' | 'Archived'>('Active');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSubtitle(product.subtitle || '');
      setCategory(product.category);
      setPrice(product.price.toString());
      setStockQuantity(product.stockQuantity.toString());
      setLowStockThreshold(product.lowStockThreshold.toString());
      setDescription(product.description || '');
      setStatus(product.status);
      setImage(product.image || '');
      setError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const categories = [
    'Breads',
    'Cakes',
    'Cookies',
    'Cupcakes',
    'Brownies',
    'Pastries',
    'Snacks',
  ];

  const statuses: ('Active' | 'Draft' | 'Out of Stock' | 'Archived')[] = [
    'Active',
    'Draft',
    'Out of Stock',
    'Archived',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a product name.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    const numStock = Number(stockQuantity);
    if (isNaN(numStock) || numStock < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subtitle: subtitle.trim(),
          category,
          price: numPrice,
          stockQuantity: numStock,
          lowStockThreshold: Number(lowStockThreshold) || 10,
          description: description.trim(),
          status,
          image: image.trim() || product.image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      try {
        const saved = localStorage.getItem('baked_by_doja_cached_products');
        if (saved) {
          const list = JSON.parse(saved);
          const idx = list.findIndex((p: any) => p.id === data.product.id);
          if (idx >= 0) {
            list[idx] = data.product;
            localStorage.setItem('baked_by_doja_cached_products', JSON.stringify(list));
          }
        }
      } catch (e) {}

      onProductUpdated(data.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#E6E7EB] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#FAF7F0]">
          <div>
            <h3 className="text-base font-bold text-[#17243A]">Edit Product</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Update pricing, inventory levels, category and description.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#17243A] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                required
                min="100"
                step="500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
            </div>

            {/* Low Stock Alert */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-[#17243A] mb-1">
              Product Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#17243A] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E6E7EB] text-xs font-semibold text-[#64748B] hover:text-[#17243A] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#ECAE0E] text-[#17243A] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
