import { motion } from "framer-motion";

interface GoldenRingProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function GoldenRing({ size = 200, className = "", animate = true }: GoldenRingProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      
      {/* Main ring */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        animate={animate ? { rotate: 360 } : undefined}
        transition={animate ? { duration: 60, repeat: Infinity, ease: "linear" } : undefined}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a853" />
            <stop offset="50%" stopColor="#e8c77d" />
            <stop offset="100%" stopColor="#a88432" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ring */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="3"
          filter="url(#glow)"
          opacity="0.9"
        />
        
        {/* Highlight arc */}
        <motion.circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="#e8c77d"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="50 480"
          animate={animate ? { 
            strokeDashoffset: [0, -530] 
          } : undefined}
          transition={animate ? { 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear" 
          } : undefined}
        />
      </motion.svg>
      
      {/* Inner glow */}
      <div 
        className="absolute inset-[15%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212, 168, 83, 0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

interface EclipseLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function EclipseLogo({ size = 120, className = "", showText = true }: EclipseLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <GoldenRing size={size} animate />
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <h1 
            className="text-3xl font-light tracking-[0.3em] text-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            NEXUS
          </h1>
          <p className="text-[#d4a853] text-sm tracking-wide mt-1">
            Plans, perfectly aligned.
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface OrbitalBackgroundProps {
  className?: string;
}

export function OrbitalBackground({ className = "" }: OrbitalBackgroundProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Primary glow - top */}
      <div 
        className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212, 168, 83, 0.08) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      
      {/* Secondary glow - bottom right */}
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212, 168, 83, 0.05) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />
      
      {/* Subtle orbital rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-[600px] h-[600px] rounded-full border border-[#d4a853]/5" />
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-[800px] h-[800px] rounded-full border border-[#d4a853]/3" />
      </motion.div>
    </div>
  );
}
