import React from 'react';
import { Bell, CheckCircle, Coffee, Sparkles, XCircle } from 'lucide-react';

const STAGE_THEME = {
  placed:    { glow: '#f59e0b', ring: '#f59e0b', label: 'text-amber-300' },
  preparing: { glow: '#f97316', ring: '#f97316', label: 'text-orange-300' },
  ready:     { glow: '#38bdf8', ring: '#38bdf8', label: 'text-sky-300' },
  completed: { glow: '#34d399', ring: '#34d399', label: 'text-emerald-300' },
  cancelled: { glow: '#f87171', ring: '#f87171', label: 'text-rose-300' },
};

export default function BrewCup({ percent = 42, stage = 'preparing' }) {
  const fill = Math.max(8, Math.min(100, percent));
  const theme = STAGE_THEME[stage] || STAGE_THEME.placed;

  const showBell = stage === 'ready';
  const showCheck = stage === 'completed';
  const showCancel = stage === 'cancelled';
  const isBrewing = stage === 'preparing';

  const liquidHeight = 30 + fill * 0.94;
  const liquidY = 208 - liquidHeight;

  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - fill / 100);

  return (
    <div className="relative mx-auto flex h-72 w-72 select-none items-center justify-center">
      {/* ambient glow behind everything */}
      <div
        className="absolute inset-4 rounded-full blur-3xl transition-colors duration-700"
        style={{ backgroundColor: theme.glow, opacity: stage === 'ready' ? 0.35 : 0.2 }}
      />
      {stage === 'ready' && (
        <div
          className="absolute inset-4 rounded-full blur-3xl"
          style={{
            backgroundColor: theme.glow,
            opacity: 0.28,
            animation: 'pulseGlow 2.2s ease-in-out infinite',
          }}
        />
      )}

      {/* circular progress ring */}
      <svg viewBox="0 0 260 260" className="absolute h-full w-full -rotate-90">
        <circle cx="130" cy="130" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="130"
          cy="130"
          r={radius}
          fill="none"
          stroke={theme.ring}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${theme.ring})` }}
        />
      </svg>

      {/* the cup */}
      <svg viewBox="0 0 260 240" className="relative h-56 w-56 drop-shadow-[0_18px_35px_rgba(0,0,0,0.4)]">
        <defs>
          <linearGradient id="cupGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
          </linearGradient>
          <linearGradient id="cupRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd9a0" />
            <stop offset="100%" stopColor="#e9a45c" />
          </linearGradient>
          <linearGradient id="liquidFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8a5a24" />
            <stop offset="55%" stopColor="#5c3313" />
            <stop offset="100%" stopColor="#2a1608" />
          </linearGradient>
          <clipPath id="cupClip">
            <path d="M80 74 C82 60, 96 52, 130 52 C164 52, 178 60, 180 74 L192 182 C187 205, 166 222, 130 222 C94 222, 73 205, 68 182 Z" />
          </clipPath>
        </defs>

        <ellipse cx="130" cy="228" rx="80" ry="14" fill="rgba(0,0,0,0.25)" />

        {/* glass body */}
        <path
          d="M80 74 C82 60, 96 52, 130 52 C164 52, 178 60, 180 74 L192 182 C187 205, 166 222, 130 222 C94 222, 73 205, 68 182 Z"
          fill="url(#cupGlass)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2.5"
        />

        {/* liquid + animated waves */}
        <g clipPath="url(#cupClip)">
          <rect
            x="50"
            y={liquidY}
            width="180"
            height={240 - liquidY}
            fill="url(#liquidFill)"
            style={{ transition: 'y 900ms cubic-bezier(0.4,0,0.2,1)' }}
          />
          <g style={{ transform: `translateY(${liquidY}px)`, transition: 'transform 900ms cubic-bezier(0.4,0,0.2,1)' }}>
            <path
              d="M-40 0 C -10 -10, 20 10, 50 0 C 80 -10, 110 10, 140 0 C 170 -10, 200 10, 230 0 C 260 -10, 290 10, 320 0 L320 20 L-40 20 Z"
              fill="rgba(255,255,255,0.10)"
              className="wave-scroll-slow"
            />
            <path
              d="M-40 4 C -10 -6, 20 14, 50 4 C 80 -6, 110 14, 140 4 C 170 -6, 200 14, 230 4 C 260 -6, 290 14, 320 4 L320 24 L-40 24 Z"
              fill="rgba(0,0,0,0.15)"
              className="wave-scroll-fast"
            />
          </g>

          {isBrewing && (
            <>
              <circle cx="100" cy="180" r="3" className="bubble-rise" style={{ animationDelay: '0s' }} />
              <circle cx="130" cy="190" r="2.4" className="bubble-rise" style={{ animationDelay: '0.6s' }} />
              <circle cx="150" cy="175" r="2.8" className="bubble-rise" style={{ animationDelay: '1.2s' }} />
              <circle cx="115" cy="195" r="2" className="bubble-rise" style={{ animationDelay: '1.8s' }} />
            </>
          )}
        </g>

        {/* rim */}
        <ellipse cx="130" cy="76" rx="48" ry="11" fill="url(#cupRim)" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
        <ellipse cx="130" cy="76" rx="39" ry="7.5" fill="#2a1608" opacity="0.9" />

        {/* handle */}
        <path
          d="M182 88 C 205 90, 214 103, 214 118 C 214 136, 201 145, 189 145 C 184 145, 179 144, 175 142"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* glass shine */}
        <path d="M92 92 C 88 122, 88 155, 96 198" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="10" strokeLinecap="round" />

        {/* steam, only while not yet ready */}
        {(stage === 'placed' || stage === 'preparing') && (
          <>
            <path d="M112 24 C 104 36, 105 44, 112 54" fill="none" stroke="rgba(255,235,210,0.7)" strokeWidth="5" strokeLinecap="round" className="steam-wisp" />
            <path
              d="M132 16 C 122 32, 123 42, 131 55"
              fill="none"
              stroke="rgba(255,235,210,0.65)"
              strokeWidth="5"
              strokeLinecap="round"
              className="steam-wisp"
              style={{ animationDelay: '0.3s' }}
            />
            <path
              d="M150 28 C 143 39, 144 47, 150 58"
              fill="none"
              stroke="rgba(255,235,210,0.55)"
              strokeWidth="4"
              strokeLinecap="round"
              className="steam-wisp"
              style={{ animationDelay: '0.6s' }}
            />
          </>
        )}
      </svg>

      {/* status badge */}
      <div
        className={`absolute -bottom-2 flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/90 px-4 py-2 shadow-lg backdrop-blur ${
          stage === 'completed' ? 'badge-pop' : ''
        }`}
      >
        {showBell && <Bell size={18} className="text-sky-400 bell-shake" />}
        {showCheck && <CheckCircle size={18} className="text-emerald-400" />}
        {showCancel && <XCircle size={18} className="text-rose-400" />}
        {!showBell && !showCheck && !showCancel && <Coffee size={18} className="text-amber-400" />}
        <span className={`text-xs font-semibold uppercase tracking-wide ${theme.label}`}>
          {stage === 'placed' && 'Order Placed'}
          {stage === 'preparing' && 'Brewing'}
          {stage === 'ready' && 'Ready for Pickup'}
          {stage === 'completed' && 'Picked Up'}
          {stage === 'cancelled' && 'Cancelled'}
        </span>
      </div>

      {showCheck && <Sparkles size={16} className="absolute right-6 top-8 text-emerald-300 sparkle-pop" />}

      <style>{`
        @keyframes waveScrollSlow { from { transform: translateX(0); } to { transform: translateX(-90px); } }
        @keyframes waveScrollFast { from { transform: translateX(0); } to { transform: translateX(-90px); } }
        .wave-scroll-slow { animation: waveScrollSlow 3.2s linear infinite; }
        .wave-scroll-fast { animation: waveScrollFast 1.9s linear infinite reverse; }

        @keyframes bubbleRise {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-70px); opacity: 0; }
        }
        .bubble-rise { fill: rgba(255,220,180,0.55); animation: bubbleRise 2.4s ease-in infinite; }

        @keyframes steamWisp {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        .steam-wisp { animation: steamWisp 2.8s ease-in-out infinite; }

        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(5deg); }
        }
        .bell-shake { animation: bellShake 1.2s ease-in-out infinite; transform-origin: top center; }

        @keyframes badgePop {
          0% { transform: scale(0.85); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .badge-pop { animation: badgePop 480ms cubic-bezier(0.34,1.56,0.64,1); }

        @keyframes sparklePop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          40% { transform: scale(1.2) rotate(20deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        }
        .sparkle-pop { animation: sparklePop 600ms ease-out; }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}