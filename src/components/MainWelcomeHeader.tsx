import React from 'react';
import { Calendar } from 'lucide-react';

export const MainWelcomeHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#17243A] tracking-tight flex items-center gap-2">
          <span>Good morning, Admin</span>
          <span className="inline-block animate-wave origin-bottom-right">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
          Here's what's happening with your bakery today.
        </p>
      </div>

      <div className="flex items-center gap-2.5 bg-white border border-[#E6E7EB] px-3.5 py-2 rounded-xl shadow-xs self-start sm:self-auto select-none">
        <Calendar className="w-4 h-4 text-[#17243A]" />
        <div className="text-left">
          <div className="text-xs font-semibold text-[#17243A] leading-tight">
            Tue, 24 Jun 2025
          </div>
          <div className="text-[11px] text-[#6B7280] leading-tight">
            9:42 AM
          </div>
        </div>
      </div>
    </div>
  );
};
