# Google Cloud Setup for Nexus Golden Window Planner

This guide walks through creating a Google Cloud project, enabling APIs, and generating credentials for Google Calendar and Places integration.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `Nexus Golden Window Planner`
5. Click **CREATE**
6. Wait for the project to be created (2-3 minutes)

---

## Step 2: Enable Required APIs

### Enable Google Calendar API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for `Google Calendar API`
3. Click the result
4. Click **ENABLE**
5. Wait for enablement to complete

### Enable Google Places API

1. Go back to **APIs & Services** → **Library**
2. Search for `Places API`
3. Click the result
4. Click **ENABLE**
5. Wait for enablement to complete

### (Optional) Enable Google Maps API

1. Go back to **APIs & Services** → **Library**
2. Search for `Maps API`
3. Click the result
4. Click **ENABLE**

---

## Step 3: Create OAuth 2.0 Credentials

### Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Click **CREATE**
4. Fill in the form:
   - **App name:** Nexus Golden Window Planner
   - **User support email:** your-email@example.com
   - **Developer contact:** your-email@example.com
5. Click **SAVE AND CONTINUE**
6. Skip scopes (click **SAVE AND CONTINUE**)
7. Skip test users (click **SAVE AND CONTINUE**)
8. Review and click **BACK TO DASHBOARD**

### Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Web application**
4. Enter name: `Nexus Web Client`
5. Under **Authorized redirect URIs**, add all deployment URLs:
   - `http://localhost:3000/api/oauth/calendar/callback` (local dev)
   - `https://your-project.manus.space/api/oauth/calendar/callback` (Manus)
   - `https://your-project.vercel.app/api/oauth/calendar/callback` (Vercel)
   - `https://your-replit-url.replit.dev/api/oauth/calendar/callback` (Replit)
6. Click **CREATE**
7. A dialog will show your credentials:
   - **Client ID** → Copy to `VITE_GOOGLE_CLIENT_ID`
   - **Client Secret** → Copy to `GOOGLE_CLIENT_SECRET`
8. Click **DOWNLOAD JSON** to save for backup
9. Click **CLOSE**

---

## Step 4: Create API Keys

### Create API Key for Google Places

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. A dialog will show your new API key
4. Copy the key → `VITE_GOOGLE_PLACES_KEY`
5. Click **CLOSE**

### Restrict API Key (Recommended)

1. Go to **APIs & Services** → **Credentials**
2. Click on the API key you just created
3. Under **API restrictions**, select:
   - **Places API**
   - **Maps API** (optional)
4. Click **SAVE**

### (Optional) Restrict by IP

For production deployments, restrict the API key to your server IP:

1. In the API key settings, under **Application restrictions**
2. Choose **IP addresses**
3. Add your server's IP address
4. Click **SAVE**

---

## Step 5: Set Environment Variables

Create a `.env.local` file in your project root:

```
# Google OAuth 2.0
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Google Places API
VITE_GOOGLE_PLACES_KEY=your_api_key_here

# Other required variables
VITE_APP_URL=http://localhost:3000  # Change for production
```

---

## Step 6: Test the Setup

### Test OAuth Flow

1. Start the dev server: `pnpm dev`
2. Go to http://localhost:3000
3. Click **Sign In** (Manus OAuth)
4. Go to **Preferences**
5. Click **Connect Google Calendar**
6. You should be redirected to Google's authorization screen
7. Click **Allow**
8. You should be redirected back with "Connected" status

### Test Places API

1. Go to **Golden Windows** page
2. Scroll to venue suggestions
3. Venues should load from Google Places
4. If blank, check browser console for errors

---

## Troubleshooting

### "Invalid redirect URI" Error

**Problem:** Google rejects your redirect URI

**Solution:**
1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 client ID
3. Verify the redirect URI matches exactly:
   - No trailing slashes
   - Correct protocol (http vs https)
   - Correct domain and port
4. Save changes

### "Access Denied" Error

**Problem:** User denies calendar access

**Solution:**
1. This is normal—user must authorize
2. You can try again by clicking "Connect Google Calendar" again
3. Check that your OAuth consent screen is configured

### "API key not valid" Error

**Problem:** Places API key is invalid or restricted

**Solution:**
1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Verify **Places API** is in the list of restricted APIs
4. If restricted by IP, verify your current IP is allowed
5. Wait 5-10 minutes for changes to propagate

### "Quota exceeded" Error

**Problem:** You've hit the free tier limit

**Solution:**
1. Go to **APIs & Services** → **Quotas**
2. Click on **Places API**
3. Check current usage
4. If needed, upgrade to a paid plan or request quota increase

---

## Quota Limits (Free Tier)

| API | Limit |
|-----|-------|
| Google Calendar | 1,000,000 requests/day |
| Google Places | 25,000 requests/day |
| Google Maps | 25,000 requests/day |

For production use, consider upgrading to a paid plan.

---

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use environment variables** for all credentials
3. **Restrict API keys** by API and IP
4. **Rotate secrets** regularly
5. **Monitor usage** in Cloud Console quotas
6. **Use OAuth 2.0** (not API keys) for user authentication
7. **Enable 2FA** on your Google Cloud account

---

## Next Steps

1. Copy your credentials to `.env.local`
2. Start the dev server: `pnpm dev`
3. Test the Google Calendar connection flow
4. Deploy to your chosen platform (Manus, Vercel, Replit)
5. Update redirect URIs for production domain

---

## Support

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
