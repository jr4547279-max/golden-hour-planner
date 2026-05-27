import { useAuthContext } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  User, Calendar, Bell, Shield, ChevronRight, 
  LogOut, Settings2, Moon, Smartphone, 
  Mail, Lock, HelpCircle, FileText
} from "lucide-react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/nexus/BottomNav";
import { GlassCard, GoldenButton } from "@/components/nexus/Cards";
import { OrbitalBackground, GoldenRing } from "@/components/nexus/GoldenRing";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", subtitle: "Name, email, photo", path: "/settings/profile" },
      { icon: Lock, label: "Security", subtitle: "Password, 2FA", path: "/settings/security" },
      { icon: Mail, label: "Email Preferences", subtitle: "Notifications, updates", path: "/settings/email" },
    ],
  },
  {
    title: "Calendars",
    items: [
      { icon: Calendar, label: "Connected Calendars", subtitle: "Google Calendar", path: "/preferences", badge: "1" },
      { icon: Settings2, label: "Sync Settings", subtitle: "Frequency, permissions", path: "/settings/sync" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Moon, label: "Appearance", subtitle: "Dark mode (always on)", path: "/settings/appearance" },
      { icon: Bell, label: "Notifications", subtitle: "Push, email, reminders", path: "/settings/notifications" },
      { icon: Smartphone, label: "App Preferences", subtitle: "Language, timezone", path: "/settings/app" },
    ],
  },
  {
    title: "Privacy & Support",
    items: [
      { icon: Shield, label: "Privacy", subtitle: "Data, permissions", path: "/settings/privacy" },
      { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs, contact us", path: "/settings/help" },
      { icon: FileText, label: "Terms & Policies", subtitle: "Legal information", path: "/settings/legal" },
    ],
  },
];

export default function SettingsPage() {
  const { user, logout } = useAuthContext();
  const [, setLocation] = useLocation();
  
  const displayName = (user?.user_metadata?.name as string | undefined) || 
    user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#070b14]">
        <OrbitalBackground />
        
        <div className="relative px-4 pt-6 pb-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
          </motion.header>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <GlassCard className="p-5 border-[#d4a853]/20" glow>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a853] to-[#a88432] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#070b14]">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Mini golden ring decoration */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6">
                    <GoldenRing size={24} animate={false} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-lg truncate">{displayName}</h2>
                  <p className="text-muted-foreground text-sm truncate">{email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20">
                      Premium
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + sectionIndex * 0.05 }}
              >
                <h3 className="text-white font-semibold uppercase text-xs tracking-wider mb-3">
                  {section.title}
                </h3>
                <GlassCard className="divide-y divide-[#d4a853]/5">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setLocation(item.path)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-[#d4a853]/5 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#d4a853]" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-white font-medium text-sm">{item.label}</p>
                          <p className="text-muted-foreground text-xs">{item.subtitle}</p>
                        </div>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            {item.badge} connected
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <GoldenButton
              onClick={() => logout()}
              variant="secondary"
              className="w-full"
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </GoldenButton>
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground/40 text-xs mt-6"
          >
            Nexus v1.0.0
          </motion.p>
        </div>
      </div>
    </MobileLayout>
  );
}
