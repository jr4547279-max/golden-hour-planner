import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Loader2, ArrowLeft, Zap, Users, CalendarDays,
  AlertCircle, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvailabilityModal from "@/components/AvailabilityModal";

// ─── Types mirrored from engine ───────────────────────────────────────────────
interface ScoreBreakdown {
  availability: number;
  timePreference: number;
  vibe: number;
  venue: number;
  budget: number;
  cuisine: number;
  dietary: number;
}

interface GoldenWindowResult {
  day: string;
  timeSlot: string;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  availableCount: number;
  totalMembers: number;
  availableMembers: Array<{ name: string | null; email: string | null }>;
  suggestedVibe: string | null;
  suggestedVenueType: string | null;
  suggestedBudget: string | null;
  suggestedCuisines: string[];
  suggestedFoodType: string | null;
  travelFit: string | null;
  dietaryNote: string | null;
  vibeLabel: string | null;
  venueLabel: string | null;
  vibeEmoji: string | null;
  explanation: string;
  explanationPoints: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TIME_LABELS: Record<string, string> = {
  morning: "Morning", afternoon: "Afternoon", evening: "Evening", late_night: "Late Night",
};
const TIME_HOURS: Record<string, string> = {
  morning: "6am – 12pm", afternoon: "12pm – 6pm", evening: "6pm – 10pm", late_night: "10pm+",
};
const TIME_GRADIENTS: Record<string, string> = {
  morning:   "from-orange-500 to-amber-600",
  afternoon: "from-sky-500 to-blue-600",
  evening:   "from-purple-600 to-violet-700",
  late_night:"from-slate-600 to-slate-800",
};
const TIME_GLOWS: Record<string, string> = {
  morning:   "shadow-[0_0_40px_rgba(251,146,60,0.12)]",
  afternoon: "shadow-[0_0_40px_rgba(56,189,248,0.10)]",
  evening:   "shadow-[0_0_40px_rgba(168,85,247,0.12)]",
  late_night:"shadow-[0_0_20px_rgba(100,116,139,0.08)]",
};

const RANK_META = [
  {
    border: "border-amber-500/50",
    topBar: "from-amber-400 to-amber-600",
    badge: "bg-amber-500 text-[#0a0a1a]",
    label: "Best Match",
    glow: "shadow-[0_0_48px_rgba(245,158,11,0.14)]",
    ring: "#f59e0b",
  },
  {
    border: "border-blue-600/40",
    topBar: "from-blue-500 to-blue-700",
    badge: "bg-blue-700 text-white",
    label: "2nd",
    glow: "shadow-[0_0_24px_rgba(59,130,246,0.10)]",
    ring: "#3b82f6",
  },
  {
    border: "border-slate-600/40",
    topBar: "from-slate-500 to-slate-700",
    badge: "bg-slate-700 text-white",
    label: "3rd",
    glow: "",
    ring: "#64748b",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string | null, email: string | null) {
  const src = name || email || "?";
  const p = src.split(/[\s@.]+/).filter(Boolean);
  return p.length >= 2 ? (p[0]![0]! + p[1]![0]!).toUpperCase() : src.slice(0, 2).toUpperCase();
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 30, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg className="-rotate-90 absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} strokeWidth="5" stroke="rgba(255,255,255,0.06)" fill="none" />
        <motion.circle
          cx="40" cy="40" r={r}
          strokeWidth="5"
          stroke={color}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      {/* Glow circle behind */}
      {score >= 80 && (
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-md"
          style={{ background: color }}
        />
      )}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-xl font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] text-white/50 font-medium">/ 100</span>
      </motion.div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max, color = "#f59e0b" }: {
  label: string; value: number; max: number; color?: string
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-blue-200/40 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-white/60 font-semibold">{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        />
      </div>
    </div>
  );
}

// ─── Tag Chip ─────────────────────────────────────────────────────────────────
function Tag({ children, variant = "blue" }: {
  children: React.ReactNode;
  variant?: "amber" | "blue" | "green" | "purple" | "red";
}) {
  const styles = {
    amber:  "bg-amber-950/40 border-amber-800/40 text-amber-300",
    blue:   "bg-blue-950/40 border-blue-800/40 text-blue-300",
    green:  "bg-green-950/40 border-green-800/40 text-green-300",
    purple: "bg-purple-950/40 border-purple-800/40 text-purple-300",
    red:    "bg-red-950/40 border-red-800/40 text-red-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result, rank, delay }: {
  result: GoldenWindowResult;
  rank: number;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(rank === 0);
  const meta = RANK_META[rank] ?? RANK_META[2]!;
  const timeGradient = TIME_GRADIENTS[result.timeSlot] ?? "from-slate-600 to-slate-700";
  const timeGlow = rank === 0 ? (TIME_GLOWS[result.timeSlot] ?? "") : "";

  const bd = result.scoreBreakdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`rounded-2xl border ${meta.border} bg-[#0e0e2a]/90 overflow-hidden ${meta.glow} ${timeGlow}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${meta.topBar}`} />

      <div className="p-5 space-y-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Day + time */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight">{result.day}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${timeGradient} bg-opacity-20`}>
                <span className="text-xs font-semibold text-white">
                  {TIME_LABELS[result.timeSlot] ?? result.timeSlot}
                </span>
              </div>
              <span className="text-xs text-blue-200/30">
                {TIME_HOURS[result.timeSlot] ?? ""}
              </span>
            </div>
          </div>

          {/* Score ring */}
          <ScoreRing score={result.matchScore} color={meta.ring} />
        </div>

        {/* Explanation headline */}
        <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <p className="text-sm text-blue-100/80 leading-relaxed">{result.explanation}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {result.vibeLabel && (
            <Tag variant="amber">
              {result.vibeEmoji && <span>{result.vibeEmoji}</span>}
              {result.vibeLabel}
            </Tag>
          )}
          {result.venueLabel && (
            <Tag variant="blue">{result.venueLabel}</Tag>
          )}
          {result.suggestedBudget && (
            <Tag variant="green">{result.suggestedBudget}</Tag>
          )}
          {result.suggestedCuisines.slice(0, 2).map((c) => (
            <Tag key={c} variant="purple">
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Tag>
          ))}
          {result.suggestedFoodType && (
            <Tag variant="blue">{result.suggestedFoodType}</Tag>
          )}
          {result.travelFit && (
            <Tag variant="blue">🚌 {result.travelFit}</Tag>
          )}
          {result.dietaryNote && (
            <Tag variant="red">⚠ {result.dietaryNote}</Tag>
          )}
        </div>

        {/* Member count + avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {result.availableMembers.slice(0, 5).map((m, i) => (
                <div
                  key={i}
                  title={m.name ?? m.email ?? "Member"}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-[#0e0e2a] flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-[9px] font-bold text-white">{initials(m.name, m.email)}</span>
                </div>
              ))}
              {result.availableMembers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-blue-900/60 border-2 border-[#0e0e2a] flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-blue-300">+{result.availableMembers.length - 5}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-blue-200/50">
              <span className="text-white font-semibold">{result.availableCount}</span>
              <span> / {result.totalMembers} members free</span>
            </span>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-blue-400/50 hover:text-blue-300/70 transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" />Less</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" />Details</>
            )}
          </button>
        </div>

        {/* Expandable: explanation points + score breakdown */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-1 border-t border-white/[0.05]">
                {/* Why points */}
                {result.explanationPoints.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-widest">Why this window</p>
                    {result.explanationPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5 flex-shrink-0">·</span>
                        <p className="text-xs text-blue-200/60">{pt}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Score breakdown bars */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-widest">Score breakdown</p>
                  <ScoreBar label="Availability" value={bd.availability} max={40} color="#f59e0b" />
                  <ScoreBar label="Time preference" value={bd.timePreference} max={15} color="#60a5fa" />
                  <ScoreBar label="Vibe match" value={bd.vibe} max={15} color="#a78bfa" />
                  <ScoreBar label="Venue fit" value={bd.venue} max={10} color="#34d399" />
                  <ScoreBar label="Budget" value={bd.budget} max={10} color="#4ade80" />
                  <ScoreBar label="Cuisine" value={bd.cuisine} max={5} color="#fb923c" />
                  <ScoreBar label="Dietary" value={bd.dietary} max={5} color="#f87171" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  submittedCount,
  totalMembers,
  hasMyAvail,
  onSetAvailability,
}: {
  submittedCount: number;
  totalMembers: number;
  hasMyAvail: boolean;
  onSetAvailability: () => void;
}) {
  const missing = totalMembers - submittedCount;
  const tips: string[] = [];

  if (!hasMyAvail) tips.push("Add your own availability to get started");
  if (missing > 0) tips.push(`${missing} more member${missing !== 1 ? "s" : ""} need to submit their availability`);
  tips.push("Ask members to set their vibes and preferences in the Preferences page");
  tips.push("Set circle-wide vibe and budget preferences in the circle settings");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-900/40 bg-[#0e0e2a]/80 p-8 text-center space-y-5"
    >
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
        <div className="relative w-16 h-16 rounded-full bg-amber-950/40 border border-amber-900/40 flex items-center justify-center">
          <Zap className="h-7 w-7 text-amber-400/60" />
        </div>
      </div>

      <div>
        <p className="text-white font-semibold text-lg mb-2">Not enough data yet</p>
        <p className="text-blue-200/40 text-sm">
          {submittedCount === 0
            ? "No members have submitted their availability."
            : `${submittedCount} of ${totalMembers} members responded — more = better results.`}
        </p>
      </div>

      <div className="text-left space-y-2.5 pt-1">
        <p className="text-xs text-amber-400/60 font-semibold uppercase tracking-wider">How to improve results</p>
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-amber-500 text-xs mt-0.5 flex-shrink-0">
              {i === 0 && !hasMyAvail ? "→" : "·"}
            </span>
            <p className="text-sm text-blue-200/50">{tip}</p>
          </div>
        ))}
      </div>

      {!hasMyAvail && (
        <Button
          onClick={onSetAvailability}
          className="bg-amber-500 hover:bg-amber-400 text-[#0a0a1a] font-semibold rounded-xl w-full"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Set My Availability
        </Button>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GoldenWindow() {
  useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const params = useParams<{ circleId: string }>();
  const circleId = params.circleId ?? "";
  const [availOpen, setAvailOpen] = useState(false);

  const { data: circle } = trpc.circles.getById.useQuery(
    { id: circleId },
    { enabled: Boolean(circleId) }
  );

  const { data: result, isLoading, error, refetch } = trpc.goldenWindow.calculate.useQuery(
    { circleId },
    { enabled: Boolean(circleId) }
  );

  const { data: myAvail } = trpc.availability.getMine.useQuery(
    { circleId },
    { enabled: Boolean(circleId) }
  );

  const hasMyAvail = (myAvail?.availableDays?.length ?? 0) > 0;
  const hasResults = (result?.results?.length ?? 0) > 0;

  if (!circleId) {
    return (
      <div className="min-h-screen bg-[#080818] flex items-center justify-center">
        <p className="text-blue-200/50">No circle selected.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080818]">
      {/* ── Background glow ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.03] blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-blue-600/[0.04] blur-3xl" />
      </div>

      <div className="relative px-4 pt-6 pb-12 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLocation(`/circles/${circleId}`)}
            className="p-2 rounded-xl border border-blue-900/40 bg-[#0e0e2a]/60 hover:bg-[#0e0e2a] text-blue-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h1 className="text-xl font-bold text-white">Golden Window</h1>
            </div>
            {circle && (
              <p className="text-xs text-blue-200/40 truncate">{circle.name}</p>
            )}
          </div>
        </div>

        {/* My availability status banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 flex items-center gap-3 mb-5 cursor-pointer transition-all ${
            hasMyAvail
              ? "border-green-900/40 bg-green-950/15 hover:bg-green-950/25"
              : "border-amber-900/40 bg-amber-950/15 hover:bg-amber-950/25"
          }`}
          onClick={() => setAvailOpen(true)}
        >
          <CalendarDays className={`h-5 w-5 flex-shrink-0 ${hasMyAvail ? "text-green-400" : "text-amber-400"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${hasMyAvail ? "text-green-300" : "text-amber-300"}`}>
              {hasMyAvail ? "Your availability is set" : "Set your availability"}
            </p>
            <p className="text-xs text-blue-200/40">
              {hasMyAvail
                ? `${myAvail!.availableDays.length} day${myAvail!.availableDays.length !== 1 ? "s" : ""} · tap to update`
                : "Required for accurate results — tap to add"}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${
            hasMyAvail
              ? "border-green-800/40 text-green-400"
              : "border-amber-800/40 text-amber-400"
          }`}>
            {hasMyAvail ? "Edit" : "Add"}
          </span>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Zap className="h-10 w-10 text-amber-400" />
            </motion.div>
            <p className="text-blue-200/40 text-sm">Calculating Golden Windows…</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center"
          >
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 text-sm">{error.message}</p>
          </motion.div>
        ) : !hasResults ? (
          <EmptyState
            submittedCount={result?.submittedCount ?? 0}
            totalMembers={result?.totalMembers ?? 0}
            hasMyAvail={hasMyAvail}
            onSetAvailability={() => setAvailOpen(true)}
          />
        ) : (
          <div className="space-y-5">
            {/* Participation indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between px-1"
            >
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-400/50" />
                <span className="text-xs text-blue-200/50">
                  <span className="text-white font-semibold">{result!.submittedCount}</span>
                  {" of "}
                  <span className="text-white font-semibold">{result!.totalMembers}</span>
                  {" members responded"}
                </span>
              </div>
              <button
                onClick={() => setAvailOpen(true)}
                className="text-xs text-amber-400/60 hover:text-amber-300 transition-colors"
              >
                {hasMyAvail ? "Edit mine" : "Add mine"}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400/70" />
              <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest">
                Top {result!.results.length} Golden Window{result!.results.length !== 1 ? "s" : ""}
              </p>
            </motion.div>

            {/* Result cards */}
            {result!.results.map((win, idx) => (
              <ResultCard
                key={`${win.day}-${win.timeSlot}`}
                result={win as GoldenWindowResult}
                rank={idx}
                delay={idx * 0.12}
              />
            ))}

            {/* Recalculate */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center pt-2"
            >
              <button
                onClick={() => { void refetch(); }}
                className="flex items-center gap-1.5 text-xs text-blue-400/30 hover:text-blue-300/50 transition-colors"
              >
                <Loader2 className="h-3 w-3" />
                Recalculate
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Availability modal */}
      {circle && (
        <AvailabilityModal
          open={availOpen}
          onOpenChange={(v) => {
            setAvailOpen(v);
            if (!v) void refetch();
          }}
          circleId={circleId}
          circleName={circle.name}
        />
      )}
    </div>
  );
}
