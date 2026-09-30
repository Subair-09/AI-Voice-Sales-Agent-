import React, { useState } from 'react';
import { X, Upload, Plus, AlertCircle } from 'lucide-react';
import { ProductRecord } from './ProductCatalogueTable';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (newProduct: ProductRecord) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Breads');
  const [price, setPrice] = useState('10000');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Active');
  const [image, setImage] = useState('');
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCloudinaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setIsUploadingToCloudinary(true);
      setError(null);
      try {
        const res = await fetch('/api/integrations/cloudinary/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            folder: 'baked-by-doja/products',
            tags: ['product', category.toLowerCase()],
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setImage(data.url);
        } else {
          setError(data.error || 'Cloudinary upload failed');
        }
      } catch (err: any) {
        setError(err.message || 'Image upload error');
      } finally {
        setIsUploadingToCloudinary(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const categories = [
    'Breads',
    'Cakes',
    'Cookies',
    'Cupcakes',
    'Brownies',
    'Pastries',
    'Snacks',
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
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subtitle: subtitle.trim() || 'Freshly Baked',
          category,
          price: numPrice,
          stockQuantity: numStock,
          lowStockThreshold: Number(lowStockThreshold) || 10,
          description: description.trim() || 'Artisanal baked goods prepared with finest quality ingredients.',
          status,
          image: image.trim() || '/assets/banana-bread.jpg',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      try {
        const saved = localStorage.getItem('baked_by_doja_cached_products');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift(data.product);
        localStorage.setItem('baked_by_doja_cached_products', JSON.stringify(list));
      } catch (e) {}

      onProductCreated(data.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the product');
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
            <h3 className="text-base font-bold text-[#17243A]">Add New Product</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Add a new item to your bakery catalogue and AI sales inventory.
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
                placeholder="e.g. Banana Bread"
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
                placeholder="e.g. Classic & Moist"
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
                placeholder="10000"
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
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Draft')}
                className="w-full h-10 px-3 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
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
                placeholder="50"
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
                placeholder="10"
                className="w-full h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
            </div>
          </div>

          {/* Image URL & Cloudinary Upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#17243A]">
                Product Image (Cloudinary CDN)
              </label>
              <label className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>{isUploadingToCloudinary ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCloudinaryUpload}
                  className="hidden"
                  disabled={isUploadingToCloudinary}
                />
              </label>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://res.cloudinary.com/... or paste image URL"
                className="flex-1 h-10 px-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A]"
              />
              {image && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E6E7EB] shrink-0 bg-stone-100">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Directly powered by Cloudinary asset management or default bakery loaf photo.
            </p>
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
              placeholder="Describe the freshly baked goodness, ingredients, allergens..."
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
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Creating...' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
