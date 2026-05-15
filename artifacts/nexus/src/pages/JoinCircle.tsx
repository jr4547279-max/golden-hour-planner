import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2, Globe, Users2, Heart, Briefcase, Star, Sparkles, Users,
  CheckCircle2, AlertCircle, UserPlus,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

const CIRCLE_TYPES = [
  { value: "friends", label: "Friends", icon: Users2 },
  { value: "family", label: "Family", icon: Heart },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "date_night", label: "Date Night", icon: Star },
  { value: "other", label: "Other", icon: Sparkles },
] as const;

function typeLabel(type: string) {
  return CIRCLE_TYPES.find((t) => t.value === type)?.label ?? type;
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const found = CIRCLE_TYPES.find((t) => t.value === type);
  const Icon = found?.icon ?? Users;
  return <Icon className={className} />;
}

function typeBadgeColor(type: string) {
  const map: Record<string, string> = {
    friends: "bg-blue-900/40 text-blue-300 border-blue-800/50",
    family: "bg-rose-900/40 text-rose-300 border-rose-800/50",
    work: "bg-amber-900/40 text-amber-300 border-amber-800/50",
    date_night: "bg-purple-900/40 text-purple-300 border-purple-800/50",
    other: "bg-slate-800/60 text-slate-300 border-slate-700/50",
  };
  return map[type] ?? map.other;
}

function typeAccentColor(type: string) {
  const map: Record<string, string> = {
    friends: "from-blue-600 to-blue-800",
    family: "from-rose-600 to-rose-800",
    work: "from-amber-600 to-amber-800",
    date_night: "from-purple-600 to-purple-800",
    other: "from-slate-600 to-slate-800",
  };
  return map[type] ?? map.other;
}

export default function JoinCircle() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [justAuthed, setJustAuthed] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const { data: circle, isLoading: circleLoading, error: circleError } = trpc.circles.getByToken.useQuery(
    { token },
    { enabled: Boolean(token) }
  );

  const joinMutation = trpc.circles.joinByToken.useMutation({
    onSuccess: (data: any) => {
      utils.circles.list.invalidate();
      setJoined(true);
      setTimeout(() => setLocation(`/circles/${data.circleId}`), 1500);
    },
    onError: (err: any) => setJoinError(err.message),
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      utils.auth.me.setData(undefined, data.user as any);
      setJustAuthed(true);
    },
    onError: (err: any) => setAuthError(err.message || "Login failed"),
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data: any) => {
      utils.auth.me.setData(undefined, data.user as any);
      setJustAuthed(true);
    },
    onError: (err: any) => setAuthError(err.message || "Sign up failed"),
  });

  useEffect(() => {
    if (isAuthenticated && user && circle && justAuthed && !joined && !joinMutation.isPending) {
      joinMutation.mutate({ token });
    }
  }, [isAuthenticated, user, circle, justAuthed]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-red-400">Invalid invite link.</p>
      </div>
    );
  }

  if (circleLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
      </div>
    );
  }

  if (circleError || !circle) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Invite link not found</h2>
        <p className="text-blue-200/50 text-sm text-center max-w-xs">
          This invite link may have been reset or is no longer valid.
        </p>
        <Button variant="outline" onClick={() => setLocation("/")} className="border-blue-900/40 text-blue-300">
          Go to Nexus
        </Button>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white">You joined {circle.name}!</h2>
        <p className="text-blue-200/50 text-sm">Redirecting you to the circle…</p>
        <Loader2 className="animate-spin h-5 w-5 text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/20 mb-3">
            <Globe className="h-7 w-7 text-amber-400" />
          </div>
          <p className="text-blue-200/50 text-sm font-medium">You've been invited to join a circle on</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">NEXUS</h1>
        </div>

        <Card className="border-blue-900/40 bg-[#11112b]/80 overflow-hidden">
          <div className={`h-1.5 w-full bg-gradient-to-r ${typeAccentColor(circle.type)}`} />
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${typeAccentColor(circle.type)} flex items-center justify-center shadow-lg`}>
                <TypeIcon type={circle.type} className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{circle.name}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadgeColor(circle.type)}`}>
                    {typeLabel(circle.type)}
                  </span>
                </div>
                {circle.description && (
                  <p className="text-blue-200/50 text-sm mt-0.5 truncate">{circle.description}</p>
                )}
                <p className="text-blue-200/40 text-xs mt-1">
                  {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}
                  {circle.creatorName ? ` · Created by ${circle.creatorName}` : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isAuthenticated ? (
          <Card className="border-blue-900/40 bg-[#11112b]/80">
            <CardContent className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-white font-medium">
                  Joining as <span className="text-amber-400">{user?.name || user?.email}</span>
                </p>
              </div>
              {joinError && (
                <Alert className="bg-red-900/20 border-red-900/50">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{joinError}</AlertDescription>
                </Alert>
              )}
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold"
                onClick={() => joinMutation.mutate({ token })}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" /> Join {circle.name}</>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-900/40 bg-[#11112b]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg text-center">Log in or sign up to join</CardTitle>
              <CardDescription className="text-blue-200/50 text-center text-sm">
                Create a free Nexus account to join the circle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" onValueChange={() => setAuthError(null)}>
                <TabsList className="grid w-full grid-cols-2 bg-blue-950/50 mb-4">
                  <TabsTrigger value="login" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">Log In</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">Sign Up</TabsTrigger>
                </TabsList>

                {authError && (
                  <Alert className="mb-4 bg-red-900/20 border-red-900/50">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">{authError}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAuthError(null);
                      loginMutation.mutate({ email, password });
                    }}
                  >
                    <div className="space-y-1">
                      <Label className="text-blue-100/70 text-sm">Email</Label>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-blue-100/70 text-sm">Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Log In & Join
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAuthError(null);
                      signupMutation.mutate({ email, password, name });
                    }}
                  >
                    <div className="space-y-1">
                      <Label className="text-blue-100/70 text-sm">Display Name</Label>
                      <Input
                        type="text"
                        placeholder="Your name"
                        className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-blue-100/70 text-sm">Email</Label>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-blue-100/70 text-sm">Password</Label>
                      <Input
                        type="password"
                        placeholder="At least 8 characters"
                        className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
                      disabled={signupMutation.isPending}
                    >
                      {signupMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign Up & Join
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
