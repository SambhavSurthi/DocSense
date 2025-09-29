import React, { useMemo } from 'react';

// Lightweight CSS-driven particle dots for performance
const Particles: React.FC = () => {
  const dots = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-slate-900">
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {dots.map((i) => {
          const cx = Math.random() * 100;
          const cy = Math.random() * 100;
          const r = Math.random() * 1.8 + 0.6;
          return <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={r} fill="url(#g)" />;
        })}
        <defs>
          <radialGradient id="g">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Particles;


