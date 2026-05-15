import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Users, MapPin } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Nexus</h1>
            <p className="text-xl text-muted-foreground">Golden Window Planner</p>
            <p className="text-sm text-muted-foreground mt-4">
              Find the perfect time and place for your group. No polls. No chaos. Just the Golden Window.
            </p>
          </div>

          <div className="space-y-4">
            <Button size="lg" className="w-full" onClick={() => setLocation("/login")}>
              Sign In
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-8">
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Smart Calendar Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Connect your Google Calendar and sync availability with your group
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Group Coordination
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create circles and invite friends to find overlapping free time
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Fair Venue Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Get restaurant and venue recommendations at the geographic midpoint
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || "User"}!</h1>
            <p className="text-muted-foreground">Find your Golden Windows</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Circles</CardTitle>
              <CardDescription>Groups you're part of</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/circles")}>
                View Circles
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar Settings</CardTitle>
              <CardDescription>Manage your availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/preferences")}>
                Go to Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Connect Your Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Go to Preferences and connect your Google Calendar to sync your availability
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. Create or Join a Circle</h3>
              <p className="text-sm text-muted-foreground">
                Create a new group or join an existing one with your friends
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. Find Golden Windows</h3>
              <p className="text-sm text-muted-foreground">
                Once everyone syncs their calendars, find the best time and place to meet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
