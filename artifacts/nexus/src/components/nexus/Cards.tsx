import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glow?: boolean;
}

export function GlassCard({ 
  children, 
  className = "", 
  onClick, 
  hoverable = false,
  glow = false 
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={`
        bg-[#111827]/80 backdrop-blur-xl 
        border border-[#d4a853]/10 rounded-2xl
        ${hoverable ? "hover:border-[#d4a853]/20 cursor-pointer transition-all duration-300" : ""}
        ${glow ? "shadow-[0_0_30px_rgba(212,168,83,0.1)]" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

interface GroupCardProps {
  name: string;
  memberCount: number;
  avatars?: string[];
  emoji?: string;
  onClick?: () => void;
  hasNotification?: boolean;
}

export function GroupCard({ 
  name, 
  memberCount, 
  avatars = [], 
  emoji,
  onClick,
  hasNotification = false
}: GroupCardProps) {
  return (
    <GlassCard 
      onClick={onClick}
      hoverable
      className="p-4"
    >
      <div className="flex items-center gap-3">
        {/* Group icon */}
        <div className="relative w-12 h-12 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0">
          {emoji ? (
            <span className="text-xl">{emoji}</span>
          ) : (
            <span className="text-lg font-bold text-[#d4a853]">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          {hasNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#d4a853] border-2 border-[#111827]" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{name}</h3>
          <p className="text-muted-foreground text-sm">{memberCount} members</p>
        </div>
        
        {/* Avatars */}
        {avatars.length > 0 && (
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((avatar, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground">{avatar}</span>
              </div>
            ))}
            {avatars.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center">
                <span className="text-xs text-[#d4a853]">+{avatars.length - 3}</span>
              </div>
            )}
          </div>
        )}
        
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </GlassCard>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-12 h-12 rounded-xl bg-[#1e293b] border border-[#d4a853]/10 flex items-center justify-center mb-3">
        <span className="text-[#d4a853]">{icon}</span>
      </div>
      <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  );
}

interface GoldenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function GoldenButton({ 
  children, 
  onClick, 
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  icon
}: GoldenButtonProps) {
  const baseStyles = "flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#d4a853] text-[#070b14] hover:bg-[#e8c77d] shadow-[0_0_20px_rgba(212,168,83,0.3)]",
    secondary: "bg-[#1e293b] text-white border border-[#d4a853]/20 hover:border-[#d4a853]/40",
    ghost: "bg-transparent text-[#d4a853] hover:bg-[#d4a853]/10",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
}

interface StatusBadgeProps {
  status: "synced" | "pending" | "offline";
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    synced: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-[#d4a853]/20 text-[#d4a853] border-[#d4a853]/30",
    offline: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  
  const defaultLabels = {
    synced: "Synced",
    pending: "Pending",
    offline: "Offline",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "synced" ? "bg-green-400" :
        status === "pending" ? "bg-[#d4a853]" :
        "bg-slate-400"
      }`} />
      {label || defaultLabels[status]}
    </span>
  );
}
