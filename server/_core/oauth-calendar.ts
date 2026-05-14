import { Request, Response } from "express";
import { exchangeCodeForTokens, getUserInfo } from "../integrations/google-calendar";
import { upsertCalendarConnection, getUserPreferences, upsertUserPreferences } from "../db.calendar";
import { ENV } from "./env";

/**
 * Handle Google Calendar OAuth callback
 */
export async function handleCalendarOAuthCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // Decode state to get userId
    let userId: number;
    try {
      const decodedState = Buffer.from(state as string, "base64").toString("utf-8");
      const stateData = JSON.parse(decodedState);
      userId = stateData.userId;
    } catch (error) {
      return res.status(400).json({ error: "Invalid state parameter" });
    }

    // Exchange code for tokens
    const redirectUri = `${ENV.appUrl}/api/oauth/calendar/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user info
    const userInfo = await getUserInfo(tokens.accessToken);

    // Store connection
    await upsertCalendarConnection(userId, "google", {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
      email: userInfo.email,
      lastSynced: new Date(),
    });

    // Create default preferences if they don't exist
    const prefs = await getUserPreferences(userId);
    if (!prefs) {
      await upsertUserPreferences(userId, {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }

    // Redirect back to preferences page
    return res.redirect(`${ENV.appUrl}/preferences?connected=true`);
  } catch (error) {
    console.error("Calendar OAuth callback error:", error);
    return res.status(500).json({ error: "Failed to connect calendar" });
  }
}
