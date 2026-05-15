import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Save, CalendarDays } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const TIME_SLOTS = [
  { value: "morning", label: "Morning", sub: "6am – 12pm" },
  { value: "afternoon", label: "Afternoon", sub: "12pm – 6pm" },
  { value: "evening", label: "Evening", sub: "6pm – 10pm" },
  { value: "late_night", label: "Late Night", sub: "10pm+" },
] as const;

type Day = (typeof DAYS)[number];
type TimeSlot = (typeof TIME_SLOTS)[number]["value"];

function DayChip({ day, active, onToggle }: { day: Day; active: boolean; onToggle: () => void }) {
  const short = day.slice(0, 3);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center w-11 h-11 rounded-xl border text-xs font-semibold transition-all duration-150 ${
        active
          ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : "bg-blue-950/40 border-blue-900/40 text-blue-300/50 hover:border-blue-700/60 hover:text-blue-200/80"
      }`}
    >
      {short}
      {active && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
          <Check className="w-2 h-2 text-[#0a0a1a]" />
        </span>
      )}
    </button>
  );
}

function TimeChip({ slot, active, onToggle }: { slot: typeof TIME_SLOTS[number]; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
        active
          ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
          : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/60 hover:text-blue-200/90"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{slot.label}</span>
        <span className={`text-xs ${active ? "text-amber-400/60" : "text-blue-200/30"}`}>{slot.sub}</span>
      </div>
      {active && <Check className="h-4 w-4 text-amber-400" />}
    </button>
  );
}

export default function AvailabilityModal({
  open,
  onOpenChange,
  circleId,
  circleName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  circleId: string;
  circleName: string;
}) {
  const utils = trpc.useUtils();
  const [days, setDays] = useState<Day[]>([]);
  const [times, setTimes] = useState<TimeSlot[]>([]);

  const { data: existing, isLoading } = trpc.availability.getMine.useQuery(
    { circleId },
    { enabled: open }
  );

  const saveMutation = trpc.availability.save.useMutation({
    onSuccess: () => {
      utils.availability.getMine.invalidate({ circleId });
      utils.availability.getForCircle.invalidate({ circleId });
      toast.success("Availability saved!");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message || "Failed to save"),
  });

  useEffect(() => {
    if (!existing) return;
    setDays((existing.availableDays ?? []) as Day[]);
    setTimes((existing.preferredTimes ?? []) as TimeSlot[]);
  }, [existing]);

  function toggleDay(d: Day) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  function toggleTime(t: TimeSlot) {
    setTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function handleSave() {
    saveMutation.mutate({ circleId, availableDays: days, preferredTimes: times });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0e0e24] border-blue-900/40 text-white max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CalendarDays className="h-4 w-4 text-amber-400" />
            My Availability
          </DialogTitle>
          <DialogDescription className="text-blue-200/50">
            Tell the group when you're free to meet — for <span className="text-blue-300">{circleName}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          </div>
        ) : (
          <div className="space-y-6 pt-1">
            {/* Days */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">
                Available Days
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((d) => (
                  <DayChip key={d} day={d} active={days.includes(d)} onToggle={() => toggleDay(d)} />
                ))}
              </div>
              {days.length === 0 && (
                <p className="text-xs text-blue-200/30 italic">Tap the days you're free</p>
              )}
            </div>

            {/* Times */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">
                Preferred Times <span className="text-blue-200/30 font-normal normal-case tracking-normal">(optional)</span>
              </p>
              <div className="space-y-2">
                {TIME_SLOTS.map((slot) => (
                  <TimeChip
                    key={slot.value}
                    slot={slot}
                    active={times.includes(slot.value)}
                    onToggle={() => toggleTime(slot.value)}
                  />
                ))}
              </div>
            </div>

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || days.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#0a0a1a] font-semibold rounded-xl"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Availability</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
