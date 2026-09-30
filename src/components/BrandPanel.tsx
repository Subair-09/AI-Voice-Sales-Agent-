import React from 'react';
import { Package, CreditCard, Users, BarChart2 } from 'lucide-react';
import { BananaLogo } from './BananaLogo';

const features = [
  {
    icon: Package,
    label: 'Real-time order tracking',
  },
  {
    icon: CreditCard,
    label: 'Payment confirmation',
  },
  {
    icon: Users,
    label: 'Customer management',
  },
  {
    icon: BarChart2,
    label: 'AI agent analytics',
  },
];

export const BrandPanel: React.FC = () => {
  return (
    <div className="relative w-full lg:w-1/2 min-h-[680px] lg:min-h-screen bg-[#F8F4EC] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Content Area */}
      <div className="relative z-10 p-8 sm:p-12 lg:p-14 xl:p-16 max-w-xl">
        {/* Brand Logo Lockup */}
        <div className="mb-8 sm:mb-10">
          <BananaLogo size="md" />
        </div>

        {/* AI Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#E9DFCE] shadow-[0_2px_8px_-2px_rgba(43,27,18,0.06)] mb-6">
          <span className="text-[#F9B914] text-xs font-bold leading-none">✦</span>
          <span className="text-xs font-medium text-[#18243A] tracking-tight">
            AI Sales Agent Admin
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-[46px] lg:text-[48px] font-bold text-[#2B1B12] leading-[1.12] tracking-tight mb-4">
          Manage Your Bakery,
          <br />
          <span className="relative inline-block font-script text-5xl sm:text-[56px] lg:text-[60px] text-[#F9B914] font-bold mt-1">
            Smarter.
            {/* Hand-drawn accent underline */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#F9B914]"
              viewBox="0 0 160 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8.5C38 4 102 3 157 8.5"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M18 10.5C52 7.5 98 7 138 10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </span>
        </h1>

        {/* Subhead text */}
        <p className="text-sm sm:text-[15px] text-[#374151] leading-relaxed max-w-md mb-8 font-normal">
          Track orders, monitor payments, manage customers
          <br className="hidden sm:inline" />
          and control your AI voice sales agent — all from one place.
        </p>

        {/* 4 Feature rows */}
        <div className="space-y-3.5 mb-10">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#FFE39A] text-[#2B1B12] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-sm font-semibold text-[#2B1B12] tracking-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bakery Photography Area (Lower Left) */}
      <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[46%] mt-auto overflow-hidden">
        {/* Soft gradient blend at top of photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-[#F8F4EC] pointer-events-none z-10" />

        {/* Banana Bread Photo */}
        <img
          src="/assets/banana-bread.jpg"
          alt="Freshly baked artisan banana bread loaf on a rustic wooden board with slices"
          className="w-full h-full object-cover object-center lg:object-[center_60%] transition-transform duration-700 hover:scale-102"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // High-grade fallback if local image is unavailable
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />

        {/* Styled Fallback / Ambient Bakery Illustration (in case photo is missing or loading) */}
        <div className="absolute inset-0 -z-1 bg-gradient-to-br from-[#E8D4B4] to-[#C49A6C] flex items-end p-8">
          <div className="text-[#3E2718]/40 font-bold text-4xl">Baked by Doja</div>
        </div>

        {/* Overlaid Handwritten Script & Heart Doodle */}
        <div className="absolute bottom-6 left-8 sm:bottom-8 sm:left-12 lg:left-16 z-20 pointer-events-none">
          <div className="font-script text-white text-2xl sm:text-3xl font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Same great taste.
            <br />
            Now with smart tools.
          </div>

          {/* Yellow Hand-Drawn Heart Doodle */}
          <div className="mt-1 ml-1 text-[#F9B914]">
            <svg
              width="36"
              height="30"
              viewBox="0 0 48 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              {/* Heart doodle stroke */}
              <path
                d="M12 20C6 14 6 6 15 4C21 2.5 24 9 24 9C24 9 27 2.5 33 4C42 6 42 14 36 20C30 26 24 33 24 33C24 33 18 26 12 20Z"
                stroke="#F9B914"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sparkle / Motion tick marks */}
              <path
                d="M39 10L43 8"
                stroke="#F9B914"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M41 15L45 15"
                stroke="#F9B914"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
