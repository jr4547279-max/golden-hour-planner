import { eq, and, sql, inArray } from "drizzle-orm";
import { db, users, calendarConnections, availabilityWindows, userPreferences, groups, groupMembers, circleInvites } from "@workspace/db";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { nanoid } from "nanoid";

type User = InferSelectModel<typeof users>;
type InsertUser = InferInsertModel<typeof users>;

export type { User };

export async function upsertUser(user: Partial<InsertUser> & { openId: string }): Promise<void> {
  const updateSet: Record<string, unknown> = {};
  if (user.name !== undefined) updateSet.name = user.name;
  if (user.email !== undefined) updateSet.email = user.email;
  if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
  if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
  if (user.role !== undefined) updateSet.role = user.role;
  if (user.password !== undefined) updateSet.password = user.password;

  if (Object.keys(updateSet).length === 0) {
    updateSet.lastSignedIn = new Date();
  }

  await db
    .insert(users)
    .values({
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      lastSignedIn: user.lastSignedIn ?? new Date(),
      role: user.role ?? "user",
      password: user.password ?? null,
    })
    .onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function createUser(user: InsertUser): Promise<User> {
  const result = await db.insert(users).values(user).returning();
  if (!result[0]) throw new Error("Failed to create user");
  return result[0];
}

// ─── Calendar ────────────────────────────────────────────────────────────────

type CalendarConnection = InferSelectModel<typeof calendarConnections>;

export async function getCalendarConnection(userId: number, provider: string): Promise<CalendarConnection | null> {
  const result = await db
    .select()
    .from(calendarConnections)
    .where(and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, provider)))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertCalendarConnection(
  userId: number,
  provider: string,
  data: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: Date | null;
    email?: string | null;
    lastSynced?: Date | null;
  }
): Promise<void> {
  const existing = await getCalendarConnection(userId, provider);
  if (existing) {
    await db
      .update(calendarConnections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(calendarConnections.id, existing.id));
  } else {
    await db.insert(calendarConnections).values({
      id: nanoid(36),
      userId,
      provider,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? null,
      expiresAt: data.expiresAt ?? null,
      email: data.email ?? null,
      lastSynced: data.lastSynced ?? null,
    });
  }
}

export async function deleteCalendarConnection(userId: number, provider: string): Promise<void> {
  await db
    .delete(calendarConnections)
    .where(and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, provider)));
}

export async function clearAvailabilityWindows(userId: number, groupId: string): Promise<void> {
  await db
    .delete(availabilityWindows)
    .where(and(eq(availabilityWindows.userId, userId), eq(availabilityWindows.groupId, groupId)));
}

export async function insertAvailabilityWindows(
  windows: Array<{ userId: number; groupId: string; startTime: Date; endTime: Date; source: string; timezone: string }>
): Promise<void> {
  if (windows.length === 0) return;
  await db.insert(availabilityWindows).values(
    windows.map((w) => ({ id: nanoid(36), ...w }))
  );
}

export async function getUserAvailabilityWindows(userId: number, groupId: string) {
  return db
    .select()
    .from(availabilityWindows)
    .where(and(eq(availabilityWindows.userId, userId), eq(availabilityWindows.groupId, groupId)));
}

export async function getUserPreferences(userId: number) {
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertUserPreferences(
  userId: number,
  data: Partial<InferInsertModel<typeof userPreferences>>
): Promise<void> {
  const existing = await getUserPreferences(userId);
  if (existing) {
    await db.update(userPreferences).set({ ...data, updatedAt: new Date() }).where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({ id: nanoid(36), userId, ...data });
  }
}

// ─── Circles ─────────────────────────────────────────────────────────────────

export type Circle = InferSelectModel<typeof groups>;
export type InsertCircle = InferInsertModel<typeof groups>;
export type CircleInvite = InferSelectModel<typeof circleInvites>;

export type CircleType = "friends" | "family" | "work" | "date_night" | "other";

export async function createCircle(
  userId: number,
  data: { name: string; description?: string | null; type: CircleType }
): Promise<Circle> {
  const circleId = nanoid(36);
  const [circle] = await db
    .insert(groups)
    .values({
      id: circleId,
      name: data.name,
      description: data.description ?? null,
      type: data.type,
      createdBy: userId,
    })
    .returning();
  if (!circle) throw new Error("Failed to create circle");

  await db.insert(groupMembers).values({
    id: nanoid(36),
    groupId: circleId,
    userId,
    role: "admin",
  });

  return circle;
}

export async function getCirclesByUser(userId: number): Promise<Circle[]> {
  const memberRows = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId));

  if (memberRows.length === 0) return [];

  const circleIds = memberRows.map((r) => r.groupId);

  const result = await db
    .select()
    .from(groups)
    .where(inArray(groups.id, circleIds));

  return result;
}

export async function getCircleById(circleId: string): Promise<Circle | null> {
  const result = await db.select().from(groups).where(eq(groups.id, circleId)).limit(1);
  return result[0] ?? null;
}

export async function getCircleMemberCount(circleId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, circleId));
  return result[0]?.count ?? 0;
}

export async function getCirclePendingInviteCount(circleId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(circleInvites)
    .where(and(eq(circleInvites.circleId, circleId), eq(circleInvites.status, "pending")));
  return result[0]?.count ?? 0;
}

export async function getCircleCreator(circleId: string): Promise<User | null> {
  const circle = await getCircleById(circleId);
  if (!circle) return null;
  const result = await db.select().from(users).where(eq(users.id, circle.createdBy)).limit(1);
  return result[0] ?? null;
}

export async function isCircleMember(circleId: string, userId: number): Promise<boolean> {
  const result = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, circleId), eq(groupMembers.userId, userId)))
    .limit(1);
  return result.length > 0;
}
