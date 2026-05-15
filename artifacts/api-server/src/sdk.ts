import { COOKIE_NAME } from "./constants";
import { ONE_YEAR_MS } from "./cookies";
import { ENV } from "./env";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "./db";

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
  email?: string;
};

export type AuthenticatedUser = Awaited<ReturnType<typeof db.getUserByOpenId>> & {};

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) return new Map<string, string>();
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) throw new Error("JWT_SECRET is not set");
    return new TextEncoder().encode(secret);
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      appId: ENV.appId,
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string; email?: string } | null> {
    if (!cookieValue) return null;

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name, email } = payload as Record<string, unknown>;

      if (typeof openId !== "string" || !openId) {
        return null;
      }

      return { openId, appId, name: (name as string) ?? "", email: email as string | undefined };
    } catch {
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<NonNullable<Awaited<ReturnType<typeof db.getUserByOpenId>>>> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw new Error("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export const sdk = new SDKServer();
