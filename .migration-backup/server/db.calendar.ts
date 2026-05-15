import { eq, and, gte, lte, desc } from "drizzle-orm";
import { calendarConnections, availabilityWindows, userPreferences } from "../drizzle/schema";
import { getDb } from "./db";
import { nanoid } from "nanoid";
import type { InsertCalendarConnection, InsertAvailabilityWindow, InsertUserPreference } from "../drizzle/schema";

/**
 * Calendar Connection Helpers
 */

export async function getCalendarConnection(userId: number, provider: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(calendarConnections)
    .where(and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, provider)))
    .limit(1);

  return result[0] || null;
}

export async function upsertCalendarConnection(
  userId: number,
  provider: string,
  data: Omit<InsertCalendarConnection, "id" | "userId" | "provider" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getCalendarConnection(userId, provider);

  if (existing) {
    await db
      .update(calendarConnections)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(calendarConnections.id, existing.id));
    return existing.id;
  } else {
    const id = nanoid(36);
    await db.insert(calendarConnections).values({
      id,
      userId,
      provider,
      ...data,
    });
    return id;
  }
}

export async function deleteCalendarConnection(userId: number, provider: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(calendarConnections)
    .where(and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, provider)));
}

/**
 * Availability Window Helpers
 */

export async function getAvailabilityWindows(groupId: string, startTime: Date, endTime: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(availabilityWindows)
    .where(
      and(
        eq(availabilityWindows.groupId, groupId),
        gte(availabilityWindows.endTime, startTime),
        lte(availabilityWindows.startTime, endTime)
      )
    );
}

export async function getUserAvailabilityWindows(userId: number, groupId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(availabilityWindows)
    .where(and(eq(availabilityWindows.userId, userId), eq(availabilityWindows.groupId, groupId)))
    .orderBy(availabilityWindows.startTime);
}

export async function clearAvailabilityWindows(userId: number, groupId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(availabilityWindows)
    .where(and(eq(availabilityWindows.userId, userId), eq(availabilityWindows.groupId, groupId)));
}

export async function insertAvailabilityWindows(windows: InsertAvailabilityWindow[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (windows.length === 0) return;

  await db.insert(availabilityWindows).values(windows);
}

/**
 * User Preferences Helpers
 */

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function upsertUserPreferences(userId: number, data: Partial<InsertUserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserPreferences(userId);

  if (existing) {
    await db
      .update(userPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId));
  } else {
    const id = nanoid(36);
    await db.insert(userPreferences).values({
      id,
      userId,
      ...data,
    });
  }
}
