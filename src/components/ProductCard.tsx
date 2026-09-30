import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  onViewProducts?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ onViewProducts }) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E7EB] shadow-xs w-full lg:w-72 xl:w-80 flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden relative mb-4 bg-[#FAF7F0] border border-[#F1F5F9]">
        <img
          src="/assets/banana-bread.jpg"
          alt="Fresh Baked Banana Bread"
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80";
          }}
        />
      </div>

      {/* Product Details */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#17243A]">
          Fresh Banana Bread
        </h3>
        <p className="text-xs text-[#6B7280] mt-0.5 mb-4">
          Made with love, just for you.
        </p>

        {/* View Products CTA */}
        <button
          onClick={onViewProducts}
          className="w-full h-10 px-4 bg-[#F9B91A] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#17243A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>View Products</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
