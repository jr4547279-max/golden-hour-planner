import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Globe, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasSession(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setTimeout(() => setLocation("/"), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <Globe size={600} className="text-blue-400" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/30 mb-4">
            <Globe className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">NEXUS</h1>
          <p className="text-blue-200/60 mt-2 font-medium">Golden Window Planner</p>
        </div>

        <Card className="border-blue-900/50 bg-[#11112b]/80 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white text-center">Set a new password</CardTitle>
            <CardDescription className="text-blue-200/50 text-center">
              Choose a strong password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="p-3 rounded-full bg-green-500/10 border border-green-500/30">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-white font-medium">Password updated!</p>
                <p className="text-blue-200/50 text-sm">Redirecting you to the app…</p>
              </div>
            ) : !hasSession ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <Alert className="bg-amber-900/20 border-amber-900/50 text-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This reset link has expired or already been used. Please request a new one.
                  </AlertDescription>
                </Alert>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-none mt-2"
                  onClick={() => setLocation("/login")}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {error && (
                  <Alert className="bg-red-900/20 border-red-900/50 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-blue-100/70">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-blue-100/70">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-none shadow-lg shadow-amber-900/20 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
