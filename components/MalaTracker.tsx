import React from 'react';
import { OmSymbol } from './OmSymbol';

interface MalaTrackerProps {
  completedDays: number;
}

export const MalaTracker: React.FC<MalaTrackerProps> = ({ completedDays }) => {
  const beads = 108;
  const radius = 120;
  const center = 150;
  
  const beadElements = Array.from({ length: beads }).map((_, i) => {
    // Start from top (-90 degrees)
    const angle = (i * (360 / beads)) - 90;
    const radian = (angle * Math.PI) / 180;
    const x = center + radius * Math.cos(radian);
    const y = center + radius * Math.sin(radian);
    
    // Milestones
    const isMilestone = [7, 21, 37, 60, 90, 108].includes(i + 1);
    const isCompleted = i < completedDays;
    
    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={isMilestone ? 6 : 3}
        className={`transition-all duration-500 ${
          isCompleted 
            ? 'fill-brahma-gold stroke-brahma-gold' 
            : 'fill-brahma-dark/20 stroke-none'
        }`}
      />
    );
  });

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-square flex items-center justify-center">
      <svg viewBox="0 0 300 300" className="w-full h-full rotate-0">
        {beadElements}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <OmSymbol className="w-16 h-16" />
        <div className="mt-2 text-brahma-dark font-serif font-bold text-2xl">
          {completedDays} / 108
        </div>
        <div className="text-brahma-dark/60 text-xs uppercase tracking-widest">Days</div>
      </div>
    </div>
  );
};