import React from 'react';
import { Folder, BookOpen } from 'lucide-react';
import { KnowledgeCategory } from '../../types/knowledge';

interface KnowledgeCategoriesCardProps {
  categories: {
    category: string;
    count: number;
  }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const KnowledgeCategoriesCard: React.FC<KnowledgeCategoriesCardProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getFolderColor = (cat: string) => {
    switch (cat) {
      case 'Products':
        return 'text-[#0284C7]';
      case 'Orders':
        return 'text-[#15966B]';
      case 'Delivery':
        return 'text-[#9333EA]';
      case 'FAQs & Policies':
        return 'text-[#C2410C]';
      case 'Business':
        return 'text-[#7E22CE]';
      case 'General':
      default:
        return 'text-[#D97706]';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#F3F4F6]">
        <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
          <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <h3 className="text-sm font-bold text-[#17243A]">Knowledge Categories</h3>
      </div>

      <div className="space-y-1.5 text-xs">
        {categories.map((item) => {
          const isSelected = selectedCategory === item.category;

          return (
            <button
              key={item.category}
              onClick={() =>
                onSelectCategory(isSelected ? 'All Categories' : item.category)
              }
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-left ${
                isSelected
                  ? 'bg-[#FFFBEB] text-[#17243A] font-bold border border-[#FDE68A]'
                  : 'hover:bg-[#FAF7F0] text-[#475569]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Folder
                  className={`w-4 h-4 stroke-[2] ${getFolderColor(item.category)}`}
                />
                <span className="font-semibold">{item.category}</span>
              </div>
              <span className="text-[11px] font-medium text-[#9CA3AF]">
                {item.count} {item.count === 1 ? 'document' : 'documents'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
