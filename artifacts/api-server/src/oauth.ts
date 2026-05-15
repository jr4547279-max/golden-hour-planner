import type { Express, Request, Response } from "express";
import { exchangeCodeForTokens, getUserInfo } from "./integrations/google-calendar";
import * as db from "./db";
import { ENV } from "./env";

function getAppOrigin(req: Request): string {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  const proto = req.protocol;
  return `${proto}://${host}`;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/calendar/callback", async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing authorization code" });
      return;
    }

    let userId: number;
    try {
      const decoded = Buffer.from(state as string, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded) as { userId: number };
      userId = parsed.userId;
    } catch {
      res.status(400).json({ error: "Invalid state parameter" });
      return;
    }

    try {
      const origin = getAppOrigin(req);
      const redirectUri = `${origin}/api/oauth/calendar/callback`;
      const tokens = await exchangeCodeForTokens(code, redirectUri);
      const userInfo = await getUserInfo(tokens.accessToken);

      await db.upsertCalendarConnection(userId, "google", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? null,
        expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : null,
        email: userInfo.email,
        lastSynced: new Date(),
      });

      const prefs = await db.getUserPreferences(userId);
      if (!prefs) {
        await db.upsertUserPreferences(userId, {
          timezone: "UTC",
        });
      }

      res.redirect(`${ENV.appUrl}/preferences?connected=true`);
    } catch (err) {
      console.error("[OAuth] Calendar callback failed:", err);
      res.status(500).json({ error: "Failed to connect calendar" });
    }
  });
}
