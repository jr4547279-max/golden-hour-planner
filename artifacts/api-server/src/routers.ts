import { COOKIE_NAME } from "./constants";
import { getSessionCookieOptions, clearSessionCookieOptions } from "./cookies";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { sdk } from "./sdk";
import { ENV } from "./env";

const publicUser = <T extends { password?: string | null }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function ensureAuthConfig() {
  const missing: string[] = [];
  if (!ENV.databaseUrl) missing.push("DATABASE_URL");
  if (!ENV.cookieSecret) missing.push("JWT_SECRET");
  if (missing.length > 0) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: `Auth is not configured: missing ${missing.join(", ")}.`,
    });
  }
}

const circleTypeSchema = z.enum(["friends", "family", "work", "date_night", "other"]);

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    signup: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email("Enter a valid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          name: z.string().trim().min(1, "Display name is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        ensureAuthConfig();

        const email = normalizeEmail(input.email);
        const existing = await db.getUserByEmail(email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "A user with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(input.password, 12);
        const user = await db.createUser({
          email,
          password: hashedPassword,
          name: input.name.trim(),
          loginMethod: "email",
          openId: `email_${crypto.randomUUID()}`,
        });

        const sessionToken = await sdk.createSessionToken(user.openId!, { name: user.name || "" });
        ctx.res.cookie(COOKIE_NAME, sessionToken, getSessionCookieOptions(ctx.req));

        return { success: true, user: publicUser(user) };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email("Enter a valid email address"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        ensureAuthConfig();

        const user = await db.getUserByEmail(normalizeEmail(input.email));
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(input.password, user.password);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const sessionToken = await sdk.createSessionToken(user.openId!, { name: user.name || "" });
        ctx.res.cookie(COOKIE_NAME, sessionToken, getSessionCookieOptions(ctx.req));

        return { success: true, user: publicUser(user) };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, clearSessionCookieOptions(ctx.req));
      return { success: true } as const;
    }),
  }),

  circles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const circles = await db.getCirclesByUser(ctx.user.id);
      return circles;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(1, "Circle name is required").max(100),
          description: z.string().trim().max(500).optional(),
          type: circleTypeSchema,
        })
      )
      .mutation(async ({ input, ctx }) => {
        const circle = await db.createCircle(ctx.user.id, {
          name: input.name,
          description: input.description ?? null,
          type: input.type,
        });
        return { success: true, circle };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const circle = await db.getCircleById(input.id);
        if (!circle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Circle not found" });
        }

        const isMember = await db.isCircleMember(input.id, ctx.user.id);
        if (!isMember) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this circle" });
        }

        const [memberCount, pendingInvites, creator] = await Promise.all([
          db.getCircleMemberCount(input.id),
          db.getCirclePendingInviteCount(input.id),
          db.getCircleCreator(input.id),
        ]);

        return {
          ...circle,
          memberCount,
          pendingInvites,
          creator: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
        };
      }),
  }),

  calendar: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const connection = await db.getCalendarConnection(ctx.user.id, "google");
      return {
        connected: !!connection,
        email: connection?.email || null,
        lastSynced: connection?.lastSynced || null,
        provider: "google",
      };
    }),

    getAuthUrl: protectedProcedure.query(({ ctx }) => {
      const clientId = ENV.googleClientId;
      if (!clientId) {
        return { authUrl: null, configured: false } as const;
      }

      const host = ctx.req.headers.host ?? "";
      const origin = (ctx.req.headers.origin as string | undefined) ?? `https://${host}`;
      const redirectUri = `${origin}/api/oauth/calendar/callback`;

      const state = Buffer.from(JSON.stringify({ userId: ctx.user.id })).toString("base64");
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ].join(" "));
      url.searchParams.set("state", state);
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");

      return { authUrl: url.toString(), configured: true } as const;
    }),

    syncAvailability: protectedProcedure
      .input(z.object({ groupId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const connection = await db.getCalendarConnection(ctx.user.id, "google");
        if (!connection) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Please connect your Google Calendar first.",
          });
        }
        await db.upsertCalendarConnection(ctx.user.id, "google", {
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          expiresAt: connection.expiresAt,
          email: connection.email,
          lastSynced: new Date(),
        });
        return { success: true, groupId: input.groupId } as const;
      }),

    disconnect: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteCalendarConnection(ctx.user.id, "google");
      return { success: true };
    }),

    getAvailability: protectedProcedure
      .input(z.object({ groupId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getUserAvailabilityWindows(ctx.user.id, input.groupId);
      }),

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
        await db.upsertUserPreferences(ctx.user.id, {
          maxSpend: input.maxSpend,
          maxTravelDistance: input.maxTravelDistance,
          vibes: input.vibes ? JSON.stringify(input.vibes) : undefined,
          cuisines: input.cuisines ? JSON.stringify(input.cuisines) : undefined,
          dietaryRestrictions: input.dietaryRestrictions
            ? JSON.stringify(input.dietaryRestrictions)
            : undefined,
          preferredDays: input.preferredDays ? JSON.stringify(input.preferredDays) : undefined,
          homeLat: input.homeLat,
          homeLng: input.homeLng,
          timezone: input.timezone,
        });
        return { success: true };
      }),

    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPreferences(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
