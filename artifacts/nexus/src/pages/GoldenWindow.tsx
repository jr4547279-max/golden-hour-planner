import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Sparkles, MapPin, Clock,
  Users, CheckCircle2, Car, Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { MobileLayout } from "@/components/nexus/BottomNav";
import { GlassCard, GoldenButton } from "@/components/nexus/Cards";
import { GoldenRing, OrbitalBackground } from "@/components/nexus/GoldenRing";

// Mock data for demo
const mockGoldenWindow = {
  day: "Saturday",
  date: "January 25",
  time: "7:00 PM",
  duration: "4 hour window",
  timeRange: "7:00 PM - 11:00 PM",
  matchScore: 94,
  availableCount: 6,
  totalMembers: 6,
  avgTravelTime: "18 min",
  confidenceScore: 92,
  fairnessScore: 88,
  venue: {
    name: "The Bistro",
    type: "Modern European",
    tags: ["Vegan options"],
    travelTime: "18 min average drive",
    priceRange: "$$",
    priceEstimate: "$22-28 per person",
    image: "/placeholder-restaurant.jpg",
  },
  reasons: [
    "Everyone is free during this window",
    "Central location minimizes travel for all",
    "Matches group preference for evening meetups",
    "Venue fits dietary requirements",
  ],
  members: [
    { name: "Jay", initial: "J", confirmed: true },
    { name: "Sarah", initial: "S", confirmed: true },
    { name: "Mike", initial: "M", confirmed: false },
    { name: "Emma", initial: "E", confirmed: false },
    { name: "Chris", initial: "C", confirmed: false },
    { name: "Alex", initial: "A", confirmed: false },
  ],
};

function initials(name: string | null, email: string | null) {
  const src = name || email || "?";
  const p = src.split(/[\s@.]+/).filter(Boolean);
  return p.length >= 2 ? (p[0]![0]! + p[1]![0]!).toUpperCase() : src.slice(0, 2).toUpperCase();
}

function ScoreRing({ score, label, delay = 0 }: { score: number; label: string; delay?: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-24 h-24">
        <svg className="-rotate-90 absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={r}
            strokeWidth="4"
            stroke="rgba(212, 168, 83, 0.1)"
            fill="none"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={r}
            strokeWidth="4"
            stroke="#d4a853"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.3 }}
          />
        </svg>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
            className="text-2xl font-bold text-white"
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-2">{label}</span>
    </motion.div>
  );
}

export default function GoldenWindow() {
  useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ circleId: string }>();
  const circleId = params.circleId ?? "";
  const [showReasons, setShowReasons] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const { data: circle } = trpc.circles.getById.useQuery(
    { id: circleId },
    { enabled: Boolean(circleId) && circleId !== "demo" }
  );

  // Trigger reveal animation on mount
  useState(() => {
    setTimeout(() => setRevealed(true), 500);
  });

  const gw = mockGoldenWindow;
  const circleName = circle?.name ?? "Your Group";

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#070b14]">
        <OrbitalBackground />
        
        <div className="relative px-4 pt-6 pb-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <button
              onClick={() => setLocation(circleId && circleId !== "demo" ? `/circles/${circleId}` : "/circles")}
              className="p-2 rounded-xl border border-[#d4a853]/10 text-muted-foreground hover:text-white hover:border-[#d4a853]/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4a853]" />
                <h1 className="text-lg font-semibold text-white">Golden Window Found</h1>
              </div>
              <p className="text-muted-foreground text-xs">
                Everyone is free and within 20 min drive
              </p>
            </div>
          </motion.header>

          {/* Main Golden Window Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <GlassCard className="p-0 overflow-hidden border-[#d4a853]/30" glow>
              {/* Best Match Badge */}
              <div className="flex justify-center pt-4">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="px-4 py-1.5 rounded-full bg-[#d4a853] text-[#070b14] text-xs font-bold uppercase tracking-wider"
                >
                  Best Match
                </motion.div>
              </div>
              
              {/* Eclipse Ring Visual */}
              <div className="flex justify-center py-6 relative">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <GoldenRing size={180} />
                </motion.div>
                
                {/* Time overlay on the ring */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <span className="text-muted-foreground text-sm uppercase tracking-wider">
                    {gw.day}
                  </span>
                  <span className="text-4xl font-bold text-white mt-1">
                    {gw.time.split(" ")[0]}
                  </span>
                  <span className="text-[#d4a853] text-lg font-medium">
                    {gw.time.split(" ")[1]}
                  </span>
                  <span className="text-muted-foreground text-xs mt-1">
                    {gw.duration}
                  </span>
                  <span className="text-muted-foreground/60 text-[10px] mt-0.5">
                    {gw.timeRange}
                  </span>
                </motion.div>
              </div>
              
              {/* Members Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-3 pb-6"
              >
                <div className="flex -space-x-2">
                  {gw.members.slice(0, 5).map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1 + i * 0.1 }}
                      className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-medium">{m.initial}</span>
                    </motion.div>
                  ))}
                  {gw.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center">
                      <span className="text-xs text-[#d4a853]">+{gw.members.length - 5}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">All {gw.totalMembers} are free</span>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <GlassCard className="p-5">
              <div className="flex justify-around">
                <ScoreRing score={gw.matchScore} label="Match Score" delay={0.7} />
                <ScoreRing score={gw.confidenceScore} label="Confidence" delay={0.9} />
                <ScoreRing score={gw.fairnessScore} label="Fairness" delay={1.1} />
              </div>
            </GlassCard>
          </motion.div>

          {/* Venue Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <h3 className="text-white font-semibold uppercase text-xs tracking-wider mb-3">
              Recommended Spot
            </h3>
            <GlassCard className="p-4" hoverable>
              <div className="flex gap-4">
                {/* Venue image placeholder */}
                <div className="w-20 h-20 rounded-xl bg-[#1e293b] shrink-0 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-[#d4a853]/30" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{gw.venue.name}</h4>
                      <p className="text-muted-foreground text-sm">{gw.venue.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#d4a853] fill-[#d4a853]" />
                      <span className="text-white text-sm">4.5</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {gw.venue.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20">
                      {gw.venue.priceRange}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" />
                      <span>{gw.avgTravelTime} avg</span>
                    </div>
                    <span>{gw.venue.priceEstimate}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Why This Window - Expandable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-6"
          >
            <GlassCard className="overflow-hidden">
              <button
                onClick={() => setShowReasons(!showReasons)}
                className="w-full p-4 flex items-center justify-between"
              >
                <span className="text-white font-medium text-sm">Why this window?</span>
                {showReasons ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {showReasons && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2 border-t border-[#d4a853]/10 pt-4">
                      {gw.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[#d4a853] mt-0.5">-</span>
                          <p className="text-muted-foreground text-sm">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>

          {/* Confirm CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="space-y-3"
          >
            <GoldenButton 
              className="w-full"
              size="lg"
              icon={<Sparkles className="w-5 h-5" />}
            >
              Confirm & Book
            </GoldenButton>
            <p className="text-center text-muted-foreground text-xs">
              {"We'll hold the table for 15:00"}
            </p>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
}
