import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: text("password"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Calendar Connections — OAuth tokens for Google Calendar
 * Stores encrypted access/refresh tokens for each user's calendar provider
 */
export const calendarConnections = mysqlTable(
  "calendar_connections",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    provider: varchar("provider", { length: 32 }).notNull(), // 'google', 'apple', 'outlook'
    accessToken: text("accessToken").notNull(), // encrypted
    refreshToken: text("refreshToken"), // encrypted, nullable for some providers
    expiresAt: timestamp("expiresAt"),
    email: varchar("email", { length: 320 }),
    lastSynced: timestamp("lastSynced"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userProviderUnique: uniqueIndex("calendar_connections_user_provider_unique").on(
      table.userId,
      table.provider
    ),
    userIdIdx: index("calendar_connections_userId_idx").on(table.userId),
  })
);

export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type InsertCalendarConnection = typeof calendarConnections.$inferInsert;

/**
 * Availability Windows — Free time slots synced from calendars
 * Stores normalized free windows per user per group with timezone awareness
 */
export const availabilityWindows = mysqlTable(
  "availability_windows",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull(),
    groupId: varchar("groupId", { length: 36 }).notNull(),
    startTime: timestamp("startTime").notNull(),
    endTime: timestamp("endTime").notNull(),
    source: varchar("source", { length: 32 }).notNull(), // 'manual', 'google_calendar', 'apple_calendar'
    timezone: varchar("timezone", { length: 64 }).notNull(), // e.g., 'America/New_York'
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userGroupIdx: index("availability_windows_userGroup_idx").on(table.userId, table.groupId),
    groupStartIdx: index("availability_windows_groupStart_idx").on(table.groupId, table.startTime),
  })
);

export type AvailabilityWindow = typeof availabilityWindows.$inferSelect;
export type InsertAvailabilityWindow = typeof availabilityWindows.$inferInsert;

/**
 * User Preferences — Extended user profile for Golden Window scoring
 * Stores vibes, budget, location, dietary restrictions, etc.
 */
export const userPreferences = mysqlTable(
  "user_preferences",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId").notNull().unique(),
    maxSpend: int("maxSpend"), // in cents
    maxTravelDistance: int("maxTravelDistance"), // in km
    cuisines: text("cuisines"), // JSON array
    dietaryRestrictions: text("dietaryRestrictions"), // JSON array
    preferredDays: text("preferredDays"), // JSON array: ['monday', 'friday', 'saturday']
    vibes: text("vibes"), // JSON array: ['casual', 'romantic', 'lively']
    homeLat: varchar("homeLat", { length: 32 }),
    homeLng: varchar("homeLng", { length: 32 }),
    timezone: varchar("timezone", { length: 64 }), // e.g., 'America/New_York'
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_preferences_userId_idx").on(table.userId),
  })
);

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Groups — Social circles for group coordination
 */
export const groups = mysqlTable(
  "groups",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    createdByIdx: index("groups_createdBy_idx").on(table.createdBy),
  })
);

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Group Members — Membership and roles in groups
 */
export const groupMembers = mysqlTable(
  "group_members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    groupId: varchar("groupId", { length: 36 }).notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    groupUserUnique: uniqueIndex("group_members_group_user_unique").on(table.groupId, table.userId),
    groupIdIdx: index("group_members_groupId_idx").on(table.groupId),
    userIdIdx: index("group_members_userId_idx").on(table.userId),
  })
);

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;