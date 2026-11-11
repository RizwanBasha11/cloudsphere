import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    primary: 'bg-slateBlue/10 text-slateBlue border border-slateBlue/30',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    neutral: 'bg-gray-100 text-charcoal border border-[#CBCBCB]',
    slate: 'bg-[#6D8196]/15 text-[#4A4A4A] font-medium border border-[#6D8196]/30',
    engine: 'bg-[#FFFFE3] text-[#4A4A4A] border border-[#CBCBCB] font-mono text-[11px]',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
