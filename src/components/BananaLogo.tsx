import React from 'react';

interface BananaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  centered?: boolean;
  className?: string;
}

export const BananaIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xs ${className}`}
    >
      {/* Banana Body */}
      <path
        d="M14 46C18 56 32 64 48 58C58 54 64 42 66 32C66.5 29.5 63.5 28 61.5 29.5C53 36 38 42 22 36C18 34.5 13 36 14 46Z"
        fill="#F9B914"
      />
      {/* Lower Shading / Highlight curve */}
      <path
        d="M17 48C21 57 34 62 47 57C54 54 59 47 62 38C52 44 36 45 22 39C18 41 16 45 17 48Z"
        fill="#F59E0B"
      />
      {/* Main Banana Contour */}
      <path
        d="M16 26C15 22 13 18 10 16C9 15 7.5 16 8 17.5C10 23 13 33 14 46C18 56 32 64 48 58C59 54 65 42 66.5 32C67 28.5 64.5 27 62 28.5C52 35 36 40 22 34C18 32.5 16 29 16 26Z"
        stroke="#2B1B12"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stem */}
      <path
        d="M11 16C12 12 14 9 17 8C18.5 7.5 19.5 9 19 10.5C18 13.5 17 17 16 22"
        stroke="#2B1B12"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M12 14L18 10"
        stroke="#5C3A21"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Tip */}
      <circle cx="66" cy="32" r="2.5" fill="#2B1B12" />
      {/* Inner Banana Ridge Line */}
      <path
        d="M18 36C28 41 42 41 58 31"
        stroke="#2B1B12"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Smile curve accent */}
      <path
        d="M34 50C38 52 42 51 45 48"
        stroke="#2B1B12"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BananaLogo: React.FC<BananaLogoProps> = ({
  size = 'md',
  showTagline = true,
  centered = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;
  const titleSize =
    size === 'sm'
      ? 'text-xl'
      : size === 'lg'
      ? 'text-3xl'
      : 'text-[26px] leading-tight';

  return (
    <div
      className={`flex items-center gap-3 select-none ${
        centered ? 'justify-center text-center' : 'text-left'
      } ${className}`}
    >
      <BananaIcon size={iconSize} />
      <div className="flex flex-col">
        <span
          className={`font-brand font-bold text-[#2B1B12] tracking-tight ${titleSize}`}
          style={{ fontFamily: "'Fredoka', 'Plus Jakarta Sans', cursive, sans-serif" }}
        >
          Baked by Doja
        </span>
        {showTagline && (
          <span className="text-xs sm:text-[13px] text-[#6B7280] font-normal tracking-normal -mt-0.5">
            Fresh Bakes. Happy People.
          </span>
        )}
      </div>
    </div>
  );
};
