import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { jwtVerify } from "jose";
import * as db from "./db";
import type { User } from "@workspace/db";
import { supabase } from "./supabase";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0]?.toLowerCase() === "bearer") {
    return parts[1] ?? null;
  }
  return null;
}

// Primary: ask Supabase to verify the token — always correct regardless of algorithm.
async function verifyViaSupabase(token: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      console.error("[auth] supabase.auth.getUser failed:", error?.message ?? "no user");
      return null;
    }
    console.log("[auth] supabase verification OK, uid:", data.user.id);
    return data.user.id;
  } catch (err) {
    console.error("[auth] supabase.auth.getUser threw:", err);
    return null;
  }
}

// Fallback: verify with the JWT secret (HS256) when the Supabase client is unavailable.
async function verifyViaJwtSecret(token: string): Promise<string | null> {
  if (!ENV.supabaseJwtSecret) return null;
  try {
    const secret = new TextEncoder().encode(ENV.supabaseJwtSecret);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const sub = typeof payload.sub === "string" && payload.sub ? payload.sub : null;
    if (sub) console.log("[auth] JWT-secret verification OK, uid:", sub);
    return sub;
  } catch (err) {
    console.error("[auth] JWT-secret verification failed:", err);
    return null;
  }
}

async function resolveSupabaseUid(token: string): Promise<string | null> {
  // Try the Supabase API first; fall back to local JWT verification.
  const uid = await verifyViaSupabase(token);
  if (uid) return uid;
  return verifyViaJwtSecret(token);
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;
    console.log("[auth] Authorization header present:", !!authHeader);

    const token = extractBearerToken(authHeader);
    if (!token) {
      console.log("[auth] No bearer token found in request");
    } else {
      const supabaseUserId = await resolveSupabaseUid(token);
      if (supabaseUserId) {
        user = await db.getUserByOpenId(supabaseUserId);
        console.log("[auth] DB user by openId:", user ? `found (id=${user.id})` : "not found");

        if (!user) {
          const email = opts.req.headers["x-user-email"] as string | undefined;
          const name = opts.req.headers["x-user-name"] as string | undefined;
          console.log("[auth] Auto-creating/linking user email:", email);

          if (email) {
            user = await db.getUserByEmail(email);
          }

          if (!user) {
            user = await db.createUser({
              openId: supabaseUserId,
              email: email ?? null,
              name: name ?? email?.split("@")[0] ?? null,
              loginMethod: "supabase",
              role: "user",
            });
            console.log("[auth] Created new DB user id:", user.id);
          } else {
            // Link existing email-based user to their Supabase id.
            await db.upsertUser({ openId: supabaseUserId, email: user.email ?? undefined });
            user = await db.getUserByOpenId(supabaseUserId);
            console.log("[auth] Linked existing user to supabase uid");
          }
        }
      } else {
        console.log("[auth] Token verification returned no uid — unauthenticated");
      }
    }
  } catch (err) {
    console.error("[auth] createContext error:", err);
    user = null;
  }

  console.log("[auth] Final context user:", user ? `id=${user.id}` : "null (unauthenticated)");

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
