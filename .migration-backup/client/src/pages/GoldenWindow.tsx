import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Users, Clock, Star } from "lucide-react";
import { useState } from "react";

interface ScoredWindow {
  startTime: string;
  endTime: string;
  attendanceCount: number;
  attendanceScore: number;
  travelFairnessScore: number;
  timePreferenceScore: number;
  overallScore: number;
  attendees: Array<{ id: number; name: string; email: string }>;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
}

export default function GoldenWindow() {
  const { user } = useAuth();
  const [selectedWindow, setSelectedWindow] = useState<ScoredWindow | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Mock data for demo
  const mockWindows: ScoredWindow[] = [
    {
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      attendanceCount: 4,
      attendanceScore: 100,
      travelFairnessScore: 85,
      timePreferenceScore: 90,
      overallScore: 91.67,
      attendees: [
        { id: 1, name: "You", email: "user@example.com" },
        { id: 2, name: "Alice", email: "alice@example.com" },
        { id: 3, name: "Bob", email: "bob@example.com" },
        { id: 4, name: "Carol", email: "carol@example.com" },
      ],
    },
    {
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      attendanceCount: 3,
      attendanceScore: 75,
      travelFairnessScore: 80,
      timePreferenceScore: 85,
      overallScore: 80,
      attendees: [
        { id: 1, name: "You", email: "user@example.com" },
        { id: 2, name: "Alice", email: "alice@example.com" },
        { id: 3, name: "Bob", email: "bob@example.com" },
      ],
    },
  ];

  const mockVenues: Venue[] = [
    {
      id: "1",
      name: "The Coffee House",
      address: "123 Main St, City Center",
      rating: 4.5,
      priceLevel: 2,
    },
    {
      id: "2",
      name: "Italian Bistro",
      address: "456 Park Ave, Downtown",
      rating: 4.7,
      priceLevel: 3,
    },
    {
      id: "3",
      name: "Casual Café",
      address: "789 Oak Rd, Midtown",
      rating: 4.2,
      priceLevel: 1,
    },
  ];

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriceDisplay = (level: number) => "£".repeat(level);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Golden Windows Found</h1>
          <p className="text-muted-foreground">Best times for your group to meet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Windows */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Available Times</h2>
            {mockWindows.map((window, idx) => (
              <Card
                key={idx}
                className={`cursor-pointer transition-all ${
                  selectedWindow === window ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedWindow(window)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {formatTime(window.startTime)}
                      </CardTitle>
                      <CardDescription>
                        {Math.round((new Date(window.endTime).getTime() - new Date(window.startTime).getTime()) / (60 * 60 * 1000))} hours
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {window.overallScore.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Attendance</div>
                      <div className="font-semibold">{window.attendanceScore.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Travel Fair</div>
                      <div className="font-semibold">{window.travelFairnessScore.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Time Pref</div>
                      <div className="font-semibold">{window.timePreferenceScore.toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{window.attendees.length} attending</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Venues */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Venues</h2>
            {mockVenues.map((venue) => (
              <Card
                key={venue.id}
                className={`cursor-pointer transition-all ${
                  selectedVenue === venue ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedVenue(venue)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{venue.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{venue.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{venue.rating}</span>
                    </div>
                    <span className="text-muted-foreground">{getPriceDisplay(venue.priceLevel)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedWindow && selectedVenue && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle>Your Golden Window</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-semibold">{formatTime(selectedWindow.startTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Venue</div>
                  <div className="font-semibold">{selectedVenue.name}</div>
                </div>
              </div>
              <Button className="w-full">Save to Calendar</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
