import React from 'react';
import { AlertTriangle, Trash2, X, Loader2, Package } from 'lucide-react';
import { ProductRecord } from './ProductCatalogueTable';

interface DeleteProductModalProps {
  isOpen: boolean;
  product: ProductRecord | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17243A]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E6E7EB] shadow-2xl max-w-md w-full p-6 space-y-5 text-left transform transition-transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">
                Delete Product Permanently?
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                This action cannot be reversed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#17243A] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product preview card */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#EBE5D8] flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-[#E6E7EB]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                <Package className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#17243A] truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                {product.formattedPrice || `₦${(product.price || 0).toLocaleString()}`}
              </span>
              <span className="text-[11px] text-[#64748B]">
                {product.category || 'Bakery Loaf'}
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-1">
              ID: {product.id}
            </p>
          </div>
        </div>

        {/* Explanation message */}
        <div className="text-xs text-[#475569] leading-relaxed bg-red-50/60 p-3 rounded-xl border border-red-100 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>
            Permanently deletes this product from the MongoDB database, disk storage, active menu, and the AI voice agent.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#E6E7EB] bg-white hover:bg-stone-50 text-xs font-bold text-[#17243A] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Deleting from Database...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
