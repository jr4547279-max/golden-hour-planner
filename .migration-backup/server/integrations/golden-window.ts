import type { AvailabilityWindow } from "./availability-sync";

/**
 * Golden Window Engine
 * Calculates overlapping availability windows and scores them by:
 * 1. Attendance (highest priority)
 * 2. Travel fairness (distance-based scoring)
 * 3. Evening/weekend preference
 */

export interface Member {
  id: number;
  name: string;
  email: string;
  homeLat?: number;
  homeLng?: number;
}

export interface MemberAvailability {
  member: Member;
  windows: AvailabilityWindow[];
}

export interface ScoredWindow {
  startTime: Date;
  endTime: Date;
  attendanceCount: number;
  attendanceScore: number; // 0-100
  travelFairnessScore: number; // 0-100
  timePreferenceScore: number; // 0-100
  overallScore: number; // 0-100
  attendees: Member[];
}

/**
 * Find overlapping windows across all members
 */
export function findOverlappingWindows(
  memberAvailabilities: MemberAvailability[]
): AvailabilityWindow[] {
  if (memberAvailabilities.length === 0) return [];

  // Collect all time points where availability changes
  const timePoints = new Set<number>();
  for (const { windows } of memberAvailabilities) {
    for (const window of windows) {
      timePoints.add(window.startTime.getTime());
      timePoints.add(window.endTime.getTime());
    }
  }

  const sorted = Array.from(timePoints).sort((a, b) => a - b);
  const overlaps: AvailabilityWindow[] = [];

  // Check each interval between time points
  for (let i = 0; i < sorted.length - 1; i++) {
    const intervalStart = new Date(sorted[i]);
    const intervalEnd = new Date(sorted[i + 1]);

    // Count how many members are available in this interval
    let count = 0;
    for (const { windows } of memberAvailabilities) {
      for (const window of windows) {
        if (window.startTime <= intervalStart && window.endTime >= intervalEnd) {
          count++;
          break;
        }
      }
    }

    // Include interval if at least 2 members are available
    if (count >= 2) {
      overlaps.push({ startTime: intervalStart, endTime: intervalEnd });
    }
  }

  // Merge adjacent overlapping windows
  return mergeAdjacentWindows(overlaps);
}

/**
 * Merge adjacent time windows
 */
function mergeAdjacentWindows(windows: AvailabilityWindow[]): AvailabilityWindow[] {
  if (windows.length === 0) return [];

  const sorted = windows.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const merged: AvailabilityWindow[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime <= current.endTime) {
      // Merge
      current.endTime = new Date(Math.max(current.endTime.getTime(), sorted[i].endTime.getTime()));
    } else {
      // Gap - save current and start new
      merged.push(current);
      current = sorted[i];
    }
  }
  merged.push(current);

  return merged;
}

/**
 * Calculate geographic distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate travel fairness score
 * Lower scores when one person has to travel significantly more than others
 */
function calculateTravelFairnessScore(
  attendees: Member[],
  meetupLat: number,
  meetupLng: number
): number {
  // Filter members with location data
  const membersWithLocation = attendees.filter((m) => m.homeLat !== undefined && m.homeLng !== undefined);

  if (membersWithLocation.length === 0) {
    return 100; // No location data, assume fair
  }

  // Calculate distances
  const distances = membersWithLocation.map((m) =>
    calculateDistance(m.homeLat!, m.homeLng!, meetupLat, meetupLng)
  );

  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const maxDistance = Math.max(...distances);
  const minDistance = Math.min(...distances);

  // Fairness decreases if there's a large disparity
  const disparity = maxDistance - minDistance;
  const fairnessScore = Math.max(0, 100 - disparity * 5); // 5 points per km disparity

  return fairnessScore;
}

/**
 * Score a window based on all factors
 */
export function scoreWindow(
  window: AvailabilityWindow,
  memberAvailabilities: MemberAvailability[],
  meetupLat: number = 0,
  meetupLng: number = 0,
  preferredDays: string[] = ["friday", "saturday", "sunday"],
  preferredHours: { start: number; end: number } = { start: 18, end: 23 }
): ScoredWindow {
  // Find attendees for this window
  const attendees: Member[] = [];
  for (const { member, windows } of memberAvailabilities) {
    for (const w of windows) {
      if (w.startTime <= window.startTime && w.endTime >= window.endTime) {
        attendees.push(member);
        break;
      }
    }
  }

  const attendanceCount = attendees.length;
  const totalMembers = memberAvailabilities.length;

  // Attendance score: 0-100 based on percentage of members attending
  const attendanceScore = (attendanceCount / totalMembers) * 100;

  // Travel fairness score: 0-100 based on distance equity
  const travelFairnessScore = calculateTravelFairnessScore(attendees, meetupLat, meetupLng);

  // Time preference score: 0-100 based on day/hour preferences
  let timePreferenceScore = 0;

  const midTime = new Date((window.startTime.getTime() + window.endTime.getTime()) / 2);
  const dayOfWeek = midTime.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hour = midTime.getHours();

  // Evening preference (6 PM - 11 PM)
  if (hour >= preferredHours.start && hour < preferredHours.end) {
    timePreferenceScore += 40;
  }

  // Weekend preference
  if (preferredDays.includes(dayOfWeek)) {
    timePreferenceScore += 40;
  }

  // Bonus for reasonable duration (1-3 hours)
  const durationMinutes = (window.endTime.getTime() - window.startTime.getTime()) / (1000 * 60);
  if (durationMinutes >= 60 && durationMinutes <= 180) {
    timePreferenceScore += 20;
  }

  // Overall score: weighted combination
  // Attendance: 50%, Travel Fairness: 25%, Time Preference: 25%
  const overallScore = attendanceScore * 0.5 + travelFairnessScore * 0.25 + timePreferenceScore * 0.25;

  return {
    startTime: window.startTime,
    endTime: window.endTime,
    attendanceCount,
    attendanceScore,
    travelFairnessScore,
    timePreferenceScore,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    attendees,
  };
}

/**
 * Find and score the best Golden Windows
 */
export function findGoldenWindows(
  memberAvailabilities: MemberAvailability[],
  meetupLat: number = 0,
  meetupLng: number = 0,
  limit: number = 5
): ScoredWindow[] {
  // Find overlapping windows
  const overlaps = findOverlappingWindows(memberAvailabilities);

  // Score each window
  const scored = overlaps.map((window) =>
    scoreWindow(window, memberAvailabilities, meetupLat, meetupLng)
  );

  // Sort by overall score (descending) and return top N
  return scored.sort((a, b) => b.overallScore - a.overallScore).slice(0, limit);
}
