import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Loader2, LogOut, ArrowLeft, Save, Check,
  Utensils, Car, MapPin, Zap, Clock, Cloud, Users, Ban,
  Footprints, Bike, Train, Home, Trees, Building,
  Coffee, Music, Briefcase, Heart, Sun, Moon, Sunset, Sunrise,
  Volume2, VolumeX, Volume1, Thermometer, Accessibility,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function safeParseJSON(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

// ─── Animated Chip ────────────────────────────────────────────────────────────
function Chip({
  label, value, active, onToggle, icon, color = "amber",
}: {
  label: string; value: string; active: boolean;
  onToggle: (v: string) => void;
  icon?: React.ReactNode; color?: "amber" | "blue" | "green" | "purple";
}) {
  const activeStyles = {
    amber:  "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    blue:   "bg-blue-500/20 border-blue-500/60 text-blue-300",
    green:  "bg-green-500/20 border-green-500/60 text-green-300",
    purple: "bg-purple-500/20 border-purple-500/60 text-purple-300",
  };
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(value)}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.03 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 ${
        active
          ? activeStyles[color]
          : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/50 hover:text-blue-200/90"
      }`}
    >
      {icon && <span className="flex-shrink-0 w-3.5 h-3.5">{icon}</span>}
      {label}
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="h-3 w-3 text-amber-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Chip Group ───────────────────────────────────────────────────────────────
function ChipGroup({
  options, selected, onChange, multi = true, color = "amber",
}: {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  selected: string[]; onChange: (v: string[]) => void;
  multi?: boolean; color?: "amber" | "blue" | "green" | "purple";
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
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          value={opt.value}
          active={selected.includes(opt.value)}
          onToggle={toggle}
          icon={opt.icon}
          color={color}
        />
      ))}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, sub }: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full gap-4 py-1"
    >
      <div className="text-left">
        <p className="text-sm text-blue-100/80 font-medium">{label}</p>
        {sub && <p className="text-xs text-blue-200/40 mt-0.5">{sub}</p>}
      </div>
      <motion.div
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
          value ? "bg-amber-500/80 border border-amber-500/50" : "bg-blue-950 border border-blue-800/50"
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ left: value ? "calc(100% - 22px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </motion.div>
    </button>
  );
}

// ─── Slider Field ─────────────────────────────────────────────────────────────
function SliderField({ label, sub, value, min, max, step = 1, onChange, leftLabel, rightLabel }: {
  label: string; sub?: string; value: number; min: number; max: number;
  step?: number; onChange: (v: number) => void;
  leftLabel?: string; rightLabel?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-blue-100/80 font-medium">{label}</p>
        {sub && <p className="text-xs text-blue-200/40 mt-0.5">{sub}</p>}
      </div>
      <div className="space-y-1.5">
        <div className="relative h-2 rounded-full bg-blue-950 border border-blue-900/50">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <input
            type="range"
            min={min} max={max} step={step} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#0a0a1a] shadow-[0_0_8px_rgba(245,158,11,0.5)] pointer-events-none"
            animate={{ left: `calc(${pct}% - 8px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        {(leftLabel || rightLabel) && (
          <div className="flex justify-between">
            <span className="text-[10px] text-blue-200/30 font-medium">{leftLabel}</span>
            <span className="text-[10px] text-blue-200/30 font-medium">{rightLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  num, icon, title, sub, children,
}: {
  num: number; icon: React.ReactNode; title: string; sub?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: num * 0.06, ease: "easeOut" }}
      className="rounded-2xl border border-blue-900/40 bg-[#0d0d28]/90 backdrop-blur-sm overflow-hidden"
    >
      <div className="px-5 pt-5 pb-1 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-amber-400 w-4 h-4 flex items-center justify-center">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-400/50 uppercase tracking-widest">
              {String(num).padStart(2, "0")}
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h2>
          </div>
          {sub && <p className="text-xs text-blue-200/40 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="px-5 pb-5 pt-4 space-y-5">{children}</div>
    </motion.div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-blue-200/30 uppercase tracking-widest mb-2">{children}</p>;
}

function Divider() {
  return <div className="border-t border-white/[0.04]" />;
}

// ─── Option Data ──────────────────────────────────────────────────────────────

const CUISINE_OPTIONS = [
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

const FOOD_STYLE_OPTIONS = [
  { value: "full_meal", label: "Full Meal" },
  { value: "drinks", label: "Drinks only" },
  { value: "snacks", label: "Snacks & nibbles" },
  { value: "brunch", label: "Brunch" },
  { value: "dessert", label: "Dessert" },
  { value: "buffet", label: "Buffet" },
];

const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-Free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "dairy_free", label: "Dairy-Free" },
  { value: "nut_free", label: "Nut-Free" },
  { value: "pescatarian", label: "Pescatarian" },
];

const TRANSPORT_OPTIONS = [
  { value: "walking", label: "Walking", icon: <Footprints className="h-3.5 w-3.5" /> },
  { value: "cycling", label: "Cycling", icon: <Bike className="h-3.5 w-3.5" /> },
  { value: "public_transport", label: "Public transport", icon: <Train className="h-3.5 w-3.5" /> },
  { value: "car", label: "Driving", icon: <Car className="h-3.5 w-3.5" /> },
];

const INDOOR_OUTDOOR_OPTIONS = [
  { value: "indoor", label: "Indoors", icon: <Building className="h-3.5 w-3.5" /> },
  { value: "outdoor", label: "Outdoors", icon: <Trees className="h-3.5 w-3.5" /> },
  { value: "both", label: "Either", icon: <Home className="h-3.5 w-3.5" /> },
];

const VIBE_OPTIONS = [
  { value: "chill", label: "Chill", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "lively", label: "Lively", icon: <Music className="h-3.5 w-3.5" /> },
  { value: "productive", label: "Productive", icon: <Briefcase className="h-3.5 w-3.5" /> },
  { value: "romantic", label: "Romantic", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "adventurous", label: "Adventurous", icon: <Zap className="h-3.5 w-3.5" /> },
];

const NOISE_OPTIONS = [
  { value: "quiet", label: "Quiet", icon: <VolumeX className="h-3.5 w-3.5" /> },
  { value: "moderate", label: "Moderate", icon: <Volume1 className="h-3.5 w-3.5" /> },
  { value: "lively", label: "Buzzy", icon: <Volume2 className="h-3.5 w-3.5" /> },
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning", icon: <Sunrise className="h-3.5 w-3.5" /> },
  { value: "afternoon", label: "Afternoon", icon: <Sun className="h-3.5 w-3.5" /> },
  { value: "evening", label: "Evening", icon: <Sunset className="h-3.5 w-3.5" /> },
  { value: "late_night", label: "Late Night", icon: <Moon className="h-3.5 w-3.5" /> },
];

const DURATION_OPTIONS = [
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4+ hours" },
];

const BUDGET_OPTIONS = [
  { value: "£", label: "£  Budget" },
  { value: "££", label: "££  Mid-range" },
  { value: "£££", label: "£££  Premium" },
];

const PRIORITY_OPTIONS = [
  { value: "cheapest", label: "Lowest cost" },
  { value: "shortest_travel", label: "Least travel time" },
  { value: "best_atmosphere", label: "Best atmosphere" },
  { value: "highest_overlap", label: "Highest attendance" },
];

const AVOID_VENUE_OPTIONS = [
  { value: "bars", label: "Bars & pubs" },
  { value: "clubs", label: "Clubs & late venues" },
  { value: "crowded", label: "Crowded places" },
  { value: "loud", label: "Loud environments" },
  { value: "smoking", label: "Smoking areas" },
];

const ACCESSIBILITY_OPTIONS = [
  { value: "wheelchair", label: "Wheelchair access" },
  { value: "step_free", label: "Step-free entry" },
  { value: "quiet_space", label: "Quiet space needed" },
  { value: "hearing_loop", label: "Hearing loop" },
  { value: "allergy_aware", label: "Allergy-aware kitchen" },
];

const MAX_TRAVEL_OPTIONS = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Preferences() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: prefs, isLoading } = trpc.calendar.getPreferences.useQuery();
  const updateMutation = trpc.calendar.updatePreferences.useMutation({
    onSuccess: () => { setIsDirty(false); setIsSaving(false); toast.success("Preferences saved"); },
    onError: (err: { message?: string }) => { setIsSaving(false); toast.error(err.message || "Failed to save"); },
  });

  // ── Section 1: Food & Drink ──
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  // ── Section 2: Travel & Distance ──
  const [maxTravelDistance, setMaxTravelDistance] = useState<number | null>(null);
  const [transportType, setTransportType] = useState<string[]>([]);
  const [midpointPreference, setMidpointPreference] = useState(false);

  // ── Section 3: Energy & Atmosphere ──
  const [vibes, setVibes] = useState<string[]>([]);
  const [noisePreference, setNoisePreference] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [indoorOutdoor, setIndoorOutdoor] = useState<string[]>([]);

  // ── Section 4: Scheduling ──
  const [meetupTimes, setMeetupTimes] = useState<string[]>([]);
  const [idealDuration, setIdealDuration] = useState<number | null>(null);
  const [flexibilityLevel, setFlexibilityLevel] = useState(3);

  // ── Section 5: Weather ──
  const [prefersSunny, setPrefersSunny] = useState(false);
  const [avoidRain, setAvoidRain] = useState(false);
  const [outdoorOnlyGoodWeather, setOutdoorOnlyGoodWeather] = useState(false);

  // ── Section 6: Group Priorities ──
  const [prioritizeType, setPrioritizeType] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState<string[]>([]);

  // ── Section 7: Exclusions ──
  const [avoidVenues, setAvoidVenues] = useState<string[]>([]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);

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

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-[#080818] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="h-8 w-8 text-amber-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080818]">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.025] blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[350px] h-[350px] rounded-full bg-blue-700/[0.035] blur-3xl" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 pt-6 pb-36 space-y-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-xl border border-blue-900/40 bg-[#0d0d28]/60 hover:bg-[#0d0d28] text-blue-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">Your Preferences</h1>
            <p className="text-xs text-blue-200/40">Powers your Golden Window score</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl border border-blue-900/40 bg-[#0d0d28]/60 hover:bg-[#0d0d28] text-blue-300 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Profile strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-blue-900/40 bg-[#0d0d28]/90 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-bold text-white">
              {((user?.user_metadata?.name as string | undefined) || user?.email || "?")[0]!.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{(user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || "No name set"}</p>
            <p className="text-blue-200/40 text-xs truncate">{user?.email || ""}</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className="text-[10px] px-2 py-1 rounded-full border border-amber-500/30 text-amber-400/70 font-medium">
              Member
            </span>
          </div>
        </motion.div>

        {/* ── 01 FOOD & DRINK ── */}
        <SectionCard num={1} icon={<Utensils className="h-4 w-4" />} title="Food & Drink" sub="What cuisines and styles work for you?">
          <div>
            <SubLabel>Favourite cuisines</SubLabel>
            <ChipGroup options={CUISINE_OPTIONS} selected={cuisines} onChange={d(setCuisines)} color="amber" />
          </div>
          <Divider />
          <div>
            <SubLabel>Food style</SubLabel>
            <ChipGroup options={FOOD_STYLE_OPTIONS} selected={foodPreferences} onChange={d(setFoodPreferences)} color="blue" />
          </div>
          <Divider />
          <div>
            <SubLabel>Dietary requirements</SubLabel>
            <ChipGroup options={DIETARY_OPTIONS} selected={dietaryRestrictions} onChange={d(setDietaryRestrictions)} color="purple" />
          </div>
        </SectionCard>

        {/* ── 02 TRAVEL & DISTANCE ── */}
        <SectionCard num={2} icon={<MapPin className="h-4 w-4" />} title="Travel & Distance" sub="How far will you go?">
          <div>
            <SubLabel>Max travel time</SubLabel>
            <div className="flex flex-wrap gap-2">
              {MAX_TRAVEL_OPTIONS.map((opt) => {
                const active = maxTravelDistance === opt.value;
                return (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    value={String(opt.value)}
                    active={active}
                    onToggle={() => { setMaxTravelDistance(active ? null : opt.value); setIsDirty(true); }}
                  />
                );
              })}
            </div>
          </div>
          <Divider />
          <div>
            <SubLabel>How you travel</SubLabel>
            <ChipGroup options={TRANSPORT_OPTIONS} selected={transportType} onChange={d(setTransportType)} multi={false} color="blue" />
          </div>
          <Divider />
          <Toggle
            value={midpointPreference}
            onChange={d(setMidpointPreference)}
            label="Prefer midpoint venues"
            sub="Suggest locations equidistant from all members"
          />
        </SectionCard>

        {/* ── 03 ENERGY & ATMOSPHERE ── */}
        <SectionCard num={3} icon={<Zap className="h-4 w-4" />} title="Energy & Atmosphere" sub="What kind of vibe do you bring?">
          <div>
            <SubLabel>Vibe preference</SubLabel>
            <ChipGroup options={VIBE_OPTIONS} selected={vibes} onChange={d(setVibes)} color="amber" />
          </div>
          <Divider />
          <SliderField
            label="Social energy"
            sub="How social do you want the meetup to feel?"
            value={energyLevel}
            min={1} max={5}
            onChange={d(setEnergyLevel)}
            leftLabel="Chill & relaxed"
            rightLabel="High energy"
          />
          <Divider />
          <div>
            <SubLabel>Noise level</SubLabel>
            <ChipGroup options={NOISE_OPTIONS} selected={noisePreference} onChange={d(setNoisePreference)} multi={false} color="green" />
          </div>
          <Divider />
          <div>
            <SubLabel>Venue setting</SubLabel>
            <ChipGroup options={INDOOR_OUTDOOR_OPTIONS} selected={indoorOutdoor} onChange={d(setIndoorOutdoor)} multi={false} color="blue" />
          </div>
        </SectionCard>

        {/* ── 04 SCHEDULING ── */}
        <SectionCard num={4} icon={<Clock className="h-4 w-4" />} title="Scheduling" sub="When and how long do you prefer?">
          <div>
            <SubLabel>Preferred start times</SubLabel>
            <ChipGroup options={TIME_OPTIONS} selected={meetupTimes} onChange={d(setMeetupTimes)} color="amber" />
          </div>
          <Divider />
          <div>
            <SubLabel>Ideal meetup length</SubLabel>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const active = idealDuration === opt.value;
                return (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    value={String(opt.value)}
                    active={active}
                    onToggle={() => { setIdealDuration(active ? null : opt.value); setIsDirty(true); }}
                  />
                );
              })}
            </div>
          </div>
          <Divider />
          <SliderField
            label="Scheduling flexibility"
            sub="How flexible are you on day and time?"
            value={flexibilityLevel}
            min={1} max={5}
            onChange={d(setFlexibilityLevel)}
            leftLabel="Very strict"
            rightLabel="Very flexible"
          />
        </SectionCard>

        {/* ── 05 WEATHER ── */}
        <SectionCard num={5} icon={<Cloud className="h-4 w-4" />} title="Weather" sub="How does weather affect your plans?">
          <div className="space-y-4">
            <Toggle
              value={prefersSunny}
              onChange={d(setPrefersSunny)}
              label="Prefer sunny weather"
              sub="Prioritise outdoor meetups on good-weather days"
            />
            <Divider />
            <Toggle
              value={avoidRain}
              onChange={d(setAvoidRain)}
              label="Avoid rainy days"
              sub="Lower score for outdoor windows when rain is likely"
            />
            <Divider />
            <Toggle
              value={outdoorOnlyGoodWeather}
              onChange={d(setOutdoorOnlyGoodWeather)}
              label="Outdoors only in good weather"
              sub="Never suggest outdoor venues unless the forecast is clear"
            />
          </div>
        </SectionCard>

        {/* ── 06 GROUP PRIORITIES ── */}
        <SectionCard num={6} icon={<Users className="h-4 w-4" />} title="Group Priorities" sub="What matters most when the group disagrees?">
          <div>
            <SubLabel>Prioritise</SubLabel>
            <ChipGroup options={PRIORITY_OPTIONS} selected={prioritizeType} onChange={d(setPrioritizeType)} multi={false} color="amber" />
          </div>
          <Divider />
          <div>
            <SubLabel>Budget comfort zone</SubLabel>
            <ChipGroup options={BUDGET_OPTIONS} selected={budgetTier} onChange={d(setBudgetTier)} multi={false} color="green" />
          </div>
        </SectionCard>

        {/* ── 07 EXCLUSIONS ── */}
        <SectionCard num={7} icon={<Ban className="h-4 w-4" />} title="Exclusions" sub="Places or situations you'd rather avoid">
          <div>
            <SubLabel>Avoid venue types</SubLabel>
            <ChipGroup options={AVOID_VENUE_OPTIONS} selected={avoidVenues} onChange={d(setAvoidVenues)} color="purple" />
          </div>
          <Divider />
          <div>
            <SubLabel>Accessibility needs</SubLabel>
            <ChipGroup options={ACCESSIBILITY_OPTIONS} selected={accessibilityNeeds} onChange={d(setAccessibilityNeeds)} color="blue" />
          </div>
        </SectionCard>

      </div>

      {/* ── Sticky save bar ── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6"
          >
            <div className="max-w-xl mx-auto">
              <div className="rounded-2xl border border-amber-500/30 bg-[#080818]/95 backdrop-blur-md p-4 flex items-center justify-between gap-4 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
                <div>
                  <p className="text-sm font-semibold text-amber-300">Unsaved changes</p>
                  <p className="text-xs text-blue-200/40">Your preferences power the Golden Window</p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 text-[#080818] font-bold px-5 rounded-xl flex-shrink-0"
                >
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Save</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
