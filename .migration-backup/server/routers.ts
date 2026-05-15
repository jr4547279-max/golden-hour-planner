import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { calendarRouter } from "./routers/calendar";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";

const publicUser = <T extends { password?: string | null }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function ensureSignupRuntimeConfig() {
  const missing = [];
  if (!ENV.databaseUrl) missing.push("DATABASE_URL");
  if (!ENV.cookieSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: `Signup is not configured: missing ${missing.join(", ")}.`,
    });
  }
}

function toVisibleSignupError(error: unknown): TRPCError {
  if (error instanceof TRPCError) return error;

  const detail = error instanceof Error ? error.message : String(error);
  console.error("[Auth] Signup failed:", error);

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `Signup failed: ${detail}`,
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    signup: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email("Enter a valid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          name: z.string().trim().min(1, "Display name is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          ensureSignupRuntimeConfig();

          const email = normalizeEmail(input.email);
          const name = input.name.trim();
          const existingUser = await db.getUserByEmail(email);
          if (existingUser) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A user with this email already exists",
            });
          }

          const hashedPassword = await bcrypt.hash(input.password, 12);
          const user = await db.createUser({
            email,
            password: hashedPassword,
            name,
            loginMethod: "email",
            openId: `email_${crypto.randomUUID()}`,
          });

          const sessionToken = await sdk.createSessionToken(user.openId!, {
            name: user.name || "",
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

          return { success: true, user: publicUser(user) };
        } catch (error) {
          throw toVisibleSignupError(error);
        }
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email("Enter a valid email address"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        ensureSignupRuntimeConfig();
        const user = await db.getUserByEmail(normalizeEmail(input.email));
        if (!user || !user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        const sessionToken = await sdk.createSessionToken(user.openId!, {
          name: user.name || "",
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { success: true, user: publicUser(user) };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  calendar: calendarRouter,
});

export type AppRouter = typeof appRouter;
