import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Zap, Users, CalendarDays, AlertCircle, Trophy, Sparkles } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import AvailabilityModal from "@/components/AvailabilityModal";

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

const TIME_COLORS: Record<string, string> = {
  morning: "from-amber-600 to-orange-700",
  afternoon: "from-blue-600 to-blue-700",
  evening: "from-purple-600 to-purple-800",
  late_night: "from-slate-600 to-slate-800",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Morning", afternoon: "Afternoon", evening: "Evening", late_night: "Late Night",
};

const RANK_STYLE = [
  { border: "border-amber-500/50", glow: "shadow-[0_0_24px_rgba(245,158,11,0.12)]", badge: "bg-amber-500 text-[#0a0a1a]", label: "Best Match" },
  { border: "border-blue-600/40", glow: "", badge: "bg-blue-700 text-white", label: "2nd" },
  { border: "border-slate-600/40", glow: "", badge: "bg-slate-700 text-white", label: "3rd" },
];

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#f59e0b" : score >= 60 ? "#60a5fa" : "#64748b";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg className="-rotate-90" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} strokeWidth="5" stroke="rgba(255,255,255,0.07)" fill="none" />
        <circle
          cx="32" cy="32" r={r}
          strokeWidth="5"
          stroke={color}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white">{score}%</span>
    </div>
  );
}

function initials(name: string | null, email: string | null) {
  const src = name || email || "?";
  const p = src.split(/[\s@.]+/).filter(Boolean);
  if (p.length >= 2) return (p[0]![0]! + p[1]![0]!).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

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

  if (!circleId) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-blue-200/50">Circle not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLocation(`/circles/${circleId}`)}
            className="p-2 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] text-blue-300 hover:text-white transition-all"
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

        {/* My availability banner */}
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 mb-4 cursor-pointer transition-all ${
            hasMyAvail
              ? "border-green-800/40 bg-green-950/20"
              : "border-amber-800/40 bg-amber-950/20 hover:bg-amber-950/30"
          }`}
          onClick={() => setAvailOpen(true)}
        >
          <CalendarDays className={`h-5 w-5 flex-shrink-0 ${hasMyAvail ? "text-green-400" : "text-amber-400"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${hasMyAvail ? "text-green-300" : "text-amber-300"}`}>
              {hasMyAvail ? "Your availability is set" : "Set your availability"}
            </p>
            <p className="text-xs text-blue-200/40">
              {hasMyAvail
                ? `${myAvail!.availableDays.length} day${myAvail!.availableDays.length !== 1 ? "s" : ""} selected — tap to edit`
                : "Add your free days to improve the results"}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            hasMyAvail ? "border-green-700/40 text-green-400" : "border-amber-700/40 text-amber-400"
          }`}>
            {hasMyAvail ? "Edit" : "Add"}
          </span>
        </div>
      </div>

      {/* Results area */}
      <div className="px-4 pb-10 max-w-xl mx-auto space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <Zap className="h-10 w-10 text-amber-400 animate-pulse" />
            </div>
            <p className="text-blue-200/50 text-sm">Calculating Golden Windows…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        ) : !result || result.results.length === 0 ? (
          <div className="rounded-2xl border border-blue-900/40 bg-[#11112b]/60 p-8 text-center space-y-4">
            <Users className="h-10 w-10 text-blue-400/40 mx-auto" />
            <div>
              <p className="text-white font-semibold mb-1">Not enough data yet</p>
              <p className="text-blue-200/40 text-sm">
                {result?.submittedCount === 0
                  ? "No members have submitted their availability. Add yours to get started."
                  : `${result?.submittedCount} of ${result?.totalMembers} members have submitted availability. More responses = better results.`}
              </p>
            </div>
            <Button
              onClick={() => setAvailOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-[#0a0a1a] font-semibold rounded-xl"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Set My Availability
            </Button>
          </div>
        ) : (
          <>
            {/* Participation bar */}
            <div className="rounded-xl border border-blue-900/30 bg-[#11112b]/60 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400/60" />
                <span className="text-sm text-blue-200/60">
                  <span className="text-white font-semibold">{result.submittedCount}</span> of{" "}
                  <span className="text-white font-semibold">{result.totalMembers}</span> members responded
                </span>
              </div>
              <button
                onClick={() => setAvailOpen(true)}
                className="text-xs text-amber-400/70 hover:text-amber-300 transition-colors"
              >
                {hasMyAvail ? "Edit mine" : "Add mine"}
              </button>
            </div>

            <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest px-1">
              Top {result.results.length} Golden Window{result.results.length !== 1 ? "s" : ""}
            </p>

            {result.results.map((win, idx) => {
              const style = RANK_STYLE[idx] ?? RANK_STYLE[2]!;
              const gradient = TIME_COLORS[win.timeSlot] ?? "from-slate-600 to-slate-800";
              return (
                <div
                  key={`${win.day}-${win.timeSlot}`}
                  className={`rounded-2xl border ${style.border} bg-[#11112b]/80 overflow-hidden ${style.glow} transition-all`}
                >
                  {/* Top accent strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

                  <div className="p-5 space-y-4">
                    {/* Rank + score row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge} flex-shrink-0`}>
                          {style.label}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {win.day}
                          </h3>
                          <p className="text-sm text-blue-200/60">
                            {TIME_LABELS[win.timeSlot] ?? win.timeSlot}
                          </p>
                        </div>
                      </div>
                      <ScoreRing score={win.matchScore} />
                    </div>

                    {/* Suggestions row */}
                    <div className="flex flex-wrap gap-2">
                      {win.vibeLabel && (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-amber-900/40 bg-amber-950/20 text-amber-300">
                          <Sparkles className="h-3 w-3" />
                          {win.vibeLabel}
                        </span>
                      )}
                      {win.venueLabel && (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-blue-900/40 bg-blue-950/30 text-blue-300">
                          {win.venueLabel}
                        </span>
                      )}
                      {win.suggestedBudget && (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-green-900/40 bg-green-950/20 text-green-300 font-medium">
                          {win.suggestedBudget}
                        </span>
                      )}
                    </div>

                    {/* Who's in */}
                    <div className="space-y-2">
                      <p className="text-xs text-blue-200/40 font-medium">
                        {win.availableCount} of {win.totalMembers} members free
                      </p>
                      <div className="flex -space-x-2">
                        {win.availableMembers.slice(0, 6).map((m, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-[#0e0e24] flex items-center justify-center flex-shrink-0"
                            title={m.name ?? m.email ?? "Member"}
                          >
                            <span className="text-[10px] font-bold text-white">
                              {initials(m.name, m.email)}
                            </span>
                          </div>
                        ))}
                        {win.availableMembers.length > 6 && (
                          <div className="w-8 h-8 rounded-full bg-blue-900/60 border-2 border-[#0e0e24] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-blue-300">+{win.availableMembers.length - 6}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Recalculate */}
            <button
              onClick={() => refetch()}
              className="w-full text-center text-xs text-blue-400/40 hover:text-blue-300/60 transition-colors py-2"
            >
              Recalculate
            </button>
          </>
        )}
      </div>

      {circle && (
        <AvailabilityModal
          open={availOpen}
          onOpenChange={(v) => {
            setAvailOpen(v);
            if (!v) refetch();
          }}
          circleId={circleId}
          circleName={circle.name}
        />
      )}
    </div>
  );
}
