import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { GoldenRing, OrbitalBackground } from "@/components/nexus/GoldenRing";
import { GlassCard, GoldenButton } from "@/components/nexus/Cards";

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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-[#d4a853]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4 overflow-hidden">
      <OrbitalBackground />
      
      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <GoldenRing size={100} />
          <h1 className="text-2xl font-light tracking-[0.2em] text-white mt-4">NEXUS</h1>
          <p className="text-[#d4a853]/60 text-sm mt-1">Plans, perfectly aligned.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "forgot-sent" ? (
            <motion.div
              key="forgot-sent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-8" glow>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-[#d4a853]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Check your inbox</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {"We've sent a password reset link to "}
                    <span className="text-[#d4a853]">{forgotEmail}</span>.
                    Follow the link to choose a new password.
                  </p>
                  <button
                    onClick={() => { setView("auth"); setForgotEmail(""); clearMessages(); }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ) : view === "forgot-password" ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-8" glow>
                <button
                  onClick={() => { setView("auth"); clearMessages(); }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                
                <h2 className="text-xl font-semibold text-white mb-2">Reset your password</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {"Enter your email address and we'll send you a reset link."}
                </p>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-muted-foreground">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <GoldenButton
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                  </GoldenButton>
                </form>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-8" glow>
                <h2 className="text-xl font-semibold text-white text-center mb-2">
                  {activeTab === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-muted-foreground text-sm text-center mb-6">
                  {activeTab === "login" 
                    ? "Sign in to continue to Nexus" 
                    : "Join Nexus to start coordinating"}
                </p>
                
                {/* Tabs */}
                <div className="flex p-1 mb-6 bg-[#1e293b]/50 rounded-xl">
                  {(["login", "signup"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); clearMessages(); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab 
                          ? "bg-[#d4a853] text-[#070b14]" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {tab === "login" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>
                
                {/* Messages */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
                
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-green-300 text-sm">{successMsg}</p>
                  </motion.div>
                )}
                
                <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-muted-foreground">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="pl-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-muted-foreground">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="pl-11 pr-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm text-[#d4a853]/80 hover:text-[#d4a853] transition-colors"
                          onClick={() => { setView("forgot-password"); clearMessages(); setForgotEmail(email); }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      
                      <GoldenButton
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                      </GoldenButton>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSignup}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-muted-foreground">Display Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            autoComplete="name"
                            className="pl-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-muted-foreground">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="pl-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-muted-foreground">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            className="pl-11 pr-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-muted-foreground">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-confirm"
                            type={showPassword ? "text" : "password"}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            className="pl-11 h-12 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 focus-visible:ring-[#d4a853]/20"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <GoldenButton
                        className="w-full mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                      </GoldenButton>
                    </motion.form>
                  )}
                </AnimatePresence>
                
                {/* Social divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#d4a853]/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#111827] px-4 text-muted-foreground text-xs">
                      or continue with
                    </span>
                  </div>
                </div>
                
                {/* Google Sign In */}
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-800 font-medium hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                
                <p className="mt-6 text-center text-muted-foreground/50 text-xs">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-muted-foreground/40 text-xs flex items-center justify-center gap-2"
        >
          <Lock className="h-3 w-3" />
          Secured with Supabase - End-to-end encrypted
        </motion.p>
      </div>
    </div>
  );
}
