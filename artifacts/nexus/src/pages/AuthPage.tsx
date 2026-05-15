import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Globe, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

type View = "auth" | "forgot-password" | "forgot-sent";

export default function AuthPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [, setLocation] = useLocation();

  const [view, setView] = useState<View>("auth");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials"
        ? "Incorrect email or password. Please try again."
        : err.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setIsLoading(false);
    if (err) {
      if (err.message.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists. Please log in.");
      } else {
        setError(err.message);
      }
    } else {
      setSuccessMsg("Account created! Check your email to confirm your address, then log in.");
      setActiveTab("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setView("forgot-sent");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="animate-spin h-8 w-8 text-amber-400" />
      </div>
    );
  }

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

        {view === "forgot-sent" ? (
          <Card className="border-blue-900/50 bg-[#11112b]/80 backdrop-blur-xl shadow-2xl">
            <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4 text-center">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30">
                <CheckCircle2 className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Check your inbox</h2>
                <p className="text-blue-200/60 text-sm leading-relaxed">
                  We've sent a password reset link to <span className="text-amber-400 font-medium">{forgotEmail}</span>.
                  Follow the link to choose a new password.
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-blue-300/70 hover:text-white mt-2"
                onClick={() => { setView("auth"); setForgotEmail(""); clearMessages(); }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Button>
            </CardContent>
          </Card>
        ) : view === "forgot-password" ? (
          <Card className="border-blue-900/50 bg-[#11112b]/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-1 text-blue-300/60 hover:text-white mb-1"
                onClick={() => { setView("auth"); clearMessages(); }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <CardTitle className="text-xl text-white">Reset your password</CardTitle>
              <CardDescription className="text-blue-200/50">
                Enter your email address and we'll send you a reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 bg-red-900/20 border-red-900/50 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-blue-100/70">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-none shadow-lg shadow-amber-900/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send reset link
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-900/50 bg-[#11112b]/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Welcome to Nexus</CardTitle>
              <CardDescription className="text-blue-200/50 text-center">
                Sign in or create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "login" | "signup"); clearMessages(); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-blue-950/50 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white text-blue-300/70">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white text-blue-300/70">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-4 bg-red-900/20 border-red-900/50 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {successMsg && (
                  <Alert className="mb-4 bg-green-900/20 border-green-900/50 text-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-blue-100/70">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-blue-100/70">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                        <Input
                          id="login-password"
                          type="password"
                          autoComplete="current-password"
                          className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
                        onClick={() => { setView("forgot-password"); clearMessages(); setForgotEmail(email); }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-none shadow-lg shadow-blue-900/40"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-blue-100/70">Display Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          autoComplete="name"
                          className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-blue-100/70">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus-visible:ring-amber-500/20"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-blue-100/70">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                        <Input
                          id="signup-password"
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
                      <Label htmlFor="signup-confirm" className="text-blue-100/70">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400/50" />
                        <Input
                          id="signup-confirm"
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
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 border-t border-blue-900/30 pt-5">
              <p className="text-xs text-center text-blue-200/30 px-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        )}

        <div className="mt-6 text-center">
          <p className="text-blue-200/30 text-xs flex items-center justify-center gap-2">
            Secured with Supabase <Globe className="h-3 w-3" /> End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
