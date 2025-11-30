import React from 'react';

export const OmSymbol = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`fill-current text-brahma-gold ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
     <text x="50" y="75" fontSize="80" textAnchor="middle" fontFamily="serif">ॐ</text>
  </svg>
);
