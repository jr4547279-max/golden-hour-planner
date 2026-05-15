import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Circles() {
  useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Circles</h1>
            <p className="text-muted-foreground">Groups you plan with</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="mb-1">No circles yet</CardTitle>
              <CardDescription>
                Create a circle and invite your friends to start finding Golden Windows together.
              </CardDescription>
            </div>
            <Button disabled className="gap-2">
              <Plus className="h-4 w-4" />
              Create Circle
              <span className="text-xs opacity-60">(coming soon)</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How circles work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Create a circle and give it a name (e.g. "Work Lunch Crew").</p>
            <p>2. Share the invite link with your friends.</p>
            <p>3. Everyone connects their calendar and syncs availability.</p>
            <p>4. Nexus finds the Golden Window — the time that works for everyone.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
