import React, { useState } from 'react';
import { Search, ChevronDown, MoreVertical, ChevronLeft, ChevronRight, Eye, Edit, Copy, PackageCheck, Archive, Trash2 } from 'lucide-react';

export interface ProductRecord {
  id: string;
  name: string;
  subtitle: string;
  slug: string;
  category: string;
  price: number;
  formattedPrice: string;
  currency: string;
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  stockQuantity: number;
  lowStockThreshold: number;
  sales: number;
  status: 'Active' | 'Draft' | 'Out of Stock' | 'Archived';
  addedOn: string;
  description: string;
  image: string;
  images: string[];
  recentSales?: {
    date: string;
    amount: string;
    orderId: string;
  }[];
}

interface ProductCatalogueTableProps {
  products: ProductRecord[];
  selectedProductId: string;
  onSelectProduct: (product: ProductRecord) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalProductsCount?: number;
  onEditProduct?: (product: ProductRecord) => void;
  onDuplicateProduct?: (product: ProductRecord) => void;
  onUpdateStock?: (product: ProductRecord) => void;
  onArchiveProduct?: (product: ProductRecord) => void;
  onDeleteProduct?: (product: ProductRecord) => void;
}

export const ProductCatalogueTable: React.FC<ProductCatalogueTableProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  totalProductsCount = 0,
  onEditProduct,
  onDuplicateProduct,
  onUpdateStock,
  onArchiveProduct,
  onDeleteProduct,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const categories = [
    'All Categories',
    'Breads',
    'Cakes',
    'Cookies',
    'Cupcakes',
    'Brownies',
    'Pastries',
    'Snacks',
  ];

  const statuses = [
    'All Status',
    'Active',
    'Low Stock',
    'Out of Stock',
    'Draft',
    'Archived',
  ];

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'breads':
        return 'bg-[#FFF3E0] text-[#D97706]';
      case 'cakes':
        return 'bg-[#F3E8FF] text-[#9333EA]';
      case 'cookies':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'cupcakes':
        return 'bg-[#FCE7F3] text-[#DB2777]';
      case 'brownies':
        return 'bg-[#EDE9FE] text-[#7C3AED]';
      case 'pastries':
        return 'bg-[#CCFBF1] text-[#0D9488]';
      case 'snacks':
        return 'bg-[#FFEDD5] text-[#EA580C]';
      default:
        return 'bg-[#F1F5F9] text-[#475569]';
    }
  };

  const getStockBadgeClass = (stock: string) => {
    switch (stock) {
      case 'In Stock':
        return 'bg-[#E8F7EF] text-[#15966B]';
      case 'Low Stock':
        return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Out of Stock':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      default:
        return 'bg-[#F1F5F9] text-[#64748B]';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#E8F7EF] text-[#15966B]';
      case 'Draft':
        return 'bg-[#F1F5F9] text-[#64748B]';
      case 'Out of Stock':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      case 'Archived':
        return 'bg-[#F4F4F5] text-[#71717A]';
      default:
        return 'bg-[#F1F5F9] text-[#64748B]';
    }
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalProductsCount / itemsPerPage) || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProductsCount);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs flex flex-col justify-between">
      {/* Top Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-bold text-[#17243A]">
          Product Catalogue
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search field */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9B91A]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-white border border-[#E6E7EB] rounded-xl text-[#17243A] focus:outline-none focus:border-[#F9B91A] cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#F1F5F9] text-[#6B7280] font-semibold">
              <th className="pb-3.5 pr-4">Product</th>
              <th className="pb-3.5 pr-4">Category</th>
              <th className="pb-3.5 pr-4">Price</th>
              <th className="pb-3.5 pr-4">Stock</th>
              <th className="pb-3.5 pr-4">Status</th>
              <th className="pb-3.5 pr-4">Sales</th>
              <th className="pb-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B]">
                  <p className="font-semibold text-sm text-[#17243A]">No products found</p>
                  <p className="text-xs mt-1">Try another product name or category filter.</p>
                </td>
              </tr>
            ) : (
              products.map((prod) => {
                const isSelected = selectedProductId === prod.id;

                return (
                  <tr
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className={`transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#FAF7F0] font-medium'
                        : 'hover:bg-[#FAF7F0]/60'
                    }`}
                  >
                    {/* Product thumbnail + Title & Subtitle */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E6E7EB]/60 bg-[#FAF7F0]"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div>
                          <div className="font-bold text-[#17243A] text-xs leading-tight">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 font-normal">
                            {prod.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCategoryBadgeClass(
                          prod.category
                        )}`}
                      >
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 pr-4 font-bold text-[#17243A]">
                      {prod.formattedPrice}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStockBadgeClass(
                          prod.stock
                        )}`}
                      >
                        {prod.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClass(
                          prod.status
                        )}`}
                      >
                        {prod.status}
                      </span>
                    </td>

                    {/* Sales */}
                    <td className="py-3.5 pr-4 text-[#17243A] font-semibold">
                      {prod.sales}
                    </td>

                    {/* Actions Menu */}
                    <td
                      className="py-3.5 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {onDeleteProduct && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProduct(prod);
                            }}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === prod.id ? null : prod.id)
                          }
                          className="p-1 rounded-md text-[#94A3B8] hover:text-[#17243A] hover:bg-gray-100 transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown menu */}
                      {activeMenuId === prod.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-[#E6E7EB] py-1.5 z-30 text-left">
                            <button
                              onClick={() => {
                                onSelectProduct(prod);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>View Product</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onEditProduct) onEditProduct(prod);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>Edit Product</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onDuplicateProduct) onDuplicateProduct(prod);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>Duplicate Product</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onUpdateStock) onUpdateStock(prod);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <PackageCheck className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>Update Stock</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onArchiveProduct) onArchiveProduct(prod);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] flex items-center gap-2 cursor-pointer font-medium border-t border-[#F1F5F9]"
                            >
                              <Archive className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>Archive Product</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                if (onDeleteProduct) onDeleteProduct(prod);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete Product</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
        <div>
          Showing <span className="font-semibold text-[#17243A]">{startItem} - {endItem}</span> of{' '}
          <span className="font-semibold text-[#17243A]">{totalProductsCount}</span> products
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-lg border border-[#E6E7EB] flex items-center justify-center transition-colors ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed text-[#94A3B8]'
                : 'hover:bg-[#FAF7F0] text-[#17243A] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            const isActive = pg === currentPage;
            return (
              <button
                key={pg}
                onClick={() => onPageChange(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F9B91A] text-[#17243A] shadow-xs'
                    : 'border border-[#E6E7EB] text-[#64748B] hover:bg-[#FAF7F0] hover:text-[#17243A]'
                }`}
              >
                {pg}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded-lg border border-[#E6E7EB] flex items-center justify-center transition-colors ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed text-[#94A3B8]'
                : 'hover:bg-[#FAF7F0] text-[#17243A] cursor-pointer'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
