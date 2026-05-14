import { FreeBusyBlock } from "./google-calendar";
import type { InsertAvailabilityWindow } from "../../drizzle/schema";
import { nanoid } from "nanoid";

export interface AvailabilityWindow {
  startTime: Date;
  endTime: Date;
}

/**
 * Normalize busy blocks into free windows
 * Inverts busy periods to calculate when the user is available
 */
export function normalizeBusyToFreeWindows(
  busyBlocks: FreeBusyBlock[],
  lookupStart: Date,
  lookupEnd: Date,
  timezone: string
): AvailabilityWindow[] {
  // Parse and sort busy blocks
  const sorted = busyBlocks
    .map((block) => ({
      start: new Date(block.start),
      end: new Date(block.end),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const windows: AvailabilityWindow[] = [];

  // Add free window before first busy block
  if (sorted.length === 0) {
    // No busy blocks = entirely free
    windows.push({
      startTime: lookupStart,
      endTime: lookupEnd,
    });
  } else {
    // Free time before first busy block
    if (sorted[0].start > lookupStart) {
      windows.push({
        startTime: lookupStart,
        endTime: sorted[0].start,
      });
    }

    // Free time between consecutive busy blocks
    for (let i = 0; i < sorted.length - 1; i++) {
      const gapStart = sorted[i].end;
      const gapEnd = sorted[i + 1].start;

      if (gapEnd > gapStart) {
        windows.push({
          startTime: gapStart,
          endTime: gapEnd,
        });
      }
    }

    // Free time after last busy block
    const lastBusy = sorted[sorted.length - 1];
    if (lastBusy.end < lookupEnd) {
      windows.push({
        startTime: lastBusy.end,
        endTime: lookupEnd,
      });
    }
  }

  // Filter out very small windows (< 15 minutes)
  return windows.filter((w) => w.endTime.getTime() - w.startTime.getTime() >= 15 * 60 * 1000);
}

/**
 * Convert normalized windows to database records
 */
export function convertWindowsToDatabaseRecords(
  windows: AvailabilityWindow[],
  userId: number,
  groupId: string,
  timezone: string
): InsertAvailabilityWindow[] {
  return windows.map((window) => ({
    id: nanoid(36),
    userId,
    groupId,
    startTime: window.startTime,
    endTime: window.endTime,
    source: "google_calendar",
    timezone,
  }));
}

/**
 * Find overlapping free windows across multiple users
 * Returns time slots where all members are available
 */
export function findOverlappingWindows(
  userWindows: Map<number, AvailabilityWindow[]>,
  minAttendance: number = 1
): AvailabilityWindow[] {
  if (userWindows.size === 0) return [];

  const allWindows = Array.from(userWindows.values()).flat();
  if (allWindows.length === 0) return [];

  // Sort all windows by start time
  const sorted = allWindows.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const overlaps: AvailabilityWindow[] = [];
  let currentOverlap: AvailabilityWindow | null = null;
  let attendeeCount = 0;

  for (const window of sorted) {
    if (!currentOverlap) {
      currentOverlap = { ...window };
      attendeeCount = 1;;
    } else if (window.startTime <= currentOverlap.endTime) {
      // Overlapping or adjacent - extend the overlap
      currentOverlap.startTime = new Date(Math.max(currentOverlap.startTime.getTime(), window.startTime.getTime()));
      currentOverlap.endTime = new Date(Math.min(currentOverlap.endTime.getTime(), window.endTime.getTime()));
      attendeeCount++;

      // If overlap is valid and meets minimum attendance, save it
      if (
        attendeeCount >= minAttendance &&
        currentOverlap.endTime.getTime() > currentOverlap.startTime.getTime()
      ) {
        overlaps.push({ ...currentOverlap });
      }
    } else {
      // Gap - reset
      currentOverlap = { ...window };
      attendeeCount = 1;
    }
  }

  return overlaps;
}

/**
 * Score a time window based on preference factors
 */
export interface WindowScore {
  window: AvailabilityWindow;
  attendanceScore: number; // 0-100
  timePreferenceScore: number; // 0-100 (evening/weekend bonus)
  overallScore: number; // 0-100
}

export function scoreTimeWindow(
  window: AvailabilityWindow,
  attendanceCount: number,
  totalMembers: number,
  preferredDays: string[] = ["friday", "saturday", "sunday"],
  preferredHours: { start: number; end: number } = { start: 18, end: 23 }
): WindowScore {
  // Attendance score: higher when more members can attend
  const attendanceScore = (attendanceCount / totalMembers) * 100;

  // Time preference score
  const midTime = new Date(
    (window.startTime.getTime() + window.endTime.getTime()) / 2
  );
  const dayOfWeek = midTime.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hour = midTime.getHours();

  let timePreferenceScore = 0;

  // Evening preference (6 PM - 11 PM)
  if (hour >= preferredHours.start && hour < preferredHours.end) {
    timePreferenceScore += 30;
  }

  // Weekend preference
  if (preferredDays.includes(dayOfWeek)) {
    timePreferenceScore += 40;
  }

  // Bonus for reasonable duration (1-3 hours)
  const durationMinutes = (window.endTime.getTime() - window.startTime.getTime()) / (1000 * 60);
  if (durationMinutes >= 60 && durationMinutes <= 180) {
    timePreferenceScore += 30;
  }

  const overallScore = attendanceScore * 0.6 + timePreferenceScore * 0.4;

  return {
    window,
    attendanceScore,
    timePreferenceScore,
    overallScore: Math.min(100, overallScore),
  };
}
