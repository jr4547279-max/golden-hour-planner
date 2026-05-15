# Nexus — Golden Window Planner

Find the best time and place for your social circle to meet.

**Nexus** intelligently syncs Google Calendar availability across group members, calculates overlapping free windows, scores them by attendance and fairness, and suggests equitable venues using Google Places.

---

## Features

### 🗓️ Google Calendar Integration

- **OAuth 2.0 Login:** Secure authentication with Manus OAuth
- **Calendar Sync:** Free/Busy API integration (no private event details)
- **Timezone Support:** Automatic timezone conversion for global groups
- **Sync Status:** Real-time sync indicators and last-synced timestamps

### 🎯 Golden Window Engine

- **Overlap Detection:** Finds overlapping free windows across all members
- **Smart Scoring:** Ranks windows by:
  - **Attendance:** Highest member count wins
  - **Travel Fairness:** Minimizes distance burden for all
  - **Time Preference:** Prioritizes evenings and weekends
- **Real-Time Results:** Instant calculation from synced availability

### 🍽️ Venue Suggestions

- **Geographic Midpoint:** Calculates fair meeting point
- **Fairness Radius:** Suggests venues within equitable distance
- **Google Places Integration:** Restaurants, cafés, bars with ratings and prices
- **Smart Filtering:** Budget and vibe preferences

### 🎨 Beautiful UI

- **Cinematic Design:** Gold accents, smooth transitions, premium feel
- **Responsive Layout:** Works on mobile, tablet, desktop
- **Dark Theme:** Easy on the eyes, modern aesthetic
- **Instant Feedback:** Loading states, sync indicators, clear CTAs

---

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Google Cloud account (for OAuth and Places API)
- MySQL database or Supabase project

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jr4547279-max/golden-hour-planner.git
   cd nexus-golden-hour-planner-deploy
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Google OAuth and database credentials
   ```

4. **Initialize the database:**
   ```bash
   pnpm drizzle-kit migrate
   ```

5. **Start the dev server:**
   ```bash
   pnpm dev
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## Environment Variables

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup instructions.

**Minimal `.env.local` for local development:**

```
# Manus OAuth
VITE_APP_ID=your_manus_app_id
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OAUTH_SERVER_URL=https://api.manus.im

# Database
DATABASE_URL=mysql://user:password@localhost:3306/nexus

# Google
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_PLACES_KEY=your_google_places_key

# App
VITE_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, tRPC client |
| Backend | Express 4, tRPC 11, Drizzle ORM |
| Database | MySQL / Supabase |
| Auth | Manus OAuth 2.0 |
| APIs | Google Calendar, Google Places |

### Database Schema

**5 Core Tables:**

1. **users** — Manus OAuth identities
2. **calendar_connections** — Google Calendar OAuth tokens and sync status
3. **availability_windows** — Normalized free/busy blocks (timezone-aware)
4. **user_preferences** — Timezone, budget, location, vibe preferences
5. **groups** — Social circles
6. **group_members** — Circle membership with sync status

### API Endpoints

**tRPC Procedures:**

- `auth.me` — Get current user
- `auth.logout` — Clear session
- `calendar.connect` — Initiate Google OAuth flow
- `calendar.disconnect` — Revoke calendar access
- `calendar.sync` — Trigger availability sync
- `calendar.getStatus` — Check sync status
- `calendar.getPreferences` — Get user preferences
- `calendar.updatePreferences` — Update timezone, budget, location
- `calendar.getGoldenWindows` — Calculate overlapping windows
- `calendar.getVenues` — Get venue suggestions for a time window

---

## Usage

### 1. Connect Your Calendar

1. Go to **Preferences**
2. Click **Connect Google Calendar**
3. Authorize the app to access your calendar
4. Sync status will show "Connected"

### 2. Create or Join a Circle

1. Go to **Home**
2. Click **View Circles**
3. Create a new circle or join an existing one
4. Add members by email

### 3. Find Golden Windows

1. Go to **Home** and select a circle
2. Click **Find Golden Windows**
3. Wait for all members to sync their calendars
4. View ranked time windows and suggested venues
5. Click a time + venue to save to your calendar

---

## Development

### Project Structure

```
client/
  src/
    pages/          ← Page components (Home, Preferences, GoldenWindow)
    components/     ← Reusable UI components
    lib/trpc.ts     ← tRPC client setup
    App.tsx         ← Routes and layout
server/
  integrations/     ← Google Calendar, Places, availability sync
  routers/          ← tRPC procedures
  db.ts             ← Database queries
  db.calendar.ts    ← Calendar-specific queries
drizzle/
  schema.ts         ← Database tables
  migrations/       ← SQL migrations
```

### Adding Features

1. **Update database schema** in `drizzle/schema.ts`
2. **Generate migration:** `pnpm drizzle-kit generate`
3. **Apply migration:** `pnpm drizzle-kit migrate`
4. **Add query helper** in `server/db.ts` or `server/db.calendar.ts`
5. **Create tRPC procedure** in `server/routers/calendar.ts`
6. **Build UI** in `client/src/pages/` or `client/src/components/`
7. **Test:** `pnpm test`

### Testing

Run unit tests:
```bash
pnpm test
```

Test in browser:
```bash
pnpm dev
# Navigate to http://localhost:3000
```

---

## Deployment

### Manus (Recommended)

1. Push to GitHub
2. Connect in Manus dashboard
3. Set environment variables
4. Deploy

**URL:** `https://your-project.manus.space`

### Vercel

1. Import from GitHub
2. Add environment variables
3. Deploy

**URL:** `https://your-project.vercel.app`

### Replit

1. Create new project
2. Connect GitHub
3. Add secrets
4. Run `pnpm dev`

**URL:** `https://your-replit-url.replit.dev`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup.

---

## Google OAuth Redirect URIs

Add these to your Google Cloud Console OAuth 2.0 credentials:

- **Local:** `http://localhost:3000/api/oauth/calendar/callback`
- **Manus:** `https://your-project.manus.space/api/oauth/calendar/callback`
- **Vercel:** `https://your-project.vercel.app/api/oauth/calendar/callback`
- **Replit:** `https://your-replit-url.replit.dev/api/oauth/calendar/callback`

---

## Troubleshooting

### Login Issues

- Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
- Check browser cookies are enabled
- Clear browser cache and try again

### Calendar Connection Issues

- Verify Google OAuth credentials in Google Cloud Console
- Check redirect URI matches exactly (no trailing slash)
- Ensure Google Calendar API is enabled

### Golden Window Issues

- Verify all circle members have connected their calendars
- Check that at least 2 members have overlapping free time
- Ensure timezone settings are correct

### Venue Issues

- Verify `VITE_GOOGLE_PLACES_KEY` is correct
- Check Google Places API is enabled in Google Cloud Console
- Verify the API key has no IP restrictions

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more troubleshooting.

---

## Performance

- **Availability Sync:** ~2-5 seconds per user (depends on calendar size)
- **Golden Window Calculation:** <500ms for up to 10 members
- **Venue Search:** ~1 second (cached for 1 hour)
- **Database Queries:** Indexed on user_id, group_id, timestamps

---

## Security

- **OAuth Tokens:** Encrypted in database, auto-refreshed
- **Session Cookies:** httpOnly, secure, SameSite=None
- **API Keys:** Server-side only (Places key is frontend-safe)
- **Database:** SSL/TLS connection required
- **No Private Data:** Only free/busy blocks are synced, not event details

---

## Roadmap

- [ ] Real-time sync notifications
- [ ] Recurring group meetings
- [ ] Calendar integration (save to Google Calendar)
- [ ] Mobile app (React Native)
- [ ] AI-powered vibe suggestions
- [ ] Payment processing (Stripe)
- [ ] Team/organization management

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## License

MIT

---

## Support

For issues or questions:

- **Manus Users:** Submit at [help.manus.im](https://help.manus.im)
- **GitHub:** Open an issue on [GitHub](https://github.com/jr4547279-max/golden-hour-planner)
- **Email:** support@nexus.app

---

## Credits

Built with ❤️ using React, Express, Drizzle, and Google APIs.

**Team:** Nexus Development

**Last Updated:** May 2026
