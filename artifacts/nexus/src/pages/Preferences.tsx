import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogOut, ArrowLeft, Check, Car, Footprints, Train, Bike, Sun, Moon, Sunset, Home, Building, Trees, Utensils, Coffee, Music, Zap, Briefcase, Heart, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

function safeParseJSON(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

type ChipOption = { value: string; label: string; icon?: React.ReactNode };

function ChipGroup({
  options,
  selected,
  onChange,
  multi = true,
}: {
  options: ChipOption[];
  selected: string[];
  onChange: (val: string[]) => void;
  multi?: boolean;
}) {
  function toggle(val: string) {
    if (multi) {
      onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    } else {
      onChange(selected.includes(val) ? [] : [val]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
              active
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/60 hover:text-blue-200/90"
            }`}
          >
            {opt.icon && <span className="h-3.5 w-3.5 flex-shrink-0">{opt.icon}</span>}
            {opt.label}
            {active && <Check className="h-3 w-3 ml-0.5 text-amber-400" />}
          </button>
        );
      })}
    </div>
  );
}

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">{label}</h2>
      {sub && <p className="text-xs text-blue-200/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-blue-900/40 bg-[#11112b]/80 backdrop-blur-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

const VIBE_OPTIONS: ChipOption[] = [
  { value: "chill", label: "Chill", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "lively", label: "Lively", icon: <Music className="h-3.5 w-3.5" /> },
  { value: "productive", label: "Productive", icon: <Briefcase className="h-3.5 w-3.5" /> },
  { value: "romantic", label: "Romantic", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "adventurous", label: "Adventurous", icon: <Zap className="h-3.5 w-3.5" /> },
];

const MEETUP_TIME_OPTIONS: ChipOption[] = [
  { value: "morning", label: "Morning", icon: <Sun className="h-3.5 w-3.5" /> },
  { value: "afternoon", label: "Afternoon", icon: <Sunset className="h-3.5 w-3.5" /> },
  { value: "evening", label: "Evening", icon: <Moon className="h-3.5 w-3.5" /> },
];

const TRANSPORT_OPTIONS: ChipOption[] = [
  { value: "walking", label: "Walking", icon: <Footprints className="h-3.5 w-3.5" /> },
  { value: "cycling", label: "Cycling", icon: <Bike className="h-3.5 w-3.5" /> },
  { value: "transit", label: "Transit", icon: <Train className="h-3.5 w-3.5" /> },
  { value: "driving", label: "Driving", icon: <Car className="h-3.5 w-3.5" /> },
];

const INDOOR_OUTDOOR_OPTIONS: ChipOption[] = [
  { value: "indoor", label: "Indoors", icon: <Building className="h-3.5 w-3.5" /> },
  { value: "outdoor", label: "Outdoors", icon: <Trees className="h-3.5 w-3.5" /> },
  { value: "both", label: "Either", icon: <Home className="h-3.5 w-3.5" /> },
];

const DIETARY_OPTIONS: ChipOption[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-Free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "dairy_free", label: "Dairy-Free" },
  { value: "nut_free", label: "Nut-Free" },
];

const FOOD_PREF_OPTIONS: ChipOption[] = [
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "indian", label: "Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "mexican", label: "Mexican" },
  { value: "thai", label: "Thai" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "american", label: "American" },
  { value: "french", label: "French" },
  { value: "korean", label: "Korean" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "spanish", label: "Spanish" },
];

const BUDGET_OPTIONS: ChipOption[] = [
  { value: "£", label: "£ — Budget" },
  { value: "££", label: "££ — Mid-range" },
  { value: "£££", label: "£££ — Premium" },
];

const MAX_TRAVEL_OPTIONS = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
];

export default function Preferences() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: prefs, isLoading: prefsLoading } = trpc.calendar.getPreferences.useQuery();
  const updatePrefsMutation = trpc.calendar.updatePreferences.useMutation({
    onSuccess: () => {
      setIsDirty(false);
      setIsSaving(false);
      toast.success("Preferences saved");
    },
    onError: (err) => {
      setIsSaving(false);
      toast.error(err.message || "Failed to save preferences");
    },
  });

  const [vibes, setVibes] = useState<string[]>([]);
  const [meetupTimes, setMeetupTimes] = useState<string[]>([]);
  const [transportType, setTransportType] = useState<string[]>([]);
  const [indoorOutdoor, setIndoorOutdoor] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState<string[]>([]);
  const [maxTravelDistance, setMaxTravelDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!prefs) return;
    setVibes(safeParseJSON(prefs.vibes));
    setMeetupTimes(safeParseJSON(prefs.meetupTimes));
    setTransportType(prefs.transportType ? [prefs.transportType] : []);
    setIndoorOutdoor(prefs.indoorOutdoor ? [prefs.indoorOutdoor] : []);
    setDietaryRestrictions(safeParseJSON(prefs.dietaryRestrictions));
    setFoodPreferences(safeParseJSON(prefs.foodPreferences));
    setBudgetTier(prefs.budgetTier ? [prefs.budgetTier] : []);
    setMaxTravelDistance(prefs.maxTravelDistance ?? null);
  }, [prefs]);

  function markDirty() {
    setIsDirty(true);
  }

  function handleSave() {
    setIsSaving(true);
    updatePrefsMutation.mutate({
      vibes,
      meetupTimes,
      transportType: transportType[0],
      indoorOutdoor: indoorOutdoor[0] as "indoor" | "outdoor" | "both" | undefined,
      dietaryRestrictions,
      foodPreferences,
      budgetTier: budgetTier[0] as "£" | "££" | "£££" | undefined,
      maxTravelDistance: maxTravelDistance ?? undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  if (!user || prefsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <div className="max-w-xl mx-auto px-4 py-6 pb-32 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] text-blue-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">Your Preferences</h1>
            <p className="text-xs text-blue-200/40">Powers the Golden Window recommendation engine</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] text-blue-300 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Profile card */}
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{user.name || "No name set"}</p>
              <p className="text-blue-200/50 text-sm truncate">{user.email || ""}</p>
            </div>
          </div>
        </GlassCard>

        {/* Meetup Vibe */}
        <GlassCard>
          <SectionHeader label="Meetup Vibe" sub="What kind of atmosphere do you prefer?" />
          <ChipGroup
            options={VIBE_OPTIONS}
            selected={vibes}
            onChange={(v) => { setVibes(v); markDirty(); }}
          />
        </GlassCard>

        {/* Time of day */}
        <GlassCard>
          <SectionHeader label="Preferred Times" sub="When do you like to meet up?" />
          <ChipGroup
            options={MEETUP_TIME_OPTIONS}
            selected={meetupTimes}
            onChange={(v) => { setMeetupTimes(v); markDirty(); }}
          />
        </GlassCard>

        {/* Budget */}
        <GlassCard>
          <SectionHeader label="Budget" sub="How much are you comfortable spending per person?" />
          <ChipGroup
            options={BUDGET_OPTIONS}
            selected={budgetTier}
            onChange={(v) => { setBudgetTier(v); markDirty(); }}
            multi={false}
          />
        </GlassCard>

        {/* Max travel */}
        <GlassCard>
          <SectionHeader label="Max Travel Time" sub="How far are you willing to travel?" />
          <div className="flex flex-wrap gap-2">
            {MAX_TRAVEL_OPTIONS.map((opt) => {
              const active = maxTravelDistance === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setMaxTravelDistance(active ? null : opt.value); markDirty(); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    active
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                      : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/60 hover:text-blue-200/90"
                  }`}
                >
                  {opt.label}
                  {active && <Check className="inline ml-1 h-3 w-3 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Transport type */}
        <GlassCard>
          <SectionHeader label="How You Travel" sub="Your preferred way to get around" />
          <ChipGroup
            options={TRANSPORT_OPTIONS}
            selected={transportType}
            onChange={(v) => { setTransportType(v); markDirty(); }}
            multi={false}
          />
        </GlassCard>

        {/* Indoor / Outdoor */}
        <GlassCard>
          <SectionHeader label="Setting" sub="Do you prefer indoor or outdoor venues?" />
          <ChipGroup
            options={INDOOR_OUTDOOR_OPTIONS}
            selected={indoorOutdoor}
            onChange={(v) => { setIndoorOutdoor(v); markDirty(); }}
            multi={false}
          />
        </GlassCard>

        {/* Food preferences */}
        <GlassCard>
          <SectionHeader label="Food Preferences" sub="What cuisines do you enjoy?" />
          <ChipGroup
            options={FOOD_PREF_OPTIONS}
            selected={foodPreferences}
            onChange={(v) => { setFoodPreferences(v); markDirty(); }}
          />
        </GlassCard>

        {/* Dietary restrictions */}
        <GlassCard>
          <SectionHeader label="Dietary Requirements" sub="Any restrictions we should know about?" />
          <ChipGroup
            options={DIETARY_OPTIONS}
            selected={dietaryRestrictions}
            onChange={(v) => { setDietaryRestrictions(v); markDirty(); }}
          />
        </GlassCard>

      </div>

      {/* Sticky save bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          isDirty ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-xl mx-auto px-4 pb-6">
          <div className="rounded-2xl border border-amber-500/30 bg-[#0a0a1a]/95 backdrop-blur-md p-4 flex items-center justify-between gap-4 shadow-2xl shadow-black/60">
            <p className="text-sm text-amber-300/80">You have unsaved changes</p>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-400 text-[#0a0a1a] font-semibold px-5 rounded-xl"
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
