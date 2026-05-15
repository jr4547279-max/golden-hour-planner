// ─── Golden Window Engine ─────────────────────────────────────────────────────
// Deterministic, rule-based scoring. No AI. Designed for future AI upgrade.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const TIME_SLOTS = ["morning", "afternoon", "evening", "late_night"] as const;
export type Day = (typeof DAYS)[number];
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  late_night: "Late Night",
};

export const VIBE_LABELS: Record<string, string> = {
  chill: "Chill",
  lively: "Lively",
  productive: "Productive",
  romantic: "Romantic",
  adventurous: "Adventurous",
};

export const VENUE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar / Pub",
  cafe: "Café",
  park: "Park",
  indoor_activity: "Indoor Activity",
  outdoor_activity: "Outdoor Activity",
};

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

export interface MemberAvailability {
  userId: number;
  name: string | null;
  email: string | null;
  availableDays: string[];
  preferredTimes: string[];
}

export interface MemberPrefs {
  userId: number;
  vibes: string[];
  budgetTier: string | null;
  indoorOutdoor: string | null;
  foodPreferences: string[];
}

export interface GoldenWindowResult {
  day: Day;
  timeSlot: TimeSlot;
  matchScore: number;
  availableCount: number;
  totalMembers: number;
  availableMembers: Array<{ name: string | null; email: string | null }>;
  suggestedVibe: string | null;
  suggestedVenueType: string | null;
  suggestedBudget: string | null;
  vibeLabel: string | null;
  venueLabel: string | null;
}

export function calculateGoldenWindows(
  memberAvailability: MemberAvailability[],
  memberPrefs: MemberPrefs[],
  circlePrefs?: { defaultVibe?: string | null; defaultVenueType?: string | null; budgetRange?: string | null } | null
): GoldenWindowResult[] {
  const totalMembers = memberAvailability.length;
  if (totalMembers === 0) return [];

  // Build preference consensus
  const allVibes = memberPrefs.flatMap((p) => p.vibes);
  const allBudgets = memberPrefs.map((p) => p.budgetTier).filter(Boolean) as string[];
  const allVenueTypes = memberPrefs.flatMap((p) => {
    if (p.indoorOutdoor === "indoor") return ["cafe", "restaurant", "indoor_activity"];
    if (p.indoorOutdoor === "outdoor") return ["park", "outdoor_activity"];
    return ["restaurant", "cafe", "bar"];
  });

  const consensusVibe = circlePrefs?.defaultVibe
    ? safeParseJSON(circlePrefs.defaultVibe)[0] ?? mode(allVibes)
    : mode(allVibes);

  const consensusBudget = circlePrefs?.budgetRange ?? mode(allBudgets);

  const circleVenueTypes = circlePrefs?.defaultVenueType
    ? safeParseJSON(circlePrefs.defaultVenueType)
    : [];
  const consensusVenueType = circleVenueTypes[0] ?? mode(allVenueTypes);

  const results: GoldenWindowResult[] = [];

  for (const day of DAYS) {
    for (const timeSlot of TIME_SLOTS) {
      // Count who is available on this day × time
      const available = memberAvailability.filter((m) => {
        const hasDay = m.availableDays.includes(day);
        const hasTime = m.preferredTimes.length === 0 || m.preferredTimes.includes(timeSlot);
        return hasDay && hasTime;
      });

      if (available.length === 0) continue;

      const availabilityScore = (available.length / totalMembers) * 60;

      // Preference compatibility score (out of 40)
      let prefScore = 0;

      // Vibe consensus: +15 if at least half agree
      if (consensusVibe) {
        const vibeAgreement = memberPrefs.filter((p) => p.vibes.includes(consensusVibe)).length;
        prefScore += (vibeAgreement / Math.max(memberPrefs.length, 1)) * 15;
      } else {
        prefScore += 10; // neutral bonus
      }

      // Budget consensus: +15 if at least half agree
      if (consensusBudget) {
        const budgetAgreement = memberPrefs.filter((p) => p.budgetTier === consensusBudget).length;
        prefScore += (budgetAgreement / Math.max(memberPrefs.length, 1)) * 15;
      } else {
        prefScore += 10;
      }

      // Venue consensus: +10 if we have a clear type
      if (consensusVenueType) {
        prefScore += 10;
      } else {
        prefScore += 5;
      }

      const matchScore = Math.round(Math.min(100, availabilityScore + prefScore));

      results.push({
        day,
        timeSlot,
        matchScore,
        availableCount: available.length,
        totalMembers,
        availableMembers: available.map((m) => ({ name: m.name, email: m.email })),
        suggestedVibe: consensusVibe,
        suggestedVenueType: consensusVenueType,
        suggestedBudget: consensusBudget,
        vibeLabel: consensusVibe ? (VIBE_LABELS[consensusVibe] ?? consensusVibe) : null,
        venueLabel: consensusVenueType ? (VENUE_LABELS[consensusVenueType] ?? consensusVenueType) : null,
      });
    }
  }

  // Sort by score desc, then by member count desc
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.availableCount - a.availableCount;
  });

  return results.slice(0, 3);
}
