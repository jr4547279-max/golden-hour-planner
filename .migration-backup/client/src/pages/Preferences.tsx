import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Preferences() {
  const { user, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // Get calendar status
  const { data: calendarStatus, isLoading: statusLoading, refetch: refetchStatus } = trpc.calendar.getStatus.useQuery();

  // Get user preferences
  const { data: preferences, isLoading: prefsLoading } = trpc.calendar.getPreferences.useQuery();

  // Get auth URL
  const { data: authUrl } = trpc.calendar.getAuthUrl.useQuery();

  // Mutations
  const syncMutation = trpc.calendar.syncAvailability.useMutation({
    onSuccess: () => {
      setIsSyncing(false);
      refetchStatus();
    },
    onError: () => {
      setIsSyncing(false);
    },
  });

  const disconnectMutation = trpc.calendar.disconnect.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const updatePrefsMutation = trpc.calendar.updatePreferences.useMutation();

  const handleConnect = () => {
    if (authUrl?.authUrl) {
      window.location.href = authUrl.authUrl;
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // TODO: Get groupId from context or route params
    // syncMutation.mutate({ groupId: "default-group" });
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect your Google Calendar?")) {
      disconnectMutation.mutate();
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Preferences</h1>
            <p className="text-muted-foreground">Manage your account and calendar settings</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-foreground font-medium">{user.name || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-foreground font-medium">{user.email || "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Google Calendar Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>Connect your calendar to sync availability with groups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : calendarStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Connected</p>
                    <p className="text-xs text-green-700 dark:text-green-300">{calendarStatus.email}</p>
                  </div>
                </div>

                {calendarStatus.lastSynced && (
                  <div className="text-sm text-muted-foreground">
                    Last synced: {new Date(calendarStatus.lastSynced).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex-1"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">Not connected</p>
                </div>
                <Button onClick={handleConnect} className="w-full">
                  Connect Google Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your meeting preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prefsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxTravel">Max Travel Distance (km)</Label>
                  <Input
                    id="maxTravel"
                    type="number"
                    placeholder="e.g., 10"
                    defaultValue={preferences?.maxTravelDistance || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        updatePrefsMutation.mutate({
                          maxTravelDistance: parseInt(e.target.value),
                        });
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxSpend">Max Spend per Person (£)</Label>
                  <Input
                    id="maxSpend"
                    type="number"
                    placeholder="e.g., 50"
                    defaultValue={preferences?.maxSpend || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        updatePrefsMutation.mutate({
                          maxSpend: parseInt(e.target.value),
                        });
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="homeLat">Home Latitude</Label>
                  <Input
                    id="homeLat"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 51.5074"
                    defaultValue={preferences?.homeLat || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        updatePrefsMutation.mutate({
                          homeLat: e.target.value,
                        });
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="homeLng">Home Longitude</Label>
                  <Input
                    id="homeLng"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., -0.1278"
                    defaultValue={preferences?.homeLng || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        updatePrefsMutation.mutate({
                          homeLng: e.target.value,
                        });
                      }
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
