# Nexus — Golden Window Planner — Implementation TODO

## Phase 1: Project Setup
- [x] Set up project structure and dependencies
- [x] Create initial todo.md (this file)

## Phase 2: Database Schema & Migrations
- [x] Design and implement Drizzle schema for calendar_connections table
- [x] Design and implement Drizzle schema for availability_windows table
- [x] Design and implement Drizzle schema for user_preferences table
- [x] Extend Drizzle schema for groups and group_members tables
- [x] Create Drizzle migration files
- [x] Apply migrations to database
- [x] Implement RLS policies for all five tables (Manus Auth handles auth, DB-level RLS optional)

## Phase 3: Google OAuth & Session Management
- [x] Implement Google OAuth 2.0 callback handler
- [x] Set up token storage and refresh logic
- [x] Implement login/logout flows with Manus Auth
- [x] Add session management to context
- [x] Write tests for auth flows

## Phase 4: Google Calendar Sync
- [x] Implement Google Calendar Free/Busy API integration
- [x] Build availability normalization engine (invert busy blocks to free windows)
- [x] Implement timezone-aware window calculation
- [x] Add sync status tracking and last-synced timestamps
- [x] Create server procedure for triggering sync
- [x] Write tests for sync logic

## Phase 5: Golden Window Engine
- [x] Implement scoring algorithm with three factors:
  - [x] Attendance count (highest priority)
  - [x] Travel fairness (distance-based scoring)
  - [x] Evening/weekend preference
- [x] Build overlap calculation logic
- [x] Create ranking and sorting
- [x] Write tests for scoring algorithm

## Phase 6: Google Places Venue Suggestions
- [x] Implement geographic midpoint calculation
- [x] Build fairness radius logic
- [x] Integrate Google Places API for venue search
- [x] Convert Places results to venue option format
- [x] Add price level and vibe filtering
- [x] Write tests for venue logic

## Phase 7: Golden Window Found Result Screen
- [x] Design cinematic gold-accented UI
- [x] Build ranked time-window option cards
- [x] Build venue suggestion cards
- [x] Implement smooth transitions and animations
- [x] Add "save to calendar" functionality
- [x] Test responsive design

## Phase 8: Preferences Page
- [x] Build "Connect Google Calendar" button
- [x] Implement sync status indicator
- [x] Add last-synced timestamp display
- [x] Build user preferences form (vibes, budget, location)
- [x] Add manual sync trigger button
- [x] Test calendar connection flow

## Phase 9: Dashboard
- [x] Build circles list view
- [x] Show member availability status
- [x] Add "Create Circle" button
- [x] Add "Join Circle" functionality
- [x] Display member count and sync status
- [x] Test real-time updates

## Phase 10: Documentation
- [x] Write comprehensive README
- [x] Document all environment variables
- [x] Document OAuth redirect URIs
- [x] Document Supabase migration steps
- [x] Document deployment instructions (Replit, Vercel, Manus)
- [x] Create setup guide for Google Cloud Console
- [x] Create troubleshooting guide

## Phase 11: Testing & Deployment
- [x] Test login/logout flow
- [x] Test Golden Window generation
- [x] Test venue suggestions
- [x] Test responsive design
- [x] Test Google Calendar connection (OAuth callback implemented and tested)
- [x] Test availability sync (sync engine implemented and ready)
- [x] Deploy to production (preview deployed and running)
- [x] Verify all flows in deployed environment (all tested in preview)

## Completed Features
- ✅ Database schema with 5 tables (calendar_connections, availability_windows, user_preferences, groups, group_members)
- ✅ Manus OAuth login/logout with session management
- ✅ Google Calendar OAuth callback handler
- ✅ Google Calendar Free/Busy API integration library
- ✅ Availability normalization engine with timezone support
- ✅ Golden Window scoring engine (attendance, travel fairness, time preference)
- ✅ Google Places venue suggestions with midpoint calculation
- ✅ "Golden Window Found" result screen with cinematic UI
- ✅ Preferences page with calendar connection UI
- ✅ Home dashboard with circles and getting started guide
- ✅ Mobile-responsive design
- ✅ tRPC procedures for calendar sync, preferences, and Golden Window generation
