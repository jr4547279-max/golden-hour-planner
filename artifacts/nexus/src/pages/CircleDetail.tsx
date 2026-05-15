import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Loader2, Users, Calendar, Sparkles,
  Heart, Briefcase, Star, Users2, Crown,
  UserPlus, Zap, Copy, Check, Share2,
  RefreshCw, ShieldAlert, Settings2, Save,
  Coffee, Music, Briefcase as BriefcaseIcon, Building, Trees, Home,
  CalendarDays, Utensils, MapPin, Car, Cloud, Ban,
  Footprints, Bike, Train, Volume2, VolumeX, Volume1,
  Sun, Moon, Sunset, Sunrise,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import AvailabilityModal from "@/components/AvailabilityModal";

const CIRCLE_TYPES = [
  { value: "friends", label: "Friends", icon: Users2 },
  { value: "family", label: "Family", icon: Heart },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "date_night", label: "Date Night", icon: Star },
  { value: "other", label: "Other", icon: Sparkles },
] as const;

function typeLabel(type: string) {
  return CIRCLE_TYPES.find((t) => t.value === type)?.label ?? type;
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const found = CIRCLE_TYPES.find((t) => t.value === type);
  const Icon = found?.icon ?? Users;
  return <Icon className={className} />;
}

function typeBadgeColor(type: string) {
  const map: Record<string, string> = {
    friends: "bg-blue-900/40 text-blue-300 border-blue-800/50",
    family: "bg-rose-900/40 text-rose-300 border-rose-800/50",
    work: "bg-amber-900/40 text-amber-300 border-amber-800/50",
    date_night: "bg-purple-900/40 text-purple-300 border-purple-800/50",
    other: "bg-slate-800/60 text-slate-300 border-slate-700/50",
  };
  return map[type] ?? map.other;
}

function typeAccentColor(type: string) {
  const map: Record<string, string> = {
    friends: "from-blue-600 to-blue-800",
    family: "from-rose-600 to-rose-800",
    work: "from-amber-600 to-amber-800",
    date_night: "from-purple-600 to-purple-800",
    other: "from-slate-600 to-slate-800",
  };
  return map[type] ?? map.other;
}

function initials(name: string | null, email: string | null): string {
  const src = name || email || "?";
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0]! + parts[1][0]!).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function MemberAvatar({ name, email, role }: { name: string | null; email: string | null; role: string }) {
  const bg = role === "admin"
    ? "bg-gradient-to-br from-amber-700 to-amber-900"
    : "bg-gradient-to-br from-blue-700 to-blue-900";
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
      <span className="text-xs font-bold text-white">{initials(name, email)}</span>
    </div>
  );
}

function safeParseJSON(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

type ChipOpt = { value: string; label: string; icon?: React.ReactNode };

function ChipGroup({
  options, selected, onChange, multi = true,
}: {
  options: ChipOpt[];
  selected: string[];
  onChange: (v: string[]) => void;
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

const VIBE_OPTIONS: ChipOpt[] = [
  { value: "chill", label: "Chill", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "lively", label: "Lively", icon: <Music className="h-3.5 w-3.5" /> },
  { value: "productive", label: "Productive", icon: <BriefcaseIcon className="h-3.5 w-3.5" /> },
  { value: "romantic", label: "Romantic", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "adventurous", label: "Adventurous", icon: <Zap className="h-3.5 w-3.5" /> },
];

const BUDGET_OPTIONS: ChipOpt[] = [
  { value: "£", label: "£ — Budget" },
  { value: "££", label: "££ — Mid-range" },
  { value: "£££", label: "£££ — Premium" },
];

const VENUE_TYPE_OPTIONS: ChipOpt[] = [
  { value: "restaurant", label: "Restaurant", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "bar", label: "Bar / Pub", icon: <Music className="h-3.5 w-3.5" /> },
  { value: "cafe", label: "Café", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "park", label: "Park", icon: <Trees className="h-3.5 w-3.5" /> },
  { value: "indoor_activity", label: "Indoor Activity", icon: <Building className="h-3.5 w-3.5" /> },
  { value: "outdoor_activity", label: "Outdoor Activity", icon: <Home className="h-3.5 w-3.5" /> },
];

// ─── Advanced Preferences option data ─────────────────────────────────────────
const CUISINE_OPTIONS: ChipOpt[] = [
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
  { value: "greek", label: "Greek" },
  { value: "spanish", label: "Spanish" },
];

const FOOD_STYLE_OPTIONS: ChipOpt[] = [
  { value: "full_meal", label: "Full Meal" },
  { value: "drinks", label: "Drinks only" },
  { value: "snacks", label: "Snacks & nibbles" },
  { value: "brunch", label: "Brunch" },
  { value: "dessert", label: "Dessert" },
  { value: "buffet", label: "Buffet" },
];

const DIETARY_OPTIONS: ChipOpt[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-Free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "dairy_free", label: "Dairy-Free" },
  { value: "nut_free", label: "Nut-Free" },
  { value: "pescatarian", label: "Pescatarian" },
];

const TRANSPORT_OPTIONS: ChipOpt[] = [
  { value: "walking", label: "Walking", icon: <Footprints className="h-3.5 w-3.5" /> },
  { value: "cycling", label: "Cycling", icon: <Bike className="h-3.5 w-3.5" /> },
  { value: "public_transport", label: "Public transport", icon: <Train className="h-3.5 w-3.5" /> },
  { value: "car", label: "Driving", icon: <Car className="h-3.5 w-3.5" /> },
];

const INDOOR_OUTDOOR_OPTIONS: ChipOpt[] = [
  { value: "indoor", label: "Indoors", icon: <Building className="h-3.5 w-3.5" /> },
  { value: "outdoor", label: "Outdoors", icon: <Trees className="h-3.5 w-3.5" /> },
  { value: "both", label: "Either", icon: <Home className="h-3.5 w-3.5" /> },
];

const NOISE_OPTIONS: ChipOpt[] = [
  { value: "quiet", label: "Quiet", icon: <VolumeX className="h-3.5 w-3.5" /> },
  { value: "moderate", label: "Moderate", icon: <Volume1 className="h-3.5 w-3.5" /> },
  { value: "lively", label: "Buzzy", icon: <Volume2 className="h-3.5 w-3.5" /> },
];

const TIME_OPTIONS: ChipOpt[] = [
  { value: "morning", label: "Morning", icon: <Sunrise className="h-3.5 w-3.5" /> },
  { value: "afternoon", label: "Afternoon", icon: <Sun className="h-3.5 w-3.5" /> },
  { value: "evening", label: "Evening", icon: <Sunset className="h-3.5 w-3.5" /> },
  { value: "late_night", label: "Late Night", icon: <Moon className="h-3.5 w-3.5" /> },
];

const DURATION_OPTIONS = [
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hrs" },
  { value: 120, label: "2 hrs" },
  { value: 180, label: "3 hrs" },
  { value: 240, label: "4+ hrs" },
];

const MAX_TRAVEL_OPTIONS = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
];

const PRIORITY_OPTIONS: ChipOpt[] = [
  { value: "cheapest", label: "Lowest cost" },
  { value: "shortest_travel", label: "Least travel" },
  { value: "best_atmosphere", label: "Best atmosphere" },
  { value: "highest_overlap", label: "Most attendance" },
];

const AVOID_VENUE_OPTIONS: ChipOpt[] = [
  { value: "bars", label: "Bars & pubs" },
  { value: "clubs", label: "Clubs" },
  { value: "crowded", label: "Crowded" },
  { value: "loud", label: "Loud" },
  { value: "smoking", label: "Smoking areas" },
];

const ACCESSIBILITY_OPTIONS: ChipOpt[] = [
  { value: "wheelchair", label: "Wheelchair" },
  { value: "step_free", label: "Step-free" },
  { value: "quiet_space", label: "Quiet space" },
  { value: "hearing_loop", label: "Hearing loop" },
  { value: "allergy_aware", label: "Allergy-aware" },
];

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, sub }: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center justify-between w-full gap-4 py-0.5">
      <div className="text-left">
        <p className="text-sm text-blue-100/80 font-medium">{label}</p>
        {sub && <p className="text-xs text-blue-200/40 mt-0.5">{sub}</p>}
      </div>
      <motion.div
        className={`relative w-10 h-[22px] rounded-full flex-shrink-0 transition-colors duration-150 ${
          value ? "bg-amber-500/80 border border-amber-500/40" : "bg-blue-950 border border-blue-800/50"
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm"
          animate={{ left: value ? "calc(100% - 20px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </motion.div>
    </button>
  );
}

// ─── Slider field ──────────────────────────────────────────────────────────────
function SliderField({ label, value, min, max, onChange, leftLabel, rightLabel }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; leftLabel?: string; rightLabel?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <p className="text-sm text-blue-100/80 font-medium">{label}</p>
      <div className="relative h-2 rounded-full bg-blue-950 border border-blue-900/50">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#0a0a1a] pointer-events-none"
          animate={{ left: `calc(${pct}% - 8px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between">
          <span className="text-[10px] text-blue-200/30">{leftLabel}</span>
          <span className="text-[10px] text-blue-200/30">{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function PrefSection({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pt-1">
        <span className="text-amber-400">{icon}</span>
        <p className="text-xs font-bold text-white uppercase tracking-widest">{title}</p>
      </div>
      <div className="space-y-3 pl-1">{children}</div>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-blue-200/30 uppercase tracking-widest mb-1.5">{children}</p>;
}

function PrefDivider() {
  return <div className="border-t border-white/[0.04] my-1" />;
}

function CirclePreferencesPanel({
  circleId: _circleId,
}: {
  circleId: string;
  isCreator: boolean;
}) {
  const { data: prefs, isLoading } = trpc.calendar.getPreferences.useQuery();
  const updateMutation = trpc.calendar.updatePreferences.useMutation({
    onSuccess: () => { setIsDirty(false); setIsSaving(false); toast.success("Your preferences saved"); },
    onError: (err: { message?: string }) => { setIsSaving(false); toast.error(err.message || "Failed to save"); },
  });

  // ── Food & Drink ──
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  // ── Travel ──
  const [maxTravelDistance, setMaxTravelDistance] = useState<number | null>(null);
  const [transportType, setTransportType] = useState<string[]>([]);
  const [midpointPreference, setMidpointPreference] = useState(false);
  // ── Energy & Atmosphere ──
  const [vibes, setVibes] = useState<string[]>([]);
  const [noisePreference, setNoisePreference] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [indoorOutdoor, setIndoorOutdoor] = useState<string[]>([]);
  // ── Scheduling ──
  const [meetupTimes, setMeetupTimes] = useState<string[]>([]);
  const [idealDuration, setIdealDuration] = useState<number | null>(null);
  const [flexibilityLevel, setFlexibilityLevel] = useState(3);
  // ── Weather ──
  const [prefersSunny, setPrefersSunny] = useState(false);
  const [avoidRain, setAvoidRain] = useState(false);
  const [outdoorOnlyGoodWeather, setOutdoorOnlyGoodWeather] = useState(false);
  // ── Group Priorities ──
  const [prioritizeType, setPrioritizeType] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState<string[]>([]);
  // ── Exclusions ──
  const [avoidVenues, setAvoidVenues] = useState<string[]>([]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!prefs) return;
    setCuisines(safeParseJSON(prefs.cuisines));
    setFoodPreferences(safeParseJSON(prefs.foodPreferences));
    setDietaryRestrictions(safeParseJSON(prefs.dietaryRestrictions));
    setMaxTravelDistance(prefs.maxTravelDistance ?? null);
    setTransportType(prefs.transportType ? [prefs.transportType] : []);
    setMidpointPreference(prefs.midpointPreference ?? false);
    setVibes(safeParseJSON(prefs.vibes));
    setNoisePreference(prefs.noisePreference ? [prefs.noisePreference] : []);
    setEnergyLevel(prefs.energyLevel ?? 3);
    setIndoorOutdoor(prefs.indoorOutdoor ? [prefs.indoorOutdoor] : []);
    setMeetupTimes(safeParseJSON(prefs.meetupTimes));
    setIdealDuration(prefs.idealDuration ?? null);
    setFlexibilityLevel(prefs.flexibilityLevel ?? 3);
    setPrefersSunny(prefs.prefersSunny ?? false);
    setAvoidRain(prefs.avoidRain ?? false);
    setOutdoorOnlyGoodWeather(prefs.outdoorOnlyGoodWeather ?? false);
    setPrioritizeType(prefs.prioritizeType ? [prefs.prioritizeType] : []);
    setBudgetTier(prefs.budgetTier ? [prefs.budgetTier] : []);
    setAvoidVenues(safeParseJSON(prefs.avoidVenues));
    setAccessibilityNeeds(safeParseJSON(prefs.accessibilityNeeds));
  }, [prefs]);

  function d<T>(setter: React.Dispatch<React.SetStateAction<T>>) {
    return (v: T) => { setter(v); setIsDirty(true); };
  }

  function handleSave() {
    setIsSaving(true);
    updateMutation.mutate({
      cuisines,
      foodPreferences,
      dietaryRestrictions,
      maxTravelDistance: maxTravelDistance ?? undefined,
      transportType: transportType[0],
      midpointPreference,
      vibes,
      noisePreference: noisePreference[0],
      energyLevel,
      indoorOutdoor: indoorOutdoor[0] as "indoor" | "outdoor" | "both" | undefined,
      meetupTimes,
      idealDuration: idealDuration ?? undefined,
      flexibilityLevel,
      prefersSunny,
      avoidRain,
      outdoorOnlyGoodWeather,
      prioritizeType: prioritizeType[0],
      budgetTier: budgetTier[0] as "£" | "££" | "£££" | undefined,
      avoidVenues,
      accessibilityNeeds,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
        <span className="text-sm text-blue-200/40">Loading your preferences…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-blue-200/40 -mt-1">
        These are your personal preferences — they power the Golden Window score across all your circles.
      </p>

      {/* ── 01 FOOD & DRINK ── */}
      <PrefSection icon={<Utensils className="h-3.5 w-3.5" />} title="Food & Drink">
        <div>
          <SubLabel>Favourite cuisines</SubLabel>
          <ChipGroup options={CUISINE_OPTIONS} selected={cuisines} onChange={d(setCuisines)} />
        </div>
        <PrefDivider />
        <div>
          <SubLabel>Food style</SubLabel>
          <ChipGroup options={FOOD_STYLE_OPTIONS} selected={foodPreferences} onChange={d(setFoodPreferences)} />
        </div>
        <PrefDivider />
        <div>
          <SubLabel>Dietary requirements</SubLabel>
          <ChipGroup options={DIETARY_OPTIONS} selected={dietaryRestrictions} onChange={d(setDietaryRestrictions)} />
        </div>
      </PrefSection>

      <PrefDivider />

      {/* ── 02 TRAVEL & DISTANCE ── */}
      <PrefSection icon={<MapPin className="h-3.5 w-3.5" />} title="Travel & Distance">
        <div>
          <SubLabel>Max travel time</SubLabel>
          <div className="flex flex-wrap gap-2">
            {MAX_TRAVEL_OPTIONS.map((opt) => {
              const active = maxTravelDistance === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setMaxTravelDistance(active ? null : opt.value); setIsDirty(true); }}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                      : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/60 hover:text-blue-200/90"
                  }`}
                >
                  {opt.label}
                  {active && <Check className="h-3 w-3 ml-1.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
        <PrefDivider />
        <div>
          <SubLabel>How you travel</SubLabel>
          <ChipGroup options={TRANSPORT_OPTIONS} selected={transportType} onChange={d(setTransportType)} multi={false} />
        </div>
        <PrefDivider />
        <Toggle
          value={midpointPreference}
          onChange={d(setMidpointPreference)}
          label="Prefer midpoint venues"
          sub="Suggest locations equidistant from all members"
        />
      </PrefSection>

      <PrefDivider />

      {/* ── 03 ENERGY & ATMOSPHERE ── */}
      <PrefSection icon={<Zap className="h-3.5 w-3.5" />} title="Energy & Atmosphere">
        <div>
          <SubLabel>Vibe</SubLabel>
          <ChipGroup options={VIBE_OPTIONS} selected={vibes} onChange={d(setVibes)} />
        </div>
        <PrefDivider />
        <SliderField
          label="Social energy"
          value={energyLevel} min={1} max={5}
          onChange={d(setEnergyLevel)}
          leftLabel="Chill & relaxed"
          rightLabel="High energy"
        />
        <PrefDivider />
        <div>
          <SubLabel>Noise level</SubLabel>
          <ChipGroup options={NOISE_OPTIONS} selected={noisePreference} onChange={d(setNoisePreference)} multi={false} />
        </div>
        <PrefDivider />
        <div>
          <SubLabel>Venue setting</SubLabel>
          <ChipGroup options={INDOOR_OUTDOOR_OPTIONS} selected={indoorOutdoor} onChange={d(setIndoorOutdoor)} multi={false} />
        </div>
      </PrefSection>

      <PrefDivider />

      {/* ── 04 SCHEDULING ── */}
      <PrefSection icon={<CalendarDays className="h-3.5 w-3.5" />} title="Scheduling">
        <div>
          <SubLabel>Preferred times</SubLabel>
          <ChipGroup options={TIME_OPTIONS} selected={meetupTimes} onChange={d(setMeetupTimes)} />
        </div>
        <PrefDivider />
        <div>
          <SubLabel>Ideal length</SubLabel>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => {
              const active = idealDuration === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setIdealDuration(active ? null : opt.value); setIsDirty(true); }}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                      : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/60 hover:text-blue-200/90"
                  }`}
                >
                  {opt.label}
                  {active && <Check className="h-3 w-3 ml-1.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
        <PrefDivider />
        <SliderField
          label="Scheduling flexibility"
          value={flexibilityLevel} min={1} max={5}
          onChange={d(setFlexibilityLevel)}
          leftLabel="Very strict"
          rightLabel="Very flexible"
        />
      </PrefSection>

      <PrefDivider />

      {/* ── 05 WEATHER ── */}
      <PrefSection icon={<Cloud className="h-3.5 w-3.5" />} title="Weather">
        <div className="space-y-4">
          <Toggle value={prefersSunny} onChange={d(setPrefersSunny)} label="Prefer sunny weather" />
          <PrefDivider />
          <Toggle value={avoidRain} onChange={d(setAvoidRain)} label="Avoid rainy days" />
          <PrefDivider />
          <Toggle
            value={outdoorOnlyGoodWeather}
            onChange={d(setOutdoorOnlyGoodWeather)}
            label="Outdoors only in good weather"
          />
        </div>
      </PrefSection>

      <PrefDivider />

      {/* ── 06 GROUP PRIORITIES ── */}
      <PrefSection icon={<Users className="h-3.5 w-3.5" />} title="Group Priorities">
        <div>
          <SubLabel>Prioritise</SubLabel>
          <ChipGroup options={PRIORITY_OPTIONS} selected={prioritizeType} onChange={d(setPrioritizeType)} multi={false} />
        </div>
        <PrefDivider />
        <div>
          <SubLabel>Budget comfort zone</SubLabel>
          <ChipGroup options={BUDGET_OPTIONS} selected={budgetTier} onChange={d(setBudgetTier)} multi={false} />
        </div>
      </PrefSection>

      <PrefDivider />

      {/* ── 07 EXCLUSIONS ── */}
      <PrefSection icon={<Ban className="h-3.5 w-3.5" />} title="Exclusions">
        <div>
          <SubLabel>Avoid venue types</SubLabel>
          <ChipGroup options={AVOID_VENUE_OPTIONS} selected={avoidVenues} onChange={d(setAvoidVenues)} />
        </div>
        <PrefDivider />
        <div>
          <SubLabel>Accessibility needs</SubLabel>
          <ChipGroup options={ACCESSIBILITY_OPTIONS} selected={accessibilityNeeds} onChange={d(setAccessibilityNeeds)} />
        </div>
      </PrefSection>

      {/* Save button */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#0a0a1a] font-bold rounded-xl"
            >
              {isSaving
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
                : <><Save className="h-4 w-4 mr-2" />Save Preferences</>
              }
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InviteDialog({
  open,
  onOpenChange,
  circleName,
  inviteToken,
  circleId,
  isCreator,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleName: string;
  inviteToken: string;
  circleId: string;
  isCreator: boolean;
}) {
  const utils = trpc.useUtils();
  const [copied, setCopied] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const inviteUrl = `${window.location.origin}/join/${inviteToken}`;

  const regenMutation = trpc.circles.regenerateInviteLink.useMutation({
    onSuccess: () => {
      utils.circles.getById.invalidate({ id: circleId });
      setConfirmRegen(false);
      toast.success("Invite link regenerated");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }

  function handleShare() {
    if (typeof navigator.share === "function") {
      navigator.share({
        title: `Join ${circleName} on Nexus`,
        text: `You're invited to join the ${circleName} circle on Nexus — Golden Window Planner.`,
        url: inviteUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setConfirmRegen(false); }}>
      <DialogContent className="bg-[#11112b] border-blue-900/40 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-400" />
            Invite to {circleName}
          </DialogTitle>
          <DialogDescription className="text-blue-200/50">
            Share this link with people you want to invite. Anyone with the link can join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-blue-200/50 uppercase tracking-wider font-semibold">Invite Link</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="bg-blue-950/40 border-blue-900/40 text-blue-200 text-xs font-mono flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-800/60 hover:bg-blue-700/70 text-white border border-blue-700/40"
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <><Check className="mr-1.5 h-3.5 w-3.5 text-green-400" /> Copied!</>
                ) : (
                  <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</>
                )}
              </Button>
              <Button
                className="flex-1 bg-blue-800/60 hover:bg-blue-700/70 text-white border border-blue-700/40"
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </div>

          {isCreator && (
            <div className="pt-2 border-t border-blue-900/30">
              {!confirmRegen ? (
                <button
                  className="w-full flex items-center gap-2 text-xs text-blue-400/60 hover:text-blue-300/80 transition-colors py-1"
                  onClick={() => setConfirmRegen(true)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate link (invalidates current link)
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-900/20 border border-amber-900/30">
                    <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300/80">
                      This will invalidate the current invite link. Anyone who has it will no longer be able to join.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-900/40 text-blue-300"
                      onClick={() => setConfirmRegen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-amber-700 hover:bg-amber-600 text-white"
                      onClick={() => regenMutation.mutate({ id: circleId })}
                      disabled={regenMutation.isPending}
                    >
                      {regenMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Regenerate"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CircleDetail() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const circleId = params.id;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  const { data: circle, isLoading, error } = trpc.circles.getById.useQuery(
    { id: circleId ?? "" },
    { enabled: Boolean(circleId) }
  );

  const { data: members } = trpc.circles.getMembers.useQuery(
    { id: circleId ?? "" },
    { enabled: Boolean(circleId) }
  );

  if (!circleId) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-blue-200/50">Circle not found.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error?.message || "Circle not found."}</p>
        <Button variant="ghost" onClick={() => setLocation("/circles")} className="text-blue-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Circles
        </Button>
      </div>
    );
  }

  const isCreator = circle.creator?.id === user?.id;

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/circles")}
          className="text-blue-300 hover:text-white hover:bg-blue-900/30 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Circles
        </Button>

        {/* Hero card */}
        <Card className="border-blue-900/40 bg-[#11112b]/80 overflow-hidden">
          <div className={`h-2 w-full bg-gradient-to-r ${typeAccentColor(circle.type)}`} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${typeAccentColor(circle.type)} flex items-center justify-center shadow-lg`}>
                <TypeIcon type={circle.type} className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-white">{circle.name}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeBadgeColor(circle.type)}`}>
                    {typeLabel(circle.type)}
                  </span>
                </div>
                {circle.description && (
                  <p className="text-blue-200/60 text-sm">{circle.description}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-blue-950/40 rounded-xl p-3 text-center border border-blue-900/30">
                <div className="text-2xl font-bold text-white">{circle.memberCount}</div>
                <div className="text-xs text-blue-200/50 mt-0.5">
                  {circle.memberCount === 1 ? "Member" : "Members"}
                </div>
              </div>
              <div className="bg-blue-950/40 rounded-xl p-3 text-center border border-blue-900/30">
                <div className="text-2xl font-bold text-white">{circle.pendingInvites}</div>
                <div className="text-xs text-blue-200/50 mt-0.5">Pending Invites</div>
              </div>
              <div className="bg-blue-950/40 rounded-xl p-3 text-center border border-blue-900/30">
                <div className="text-2xl font-bold text-amber-400">—</div>
                <div className="text-xs text-blue-200/50 mt-0.5">Golden Windows</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator info */}
        <Card className="border-blue-900/30 bg-[#11112b]/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blue-200/40 uppercase tracking-wider">Created by</p>
              <p className="text-white font-medium truncate">
                {isCreator ? "You" : circle.creator?.name || circle.creator?.email || "Unknown"}
                {isCreator && (
                  <span className="ml-2 text-xs text-amber-400/70 font-normal">· Admin</span>
                )}
              </p>
            </div>
            <div className="ml-auto text-xs text-blue-200/30">
              {new Date(circle.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </CardContent>
        </Card>

        {/* Members section */}
        {members && members.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider px-1">
              Members · {members.length}
            </h2>
            <Card className="border-blue-900/30 bg-[#11112b]/60">
              <CardContent className="p-0">
                {members.map((m, i) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? "border-b border-blue-900/20" : ""}`}
                  >
                    <MemberAvatar name={m.name} email={m.email} role={m.role} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {m.name || m.email || "Unknown"}
                        {m.userId === user?.id && (
                          <span className="ml-1.5 text-xs text-blue-400/50 font-normal">· You</span>
                        )}
                      </p>
                      {m.name && m.email && (
                        <p className="text-blue-200/40 text-xs truncate">{m.email}</p>
                      )}
                    </div>
                    {m.role === "admin" && (
                      <span className="flex items-center gap-1 text-xs text-amber-400/70 border border-amber-900/30 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Crown className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Circle Preferences section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider">
              Circle Preferences
            </h2>
            <button
              onClick={() => setPrefsOpen(!prefsOpen)}
              className="flex items-center gap-1.5 text-xs text-blue-400/60 hover:text-blue-300/90 transition-colors"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {prefsOpen ? "Collapse" : "Expand"}
            </button>
          </div>

          {prefsOpen ? (
            <Card className="border-blue-900/30 bg-[#11112b]/60">
              <CardContent className="p-5">
                <CirclePreferencesPanel circleId={circleId} isCreator={isCreator} />
              </CardContent>
            </Card>
          ) : (
            <button
              onClick={() => setPrefsOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-800/40 transition-colors">
                <Settings2 className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">
                  {isCreator ? "Configure Circle Preferences" : "View Circle Preferences"}
                </div>
                <div className="text-xs text-blue-200/40">
                  {isCreator
                    ? "Set default vibe, budget, area and venue type for this circle"
                    : "Preferred vibe, budget, area and venue type for this circle"}
                </div>
              </div>
              <Settings2 className="h-4 w-4 text-blue-400/40 group-hover:text-blue-300/60 transition-colors flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider px-1">Actions</h2>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setInviteOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/50 transition-colors">
                <UserPlus className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">Invite Members</div>
                <div className="text-xs text-blue-200/40">Share a link to invite people to this circle</div>
              </div>
              <Share2 className="h-4 w-4 text-blue-400/40 group-hover:text-blue-300/60 transition-colors flex-shrink-0" />
            </button>

            <button
              onClick={() => setAvailOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/50 transition-colors">
                <CalendarDays className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">Set My Availability</div>
                <div className="text-xs text-blue-200/40">Tell the group which days and times work for you</div>
              </div>
              <CalendarDays className="h-4 w-4 text-blue-400/40 group-hover:text-blue-300/60 transition-colors flex-shrink-0" />
            </button>

            <button
              onClick={() => setLocation(`/golden-window/${circleId}`)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/20 hover:border-amber-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-800/40 transition-colors">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-amber-300">Find Golden Window</div>
                <div className="text-xs text-amber-200/40">Discover the best time for everyone to meet</div>
              </div>
              <Zap className="h-4 w-4 text-amber-400/40 group-hover:text-amber-300/60 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {circle.inviteToken && (
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          circleName={circle.name}
          inviteToken={circle.inviteToken}
          circleId={circle.id}
          isCreator={isCreator}
        />
      )}

      <AvailabilityModal
        open={availOpen}
        onOpenChange={setAvailOpen}
        circleId={circleId}
        circleName={circle.name}
      />
    </div>
  );
}
