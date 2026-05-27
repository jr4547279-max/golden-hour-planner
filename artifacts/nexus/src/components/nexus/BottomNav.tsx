import { motion } from "framer-motion";
import { Home, Users, Clock, User } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/circles", icon: Users, label: "Groups" },
  { path: "/activity", icon: Clock, label: "Activity" },
  { path: "/settings", icon: User, label: "Profile" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();
  
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1424]/95 backdrop-blur-xl border-t border-[#d4a853]/10"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-4"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.9,
                  opacity: isActive ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-[#d4a853]" : "text-muted-foreground"
                  }`} 
                />
              </motion.div>
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#d4a853]" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d4a853]"
                  style={{ boxShadow: "0 0 8px rgba(212, 168, 83, 0.6)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
