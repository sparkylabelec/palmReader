
import React from 'react';

const ScanningOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      <div className="scanning-line absolute w-full left-0 top-0"></div>
      <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-xs font-bold tracking-widest uppercase">
        Analyzing Patterns...
      </div>
    </div>
  );
};

export default ScanningOverlay;
