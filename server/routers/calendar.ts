import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getCalendarConnection,
  upsertCalendarConnection,
  deleteCalendarConnection,
  clearAvailabilityWindows,
  insertAvailabilityWindows,
  getUserAvailabilityWindows,
  getUserPreferences,
  upsertUserPreferences,
} from "../db.calendar";
import {
  exchangeCodeForTokens,
  refreshAccessToken,
  getCalendarFreeBusy,
  revokeAccessToken,
  getUserInfo,
  buildAuthorizationUrl,
} from "../integrations/google-calendar";
import {
  normalizeBusyToFreeWindows,
  convertWindowsToDatabaseRecords,
  findOverlappingWindows,
  scoreTimeWindow,
} from "../integrations/availability-sync";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";

export const calendarRouter = router({
  /**
   * Get authorization URL for Google Calendar OAuth
   */
  getAuthUrl: protectedProcedure.query(({ ctx }) => {
    const redirectUri = `${ENV.appUrl}/api/oauth/calendar/callback`;
    const state = Buffer.from(JSON.stringify({ userId: ctx.user.id })).toString("base64");
    const authUrl = buildAuthorizationUrl(redirectUri, state);
    return { authUrl };
  }),

  /**
   * Get current calendar connection status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const connection = await getCalendarConnection(ctx.user.id, "google");
    return {
      connected: !!connection,
      email: connection?.email || null,
      lastSynced: connection?.lastSynced || null,
      provider: "google",
    };
  }),

  /**
   * Exchange OAuth code for tokens and store connection
   */
  handleCallback: protectedProcedure
    .input(z.object({ code: z.string(), redirectUri: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(input.code, input.redirectUri);

        // Get user info
        const userInfo = await getUserInfo(tokens.accessToken);

        // Store connection
        await upsertCalendarConnection(ctx.user.id, "google", {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
          email: userInfo.email,
          lastSynced: new Date(),
        });

        // Create default preferences if they don't exist
        const prefs = await getUserPreferences(ctx.user.id);
        if (!prefs) {
          await upsertUserPreferences(ctx.user.id, {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }

        return { success: true, email: userInfo.email };
      } catch (error) {
        console.error("Calendar callback error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect calendar",
        });
      }
    }),

  /**
   * Disconnect Google Calendar
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const connection = await getCalendarConnection(ctx.user.id, "google");
    if (!connection) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Calendar not connected" });
    }

    try {
      await revokeAccessToken(connection.accessToken);
    } catch (error) {
      console.error("Failed to revoke token:", error);
    }

    await deleteCalendarConnection(ctx.user.id, "google");
    return { success: true };
  }),

  /**
   * Sync calendar availability for a group
   */
  syncAvailability: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const connection = await getCalendarConnection(ctx.user.id, "google");
      if (!connection) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Calendar not connected" });
      }

      try {
        // Refresh token if needed
        let accessToken = connection.accessToken;
        if (connection.expiresAt && new Date() > connection.expiresAt) {
          if (!connection.refreshToken) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Token expired and cannot refresh" });
          }
          const refreshed = await refreshAccessToken(connection.refreshToken);
          accessToken = refreshed.accessToken;
          await upsertCalendarConnection(ctx.user.id, "google", {
            accessToken: refreshed.accessToken,
            refreshToken: connection.refreshToken,
            expiresAt: refreshed.expiresAt ? new Date(refreshed.expiresAt) : undefined,
            email: connection.email,
            lastSynced: connection.lastSynced,
          });
        }

        // Get user preferences for timezone
        const prefs = await getUserPreferences(ctx.user.id);
        const timezone = prefs?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Fetch free/busy data
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const freeBusy = await getCalendarFreeBusy(accessToken, "primary", now, twoWeeksFromNow);

        // Normalize busy blocks to free windows
        const freeWindows = normalizeBusyToFreeWindows(freeBusy.busy, now, twoWeeksFromNow, timezone);

        // Convert to database records
        const records = convertWindowsToDatabaseRecords(freeWindows, ctx.user.id, input.groupId, timezone);

        // Clear old availability and insert new
        await clearAvailabilityWindows(ctx.user.id, input.groupId);
        await insertAvailabilityWindows(records);

        // Update last synced time
        await upsertCalendarConnection(ctx.user.id, "google", {
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          expiresAt: connection.expiresAt,
          email: connection.email,
          lastSynced: new Date(),
        });

        return {
          success: true,
          windowsCount: records.length,
          lastSynced: new Date(),
        };
      } catch (error) {
        console.error("Sync availability error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync availability",
        });
      }
    }),

  /**
   * Get user's availability windows for a group
   */
  getAvailability: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const windows = await getUserAvailabilityWindows(ctx.user.id, input.groupId);
      return windows;
    }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        maxSpend: z.number().optional(),
        maxTravelDistance: z.number().optional(),
        vibes: z.array(z.string()).optional(),
        cuisines: z.array(z.string()).optional(),
        dietaryRestrictions: z.array(z.string()).optional(),
        preferredDays: z.array(z.string()).optional(),
        homeLat: z.string().optional(),
        homeLng: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = {
        maxSpend: input.maxSpend,
        maxTravelDistance: input.maxTravelDistance,
        vibes: input.vibes ? JSON.stringify(input.vibes) : undefined,
        cuisines: input.cuisines ? JSON.stringify(input.cuisines) : undefined,
        dietaryRestrictions: input.dietaryRestrictions ? JSON.stringify(input.dietaryRestrictions) : undefined,
        preferredDays: input.preferredDays ? JSON.stringify(input.preferredDays) : undefined,
        homeLat: input.homeLat,
        homeLng: input.homeLng,
        timezone: input.timezone,
      };
      await upsertUserPreferences(ctx.user.id, data);
      return { success: true };
    }),

  /**
   * Get user preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPreferences(ctx.user.id);
  }),
});
