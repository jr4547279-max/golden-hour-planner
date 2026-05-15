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
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

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
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { success: true, user: publicUser(user) };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = clearSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true } as const;
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
