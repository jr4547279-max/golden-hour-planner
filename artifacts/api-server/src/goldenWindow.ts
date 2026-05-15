// ─── Golden Window Engine v2 ──────────────────────────────────────────────────
// Deterministic, rule-based scoring across 8 weighted dimensions.
// No AI. Modular — each scorer is a pure function for future AI upgrades.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const TIME_SLOTS = ["morning", "afternoon", "evening", "late_night"] as const;
export type Day = (typeof DAYS)[number];
export type TimeSlot = (typeof TIME_SLOTS)[number];

// ─── Weights (must sum to 100) ────────────────────────────────────────────────
const W = {
  availability:     40,
  timePreference:   15,
  vibe:             15,
  venue:            10,
  budget:           10,
  cuisine:           5,
  dietary:           5,
} as const;

// ─── Labels ───────────────────────────────────────────────────────────────────
export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  late_night: "Late Night",
};

export const TIME_SLOT_HOURS: Record<TimeSlot, string> = {
  morning: "6am – 12pm",
  afternoon: "12pm – 6pm",
  evening: "6pm – 10pm",
  late_night: "10pm+",
};

export const VIBE_LABELS: Record<string, string> = {
  chill: "Chill",
  lively: "Lively",
  productive: "Productive",
  romantic: "Romantic",
  adventurous: "Adventurous",
};

export const VIBE_EMOJIS: Record<string, string> = {
  chill: "😌",
  lively: "🎉",
  productive: "💼",
  romantic: "❤️",
  adventurous: "🚀",
};

export const VENUE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar / Pub",
  cafe: "Café",
  park: "Park",
  indoor_activity: "Indoor Activity",
  outdoor_activity: "Outdoor Activity",
};

export const CUISINE_LABELS: Record<string, string> = {
  italian: "Italian",
  japanese: "Japanese",
  mexican: "Mexican",
  indian: "Indian",
  chinese: "Chinese",
  thai: "Thai",
  mediterranean: "Mediterranean",
  american: "American",
  french: "French",
  british: "British",
  greek: "Greek",
  korean: "Korean",
  spanish: "Spanish",
};

const FOOD_PREF_LABELS: Record<string, string> = {
  drinks: "Drinks",
  snacks: "Snacks",
  full_meal: "Full Meal",
  dessert: "Dessert",
  brunch: "Brunch",
  buffet: "Buffet",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeParseJSON(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val) as string[]; } catch { return []; }
}

function mode(arr: string[]): string | null {
  if (arr.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = "";
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) { bestCount = c; best = k; }
  }
  return best || null;
}

function topN(arr: string[], n: number): string[] {
  if (arr.length === 0) return [];
  const counts = new Map<string, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

function agreementPct(arr: string[], target: string): number {
  if (arr.length === 0) return 0;
  return arr.filter((v) => v === target).length / arr.length;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface MemberAvailability {
  userId: number;
  name: string | null;
  email: string | null;
  availableDays: string[];
  preferredTimes: string[];    // from availability modal (the new table)
}

export interface MemberPrefs {
  userId: number;
  vibes: string[];
  budgetTier: string | null;
  indoorOutdoor: string | null;
  cuisines: string[];
  dietaryRestrictions: string[];
  foodPreferences: string[];
  transportType: string | null;
  maxTravelDistance: number | null;
  meetupTimes: string[];       // from user_preferences (general preferred times)
}

export interface CirclePrefs {
  defaultVibe?: string | null;
  defaultVenueType?: string | null;
  budgetRange?: string | null;
  preferredArea?: string | null;
}

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  availability: number;    // 0–40
  timePreference: number;  // 0–15
  vibe: number;            // 0–15
  venue: number;           // 0–10
  budget: number;          // 0–10
  cuisine: number;         // 0–5
  dietary: number;         // 0–5
}

export interface GoldenWindowResult {
  day: Day;
  timeSlot: TimeSlot;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  availableCount: number;
  totalMembers: number;
  availableMembers: Array<{ name: string | null; email: string | null }>;
  // Suggestions
  suggestedVibe: string | null;
  suggestedVenueType: string | null;
  suggestedBudget: string | null;
  suggestedCuisines: string[];
  suggestedFoodType: string | null;
  travelFit: string | null;
  dietaryNote: string | null;
  // Labels
  vibeLabel: string | null;
  venueLabel: string | null;
  vibeEmoji: string | null;
  // Explanation
  explanation: string;
  explanationPoints: string[];
}

// ─── Individual Scorers ───────────────────────────────────────────────────────

function scoreAvailability(
  availableCount: number,
  totalMembers: number
): number {
  if (totalMembers === 0) return 0;
  // Parabolic: full credit at 100%, partial credit is non-linear to reward higher attendance
  const ratio = availableCount / totalMembers;
  return Math.round(ratio * ratio * W.availability * 10) / 10;
  // Note: ratio² means 80% attendance = 64% of 40 = 25.6pts, not 32pts
  // This incentivises finding slots where everyone is available
}

function scoreTimePreference(
  timeSlot: TimeSlot,
  memberPrefs: MemberPrefs[],
  availableUserIds: number[]
): number {
  if (memberPrefs.length === 0) return W.timePreference * 0.6; // neutral
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  if (relevantPrefs.length === 0) return W.timePreference * 0.6;
  const withTimePref = relevantPrefs.filter((p) => p.meetupTimes.length > 0);
  if (withTimePref.length === 0) return W.timePreference * 0.7; // no data → neutral
  const agreeing = withTimePref.filter((p) => p.meetupTimes.includes(timeSlot)).length;
  return Math.round((agreeing / withTimePref.length) * W.timePreference * 10) / 10;
}

function scoreVibe(
  memberPrefs: MemberPrefs[],
  circlePrefs: CirclePrefs | null,
  availableUserIds: number[]
): { score: number; winner: string | null } {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const allVibes = relevantPrefs.flatMap((p) => p.vibes);

  // Circle override takes priority
  const circleVibes = safeParseJSON(circlePrefs?.defaultVibe ?? null);
  const targetVibe = circleVibes[0] ?? mode(allVibes);

  if (!targetVibe) return { score: W.vibe * 0.6, winner: null };

  const agreeing = relevantPrefs.filter((p) =>
    p.vibes.length === 0 || p.vibes.includes(targetVibe)
  ).length;
  const total = Math.max(relevantPrefs.length, 1);
  const score = Math.round((agreeing / total) * W.vibe * 10) / 10;
  return { score, winner: targetVibe };
}

function scoreVenue(
  memberPrefs: MemberPrefs[],
  circlePrefs: CirclePrefs | null,
  availableUserIds: number[]
): { score: number; venueType: string | null } {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const circleVenueTypes = safeParseJSON(circlePrefs?.defaultVenueType ?? null);

  // Derive preferred venue from indoor/outdoor prefs
  const allVenueTypes = relevantPrefs.flatMap((p) => {
    if (p.indoorOutdoor === "indoor") return ["cafe", "restaurant", "indoor_activity"];
    if (p.indoorOutdoor === "outdoor") return ["park", "outdoor_activity"];
    return ["restaurant", "cafe", "bar"];
  });

  const targetVenue = circleVenueTypes[0] ?? mode(allVenueTypes);

  if (!targetVenue) return { score: W.venue * 0.5, venueType: null };

  // Score: how many members agree on indoor vs outdoor
  const indoorCount = relevantPrefs.filter((p) => p.indoorOutdoor === "indoor").length;
  const outdoorCount = relevantPrefs.filter((p) => p.indoorOutdoor === "outdoor").length;
  const total = Math.max(relevantPrefs.length, 1);
  const consensus = Math.max(indoorCount, outdoorCount) / total;
  const score = Math.round(consensus * W.venue * 10) / 10;

  return { score, venueType: targetVenue };
}

function scoreBudget(
  memberPrefs: MemberPrefs[],
  circlePrefs: CirclePrefs | null,
  availableUserIds: number[]
): { score: number; budget: string | null } {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const allBudgets = relevantPrefs.map((p) => p.budgetTier).filter(Boolean) as string[];

  const targetBudget = circlePrefs?.budgetRange ?? mode(allBudgets);
  if (!targetBudget) return { score: W.budget * 0.5, budget: null };

  // Score: agreement on budget + tolerance for adjacent tiers
  const BUDGET_MAP: Record<string, number> = { "£": 1, "££": 2, "£££": 3 };
  const targetVal = BUDGET_MAP[targetBudget] ?? 2;

  let totalScore = 0;
  const withBudget = relevantPrefs.filter((p) => p.budgetTier);
  if (withBudget.length === 0) return { score: W.budget * 0.5, budget: targetBudget };

  for (const p of withBudget) {
    const pVal = BUDGET_MAP[p.budgetTier!] ?? 2;
    const diff = Math.abs(pVal - targetVal);
    totalScore += diff === 0 ? 1 : diff === 1 ? 0.5 : 0.1;
  }
  const score = Math.round((totalScore / withBudget.length) * W.budget * 10) / 10;
  return { score, budget: targetBudget };
}

function scoreCuisine(
  memberPrefs: MemberPrefs[],
  availableUserIds: number[]
): { score: number; cuisines: string[] } {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const allCuisines = relevantPrefs.flatMap((p) => p.cuisines);
  if (allCuisines.length === 0) return { score: W.cuisine * 0.5, cuisines: [] };

  const counts = new Map<string, number>();
  for (const c of allCuisines) counts.set(c, (counts.get(c) ?? 0) + 1);

  const memberCount = Math.max(relevantPrefs.length, 1);
  // Find cuisines liked by >30% of available members
  const popular = [...counts.entries()]
    .filter(([, n]) => n / memberCount >= 0.3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([c]) => c);

  if (popular.length === 0) {
    const topCuisine = topN(allCuisines, 1)[0];
    return { score: W.cuisine * 0.3, cuisines: topCuisine ? [topCuisine] : [] };
  }

  const topCount = counts.get(popular[0]!) ?? 0;
  const score = Math.round((topCount / memberCount) * W.cuisine * 10) / 10;
  return { score, cuisines: popular };
}

function scoreDietary(
  memberPrefs: MemberPrefs[],
  availableUserIds: number[]
): { score: number; note: string | null } {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const allRestrictions = relevantPrefs.flatMap((p) => p.dietaryRestrictions);
  if (allRestrictions.length === 0) return { score: W.dietary, note: null }; // no restrictions = full score

  const restrictionCounts = new Map<string, number>();
  for (const r of allRestrictions) restrictionCounts.set(r, (restrictionCounts.get(r) ?? 0) + 1);

  const significantRestrictions = [...restrictionCounts.entries()]
    .filter(([, n]) => n >= 1)
    .map(([r]) => r);

  // More restrictions = lower compatibility score, but never zero
  const ratio = 1 - Math.min(significantRestrictions.length / 5, 0.5);
  const score = Math.round(ratio * W.dietary * 10) / 10;

  const DIETARY_LABELS: Record<string, string> = {
    vegetarian: "Vegetarian", vegan: "Vegan", halal: "Halal",
    kosher: "Kosher", gluten_free: "Gluten-free", dairy_free: "Dairy-free",
    nut_allergy: "Nut-free", pescatarian: "Pescatarian",
  };

  const noteItems = significantRestrictions
    .slice(0, 2)
    .map((r) => DIETARY_LABELS[r] ?? r);
  const note = noteItems.length > 0 ? `${noteItems.join(" & ")} options needed` : null;

  return { score, note };
}

function inferTravelFit(memberPrefs: MemberPrefs[], availableUserIds: number[]): string | null {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const withTransport = relevantPrefs.filter((p) => p.transportType);
  if (withTransport.length === 0) return null;

  const types = withTransport.map((p) => p.transportType!);
  const publicCount = types.filter((t) => t === "public_transport").length;
  const walkCycleCount = types.filter((t) => ["walking", "cycling"].includes(t)).length;
  const driveCount = types.filter((t) => t === "car").length;
  const total = types.length;

  if (walkCycleCount / total >= 0.6) return "Walking / cycling distance ideal";
  if (publicCount / total >= 0.5) return "Central or transit-connected venue";
  if (driveCount / total >= 0.6) return "Parking availability preferred";
  return "Mixed travel modes — central location works best";
}

function inferFoodType(memberPrefs: MemberPrefs[], availableUserIds: number[]): string | null {
  const relevantPrefs = memberPrefs.filter((p) => availableUserIds.includes(p.userId));
  const allFoodPrefs = relevantPrefs.flatMap((p) => p.foodPreferences);
  const topFood = topN(allFoodPrefs, 1)[0];
  return topFood ? (FOOD_PREF_LABELS[topFood] ?? topFood) : null;
}

// ─── Explanation Builder ──────────────────────────────────────────────────────

function buildExplanation(
  result: Omit<GoldenWindowResult, "explanation" | "explanationPoints">,
  breakdown: ScoreBreakdown
): { explanation: string; explanationPoints: string[] } {
  const points: string[] = [];

  // Attendance
  const attendanceRatio = result.availableCount / Math.max(result.totalMembers, 1);
  if (attendanceRatio === 1) {
    points.push(`All ${result.totalMembers} members are free`);
  } else {
    points.push(`${result.availableCount} of ${result.totalMembers} members available`);
  }

  // Vibe
  if (breakdown.vibe >= W.vibe * 0.8 && result.vibeLabel) {
    points.push(`Strong "${result.vibeLabel}" vibe consensus`);
  } else if (result.vibeLabel) {
    points.push(`"${result.vibeLabel}" vibe is most popular`);
  }

  // Cuisine
  if (result.suggestedCuisines.length > 0) {
    const cuisineNames = result.suggestedCuisines
      .map((c) => CUISINE_LABELS[c] ?? c)
      .join(" & ");
    points.push(`Cuisine match: ${cuisineNames}`);
  }

  // Dietary
  if (result.dietaryNote) {
    points.push(result.dietaryNote);
  }

  // Travel
  if (result.travelFit) {
    points.push(result.travelFit);
  }

  // Budget
  if (result.suggestedBudget && breakdown.budget >= W.budget * 0.7) {
    points.push(`Budget: ${result.suggestedBudget} range agreed`);
  }

  // Build short headline
  const attendanceText = attendanceRatio === 1 ? "Perfect attendance" : `${result.availableCount}/${result.totalMembers} members`;
  const vibeText = result.vibeLabel ? ` · ${result.vibeLabel}` : "";
  const cuisineText = result.suggestedCuisines.length > 0
    ? ` · ${result.suggestedCuisines.map((c) => CUISINE_LABELS[c] ?? c).join(" & ")}`
    : "";
  const explanation = `${attendanceText}${vibeText}${cuisineText}`;

  return { explanation, explanationPoints: points.slice(0, 4) };
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export function calculateGoldenWindows(
  memberAvailability: MemberAvailability[],
  memberPrefs: MemberPrefs[],
  circlePrefs?: CirclePrefs | null
): GoldenWindowResult[] {
  const totalMembers = memberAvailability.length;
  if (totalMembers === 0) return [];

  const cPrefs = circlePrefs ?? null;
  const results: GoldenWindowResult[] = [];

  for (const day of DAYS) {
    for (const timeSlot of TIME_SLOTS) {
      // 1 — Who is available?
      const available = memberAvailability.filter((m) => {
        const hasDay = m.availableDays.includes(day);
        // If member set no preferred times, treat them as available any time on that day
        const hasTime = m.preferredTimes.length === 0 || m.preferredTimes.includes(timeSlot);
        return hasDay && hasTime;
      });

      if (available.length === 0) continue;

      const availableIds = available.map((m) => m.userId);

      // 2 — Score each dimension
      const availScore = scoreAvailability(available.length, totalMembers);
      const timeScore  = scoreTimePreference(timeSlot, memberPrefs, availableIds);
      const { score: vibeScore, winner: vibeWinner } = scoreVibe(memberPrefs, cPrefs, availableIds);
      const { score: venueScore, venueType } = scoreVenue(memberPrefs, cPrefs, availableIds);
      const { score: budgetScore, budget: budgetWinner } = scoreBudget(memberPrefs, cPrefs, availableIds);
      const { score: cuisineScore, cuisines } = scoreCuisine(memberPrefs, availableIds);
      const { score: dietaryScore, note: dietaryNote } = scoreDietary(memberPrefs, availableIds);

      const breakdown: ScoreBreakdown = {
        availability: availScore,
        timePreference: timeScore,
        vibe: vibeScore,
        venue: venueScore,
        budget: budgetScore,
        cuisine: cuisineScore,
        dietary: dietaryScore,
      };

      const matchScore = Math.min(
        100,
        Math.round(
          availScore + timeScore + vibeScore + venueScore +
          budgetScore + cuisineScore + dietaryScore
        )
      );

      // 3 — Infer ancillary suggestions
      const travelFit = inferTravelFit(memberPrefs, availableIds);
      const suggestedFoodType = inferFoodType(memberPrefs, availableIds);

      const partial: Omit<GoldenWindowResult, "explanation" | "explanationPoints"> = {
        day,
        timeSlot,
        matchScore,
        scoreBreakdown: breakdown,
        availableCount: available.length,
        totalMembers,
        availableMembers: available.map((m) => ({ name: m.name, email: m.email })),
        suggestedVibe: vibeWinner,
        suggestedVenueType: venueType,
        suggestedBudget: budgetWinner,
        suggestedCuisines: cuisines,
        suggestedFoodType,
        travelFit,
        dietaryNote,
        vibeLabel: vibeWinner ? (VIBE_LABELS[vibeWinner] ?? vibeWinner) : null,
        venueLabel: venueType ? (VENUE_LABELS[venueType] ?? venueType) : null,
        vibeEmoji: vibeWinner ? (VIBE_EMOJIS[vibeWinner] ?? null) : null,
      };

      const { explanation, explanationPoints } = buildExplanation(partial, breakdown);

      results.push({ ...partial, explanation, explanationPoints });
    }
  }

  // Sort: score desc → attendance desc → day order (Mon first for ties)
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount;
    return DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
  });

  return results.slice(0, 3);
}
