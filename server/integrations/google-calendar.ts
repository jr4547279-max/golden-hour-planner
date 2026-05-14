import { ENV } from "../_core/env";

/**
 * Google Calendar Integration
 * Handles OAuth flow, token management, and Free/Busy API calls
 */

export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
}

export interface FreeBusyBlock {
  start: string; // ISO 8601
  end: string; // ISO 8601
}

export interface CalendarFreeBusy {
  calendarId: string;
  busy: FreeBusyBlock[];
  errors?: Array<{ reason: string; message: string }>;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleOAuthTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
  };
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
  };
}

/**
 * Get free/busy information for a calendar
 * Requires: https://www.googleapis.com/auth/calendar.readonly
 */
export async function getCalendarFreeBusy(
  accessToken: string,
  calendarId: string = "primary",
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
): Promise<CalendarFreeBusy> {
  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/freebusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Free/busy fetch failed: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const calendarData = data.calendars[calendarId];

  return {
    calendarId,
    busy: calendarData.busy || [],
    errors: calendarData.errors,
  };
}

/**
 * Revoke an access token (disconnect calendar)
 */
export async function revokeAccessToken(accessToken: string): Promise<void> {
  const response = await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: accessToken,
    }),
  });

  if (!response.ok) {
    console.error("Failed to revoke token:", await response.text());
  }
}

/**
 * Build Google OAuth authorization URL
 */
export function buildAuthorizationUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Get user info from Google (email, name)
 */
export async function getUserInfo(accessToken: string): Promise<{ email: string; name?: string }> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await response.json();
  return {
    email: data.email,
    name: data.name,
  };
}
