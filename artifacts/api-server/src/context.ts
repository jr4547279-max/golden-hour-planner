import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { jwtVerify, createRemoteJWKSet } from "jose";
import * as db from "./db";
import { ENV } from "./env";
import type { User } from "@workspace/db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function verifySupabaseToken(token: string): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(ENV.supabaseJwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    if (typeof sub !== "string" || !sub) return null;
    return sub;
  } catch {
    return null;
  }
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0]?.toLowerCase() === "bearer") {
    return parts[1] ?? null;
  }
  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = extractBearerToken(opts.req.headers.authorization);
    if (token) {
      const supabaseUserId = await verifySupabaseToken(token);
      if (supabaseUserId) {
        user = await db.getUserByOpenId(supabaseUserId);
        if (!user) {
          const email = opts.req.headers["x-user-email"] as string | undefined;
          const name = opts.req.headers["x-user-name"] as string | undefined;
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
          } else if (!user.openId) {
            await db.upsertUser({ openId: supabaseUserId, email: user.email ?? undefined });
            user = await db.getUserByOpenId(supabaseUserId);
          }
        }
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
