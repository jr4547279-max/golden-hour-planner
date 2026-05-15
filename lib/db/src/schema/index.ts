import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: text("password"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const calendarConnections = pgTable(
  "calendar_connections",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: integer("userId").notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    accessToken: text("accessToken").notNull(),
    refreshToken: text("refreshToken"),
    expiresAt: timestamp("expiresAt"),
    email: varchar("email", { length: 320 }),
    lastSynced: timestamp("lastSynced"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("calendar_connections_user_provider_unique").on(table.userId, table.provider),
    index("calendar_connections_userId_idx").on(table.userId),
  ]
);

export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type InsertCalendarConnection = typeof calendarConnections.$inferInsert;

export const availabilityWindows = pgTable(
  "availability_windows",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: integer("userId").notNull(),
    groupId: varchar("groupId", { length: 36 }).notNull(),
    startTime: timestamp("startTime").notNull(),
    endTime: timestamp("endTime").notNull(),
    source: varchar("source", { length: 32 }).notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("availability_windows_userGroup_idx").on(table.userId, table.groupId),
    index("availability_windows_groupStart_idx").on(table.groupId, table.startTime),
  ]
);

export type AvailabilityWindow = typeof availabilityWindows.$inferSelect;
export type InsertAvailabilityWindow = typeof availabilityWindows.$inferInsert;

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: integer("userId").notNull().unique(),
    maxSpend: integer("maxSpend"),
    maxTravelDistance: integer("maxTravelDistance"),
    cuisines: text("cuisines"),
    dietaryRestrictions: text("dietaryRestrictions"),
    foodPreferences: text("foodPreferences"),
    preferredDays: text("preferredDays"),
    meetupTimes: text("meetupTimes"),
    vibes: text("vibes"),
    transportType: varchar("transportType", { length: 32 }),
    indoorOutdoor: varchar("indoorOutdoor", { length: 16 }),
    budgetTier: varchar("budgetTier", { length: 8 }),
    homeLat: varchar("homeLat", { length: 32 }),
    homeLng: varchar("homeLng", { length: 32 }),
    timezone: varchar("timezone", { length: 64 }),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [index("user_preferences_userId_idx").on(table.userId)]
);

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

export const circleTypeEnum = pgEnum("circle_type", ["friends", "family", "work", "date_night", "other"]);

export const groups = pgTable(
  "groups",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: circleTypeEnum("type").default("friends").notNull(),
    createdBy: integer("createdBy").notNull(),
    inviteToken: varchar("inviteToken", { length: 64 }).unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    index("groups_createdBy_idx").on(table.createdBy),
    index("groups_inviteToken_idx").on(table.inviteToken),
  ]
);

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

export const groupMemberRoleEnum = pgEnum("group_member_role", ["admin", "member"]);

export const groupMembers = pgTable(
  "group_members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    groupId: varchar("groupId", { length: 36 }).notNull(),
    userId: integer("userId").notNull(),
    role: groupMemberRoleEnum("role").default("member").notNull(),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("group_members_group_user_unique").on(table.groupId, table.userId),
    index("group_members_groupId_idx").on(table.groupId),
    index("group_members_userId_idx").on(table.userId),
  ]
);

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

export const circleInviteStatusEnum = pgEnum("circle_invite_status", ["pending", "accepted", "declined"]);

export const circleInvites = pgTable(
  "circle_invites",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    circleId: varchar("circleId", { length: 36 }).notNull(),
    invitedByUserId: integer("invitedByUserId").notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    token: varchar("token", { length: 64 }).notNull().unique(),
    status: circleInviteStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
  },
  (table) => [
    index("circle_invites_circleId_idx").on(table.circleId),
    index("circle_invites_email_idx").on(table.email),
  ]
);

export type CircleInvite = typeof circleInvites.$inferSelect;
export type InsertCircleInvite = typeof circleInvites.$inferInsert;

export const circlePreferences = pgTable(
  "circle_preferences",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    circleId: varchar("circleId", { length: 36 }).notNull().unique(),
    preferredArea: text("preferredArea"),
    budgetRange: varchar("budgetRange", { length: 8 }),
    defaultVibe: text("defaultVibe"),
    defaultVenueType: text("defaultVenueType"),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [index("circle_preferences_circleId_idx").on(table.circleId)]
);

export type CirclePreference = typeof circlePreferences.$inferSelect;
export type InsertCirclePreference = typeof circlePreferences.$inferInsert;

// Member availability per circle — simple day × time-slot grid
export const userAvailability = pgTable(
  "user_availability",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: integer("userId").notNull(),
    circleId: varchar("circleId", { length: 36 }).notNull(),
    availableDays: text("availableDays").notNull().default("[]"),
    preferredTimes: text("preferredTimes").notNull().default("[]"),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_availability_user_circle_unique").on(table.userId, table.circleId),
    index("user_availability_circleId_idx").on(table.circleId),
  ]
);

export type UserAvailability = typeof userAvailability.$inferSelect;
export type InsertUserAvailability = typeof userAvailability.$inferInsert;
