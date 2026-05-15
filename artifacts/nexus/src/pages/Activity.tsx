import { motion } from "framer-motion";
import { 
  Bell, Sparkles, CheckCircle2, Clock, Calendar,
  MapPin, Users, ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/nexus/BottomNav";
import { GlassCard } from "@/components/nexus/Cards";
import { OrbitalBackground } from "@/components/nexus/GoldenRing";

const activities = [
  {
    id: "1",
    type: "golden_window",
    title: "Golden Window Found",
    subtitle: "Saturday, 7:00 PM",
    time: "9:41 AM",
    icon: Sparkles,
    iconBg: "bg-[#d4a853]/10 border-[#d4a853]/20",
    iconColor: "text-[#d4a853]",
  },
  {
    id: "2",
    type: "reservation",
    title: "Table held at The Bistro",
    subtitle: "Until 3:00 PM today",
    time: "9:42 AM",
    icon: MapPin,
    iconBg: "bg-green-500/10 border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "3",
    type: "confirmed",
    title: "Jay confirmed",
    subtitle: "Friday Drinks group",
    time: "9:45 AM",
    icon: CheckCircle2,
    iconBg: "bg-green-500/10 border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "4",
    type: "confirmed",
    title: "Sarah confirmed",
    subtitle: "Friday Drinks group",
    time: "9:46 AM",
    icon: CheckCircle2,
    iconBg: "bg-green-500/10 border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "5",
    type: "calendar_sync",
    title: "Calendar synced",
    subtitle: "Google Calendar connected",
    time: "Yesterday",
    icon: Calendar,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "6",
    type: "group_joined",
    title: "Joined Weekend Trip",
    subtitle: "Invited by Mike",
    time: "Yesterday",
    icon: Users,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
  },
];

export default function Activity() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#070b14]">
        <OrbitalBackground />
        
        <div className="relative px-4 pt-6 pb-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-2xl font-semibold text-white">Activity</h1>
              <p className="text-muted-foreground text-sm">Recent updates and notifications</p>
            </div>
            <button className="relative p-2 rounded-xl border border-[#d4a853]/10 text-muted-foreground hover:text-white hover:border-[#d4a853]/30 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d4a853]" />
            </button>
          </motion.header>

          {/* Activity List */}
          <div className="space-y-3">
            {activities.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-4" hoverable>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${activity.iconBg} border flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">
                          {activity.title}
                        </h3>
                        <p className="text-muted-foreground text-xs truncate">
                          {activity.subtitle}
                        </p>
                      </div>
                      <span className="text-muted-foreground/60 text-xs shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* View All */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-4 p-4 flex items-center justify-center gap-2 text-[#d4a853] text-sm font-medium"
          >
            View all activity
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </MobileLayout>
  );
}
