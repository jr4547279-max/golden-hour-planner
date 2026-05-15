import { useAuthContext } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { 
  Bell, ChevronRight, Plus, Calendar, CheckCircle2, 
  Loader2, Sparkles, Clock, Users
} from "lucide-react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/nexus/BottomNav";
import { GlassCard, GoldenButton, StatusBadge } from "@/components/nexus/Cards";
import { OrbitalBackground } from "@/components/nexus/GoldenRing";

// Mock data for demo purposes
const mockGroups = [
  { id: "1", name: "Friday Drinks", memberCount: 6, type: "friends", hasNotification: true, avatars: ["J", "S", "M"] },
  { id: "2", name: "Family Dinner", memberCount: 5, type: "family", hasNotification: false, avatars: ["D", "M"] },
  { id: "3", name: "Weekend Trip", memberCount: 4, type: "friends", hasNotification: false, avatars: ["A", "B", "C"] },
];

const mockUpcoming = [
  { id: "1", title: "Team Lunch", date: "Tomorrow, 12:30 PM", group: "Work Crew", confirmed: true },
  { id: "2", title: "Birthday Dinner", date: "Saturday, 7:00 PM", group: "Family", confirmed: false },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { user, loading, isAuthenticated } = useAuthContext();
  const [, setLocation] = useLocation();
  
  const displayName = (user?.user_metadata?.name as string | undefined) || 
    user?.email?.split("@")[0] || "there";

  const { data: circles, isLoading: circlesLoading } = trpc.circles.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // If not authenticated, redirect to landing
  if (!loading && !isAuthenticated) {
    setLocation("/landing");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-[#d4a853]" />
        </motion.div>
      </div>
    );
  }

  const groups = circles && circles.length > 0 ? circles : mockGroups;

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
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a853] to-[#a88432] flex items-center justify-center">
                <span className="text-[#070b14] font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white font-medium tracking-wide text-lg">Nexus</span>
            </div>
            
            <button className="relative p-2 rounded-xl border border-[#d4a853]/10 text-muted-foreground hover:text-white hover:border-[#d4a853]/30 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d4a853]" />
            </button>
          </motion.header>
          
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold text-white mb-1">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-muted-foreground">
              Ready to make something happen?
            </p>
          </motion.div>
          
          {/* Golden Window Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <GlassCard 
              className="p-5 border-[#d4a853]/20" 
              glow 
              hoverable
              onClick={() => setLocation("/golden-window/demo")}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a853]/20 to-[#d4a853]/5 border border-[#d4a853]/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-[#d4a853]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#d4a853] uppercase tracking-wider">
                      Golden Window Found
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Saturday at 7:00 PM</h3>
                  <p className="text-muted-foreground text-sm">
                    Everyone is free and within 20 min drive
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </GlassCard>
          </motion.div>
          
          {/* Groups Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold uppercase text-xs tracking-wider">
                Your Groups
              </h2>
              <button 
                onClick={() => setLocation("/circles")}
                className="text-[#d4a853] text-xs font-medium hover:text-[#e8c77d] transition-colors"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-3">
              {circlesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 text-[#d4a853] animate-spin" />
                </div>
              ) : (
                groups.slice(0, 3).map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                  >
                    <GlassCard
                      hoverable
                      onClick={() => setLocation(`/circles/${group.id}`)}
                      className="p-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Group icon */}
                        <div className="relative w-11 h-11 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-[#d4a853]" />
                          {"hasNotification" in group && group.hasNotification && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#d4a853] border-2 border-[#111827]" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{group.name}</h3>
                          <p className="text-muted-foreground text-sm">
                            {"memberCount" in group ? group.memberCount : 0} members
                          </p>
                        </div>
                        
                        {/* Avatars */}
                        {"avatars" in group && group.avatars && (
                          <div className="flex -space-x-2 mr-2">
                            {group.avatars.slice(0, 3).map((initial: string, idx: number) => (
                              <div 
                                key={idx}
                                className="w-7 h-7 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center"
                              >
                                <span className="text-xs text-muted-foreground">{initial}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
              
              {/* Create Group Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GoldenButton
                  onClick={() => setLocation("/circles")}
                  variant="secondary"
                  className="w-full"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create New Group
                </GoldenButton>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Calendar Sync Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm">Calendar Connected</h3>
                  <p className="text-muted-foreground text-xs">Last synced 5 min ago</p>
                </div>
                <StatusBadge status="synced" />
              </div>
            </GlassCard>
          </motion.div>
          
          {/* Upcoming Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold uppercase text-xs tracking-wider">
                Upcoming Plans
              </h2>
            </div>
            
            <div className="space-y-3">
              {mockUpcoming.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        plan.confirmed 
                          ? "bg-green-500/10 border border-green-500/20" 
                          : "bg-[#d4a853]/10 border border-[#d4a853]/20"
                      }`}>
                        {plan.confirmed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-[#d4a853]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{plan.title}</h3>
                        <p className="text-muted-foreground text-sm">{plan.date}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-[#1e293b]">
                        {plan.group}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
              
              {mockUpcoming.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No upcoming plans yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    Create a group and find your Golden Window
                  </p>
                </GlassCard>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
}
