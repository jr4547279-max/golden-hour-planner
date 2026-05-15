# Nexus Golden Window Planner — Deployment Guide

## Quick Start

This guide covers environment setup, Google OAuth configuration, database initialization, and deployment to Manus, Vercel, or Replit.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required for All Deployments

```
# Manus OAuth (auto-injected in Manus, required for other platforms)
VITE_APP_ID=your_manus_app_id
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OAUTH_SERVER_URL=https://api.manus.im

# Database
DATABASE_URL=mysql://user:password@host:port/database

# Session & Auth
JWT_SECRET=your_jwt_secret_key

# App URL (for OAuth redirects)
VITE_APP_URL=https://your-domain.com
```

### Google Calendar & Places Integration

```
# Google OAuth 2.0 (for calendar sync)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Places API (for venue suggestions)
VITE_GOOGLE_PLACES_KEY=your_google_places_api_key
```

### Optional

```
# Owner notifications (Manus-specific)
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name

# Analytics (if using Manus analytics)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

---

## Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "Nexus Golden Window Planner"
3. Enable the following APIs:
   - **Google Calendar API** (for availability sync)
   - **Google Places API** (for venue suggestions)
   - **Google Maps API** (optional, for distance calculations)

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web Application**
4. Add authorized redirect URIs:
   - For Manus: `https://your-domain.manus.space/api/oauth/calendar/callback`
   - For Vercel: `https://your-domain.vercel.app/api/oauth/calendar/callback`
   - For Replit: `https://your-replit-url.replit.dev/api/oauth/calendar/callback`
   - For local development: `http://localhost:3000/api/oauth/calendar/callback`
5. Download the credentials JSON and note:
   - **Client ID** → `VITE_GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

### 3. Create API Keys

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Restrict the key to:
   - **Google Places API**
   - **Google Maps API** (optional)
4. Copy the key → `VITE_GOOGLE_PLACES_KEY`

---

## Database Setup

### Supabase (Recommended)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the migrations:
   ```sql
   -- Copy all SQL from drizzle/0001_cheerful_pretty_boy.sql
   ```
3. Copy your connection string → `DATABASE_URL`

### Alternative: MySQL/TiDB

1. Create a MySQL database
2. Run the Drizzle migrations:
   ```bash
   pnpm drizzle-kit migrate
   ```

---

## Deployment Options

### Option 1: Manus (Recommended)

Manus handles OAuth, database, and hosting automatically.

1. Push code to GitHub
2. Connect repository in Manus dashboard
3. Set environment variables in Manus settings
4. Deploy via Manus UI

**Preview URL:** `https://your-project.manus.space`

### Option 2: Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy

**Redirect URI:** `https://your-project.vercel.app/api/oauth/calendar/callback`

### Option 3: Replit

1. Create a new Replit project
2. Connect GitHub repository
3. Add environment variables in Replit Secrets
4. Run `pnpm dev`

**Redirect URI:** `https://your-replit-url.replit.dev/api/oauth/calendar/callback`

---

## Testing the Deployment

### 1. Test Login Flow

- Navigate to the preview URL
- Click "Sign In" (Manus OAuth)
- Verify you're logged in

### 2. Test Google Calendar Connection

- Go to Preferences
- Click "Connect Google Calendar"
- Authorize the app to access your calendar
- Verify connection status shows "Connected"

### 3. Test Golden Window Generation

- Go to Home
- Click "View Circles" (or create a test circle)
- Add circle members
- Click "Find Golden Windows"
- Verify time windows and venues are displayed

### 4. Test Logout

- Click "Sign Out"
- Verify you're redirected to login

---

## Troubleshooting

### "Invalid redirect URI" Error

- Verify the redirect URI in Google Cloud Console matches your deployment URL exactly
- Check for trailing slashes and protocol (http vs https)

### "Calendar sync failed" Error

- Verify `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that Google Calendar API is enabled in Google Cloud Console
- Verify the user has authorized calendar access

### "No venues found" Error

- Verify `VITE_GOOGLE_PLACES_KEY` is correct
- Check that Google Places API is enabled in Google Cloud Console
- Verify the API key is not restricted to a specific IP

### Database Connection Error

- Verify `DATABASE_URL` is correct and accessible
- Check that the database has been initialized with migrations
- For Supabase, verify SSL is enabled in connection string

---

## Architecture Overview

**Frontend:** React 19 + Tailwind CSS 4 + tRPC client

**Backend:** Express 4 + tRPC 11 + Drizzle ORM

**Database:** MySQL/Supabase with 5 core tables:
- `users` — Manus OAuth identities
- `calendar_connections` — Google Calendar OAuth tokens
- `availability_windows` — Synced free/busy blocks
- `user_preferences` — Timezone, budget, location
- `groups` — Social circles
- `group_members` — Circle membership

**APIs:**
- Google Calendar Free/Busy API (availability sync)
- Google Places API (venue suggestions)
- Manus OAuth (user authentication)

---

## Performance Notes

- Availability sync is on-demand (triggered by user)
- Golden Window calculation runs in-memory (no caching)
- Venue suggestions are cached for 1 hour
- Database queries use indexes on user_id, group_id, and timestamps

---

## Security

- All Google tokens are stored encrypted in the database
- OAuth tokens are refreshed automatically before expiry
- API keys are server-side only (Places key is frontend-safe)
- Database connections use SSL/TLS
- Session cookies are httpOnly and secure

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in your deployment platform
3. Verify all environment variables are set correctly
4. Contact support at help.manus.im (for Manus deployments)
