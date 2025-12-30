
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon';
  id?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, variant = 'icon', id = 'main' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl transition-all hover:scale-105 duration-500"
      >
        <defs>
          <linearGradient id={`grad-${id}-orange`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id={`grad-${id}-yellow`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Gear - 12 Spokes */}
        <g className="animate-[spin_20s_linear_infinite] origin-center">
          <circle cx="60" cy="60" r="50" stroke="#854D0E" strokeWidth="1" fill="#FACC15" />
          {[...Array(12)].map((_, i) => (
            <rect
              key={i}
              x="54"
              y="4"
              width="12"
              height="8"
              fill="#EA580C"
              transform={`rotate(${i * 30} 60 60)`}
              stroke="#854D0E"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Inner Branding Circle */}
        <circle cx="60" cy="60" r="42" fill="#FDE047" stroke="#EA580C" strokeWidth="2" />
        
        {/* Association Name Path */}
        <path id={`textPath-${id}`} d="M 60, 60 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
        <text className="text-[5.5px] font-black fill-[#EA580C] tracking-tight uppercase">
          <textPath href={`#textPath-${id}`} startOffset="50%" textAnchor="middle">
            Nigerian Universities Engineering Students' Association
          </textPath>
        </text>

        {/* Center Graphic: The Truss/Building Emblems */}
        <g transform="translate(38, 42) scale(0.45)">
          {/* Stylized Building/Truss Shape */}
          <path d="M0 80 V20 L40 0 V60 H0" fill="#EA580C" opacity="0.9" />
          <path d="M40 0 L80 20 V80 H40 V0" fill="#9A3412" />
          {/* Windows / Structural Details */}
          {[...Array(6)].map((_, i) => (
            <rect key={i} x="48" y={25 + (i * 8)} width="24" height="4" fill="#FDE047" />
          ))}
          {/* Truss Lines */}
          <path d="M5 75 L35 25 M5 25 L35 75" stroke="#FDE047" strokeWidth="2" />
        </g>

        {/* UNIUYO Banner Layer */}
        <path 
          d="M25 85 Q60 80 95 85 L105 105 Q60 100 15 105 Z" 
          fill="#FACC15" 
          stroke="#854D0E" 
          strokeWidth="1" 
        />
        <text x="60" y="94" textAnchor="middle" className="text-[6px] font-black fill-[#EA580C] uppercase tracking-widest">
          Uniuyo Chapter
        </text>
        <text x="60" y="103" textAnchor="middle" className="text-[9px] font-black fill-[#065F46] uppercase tracking-tighter shadow-sm">
          NUESA
        </text>

        {/* Decorative Side Ribbon Ends */}
        <path d="M15 105 L5 112 L15 100" fill="#EAB308" stroke="#854D0E" />
        <path d="M105 105 L115 112 L105 100" fill="#EAB308" stroke="#854D0E" />
      </svg>
      
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-1">
            NUESA <span className="text-emerald-600 font-serif lowercase italic tracking-normal">scholars</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-orange-600 dark:text-orange-500 tracking-[0.25em] uppercase">
              Uniuyo Node
            </span>
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              nuesascholars.org
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
