export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// getLoginUrl is kept for backwards compatibility but email/password auth
// is handled directly via the tRPC login mutation — no OAuth redirect needed.
export const getLoginUrl = () => "/login";
