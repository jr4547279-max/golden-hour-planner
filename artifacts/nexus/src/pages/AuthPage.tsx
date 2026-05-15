import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Globe, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user as any);
      setLocation("/");
    },
    onError: (err) => {
      setError(err.message || "Failed to log in. Please check your credentials.");
    },
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user as any);
      setLocation("/");
    },
    onError: (err) => {
      setError(err.message || "Failed to sign up. Please try again.");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signupMutation.mutate({ email, password, name });
  };

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const isLoading = loginMutation.isPending || signupMutation.isPending || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]" />
      
      {/* Globe Icon in Background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <Globe size={600} className="text-blue-400" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/20 mb-4">
            <Globe className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">NEXUS</h1>
          <p className="text-blue-200/60 mt-2 font-medium">Golden Window Planner</p>
        </div>

        <Card className="border-blue-900/50 bg-[#11112b]/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white text-center">Welcome Back</CardTitle>
            <CardDescription className="text-blue-200/50 text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={() => setError(null)}>
              <TabsList className="grid w-full grid-cols-2 bg-blue-950/50 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
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
                        className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus:ring-amber-500/20"
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
                        className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus:ring-amber-500/20"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-none shadow-lg shadow-blue-900/40 mt-2"
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
                        className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus:ring-amber-500/20"
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
                        className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus:ring-amber-500/20"
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
                        className="pl-10 bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 focus:ring-amber-500/20"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
          <CardFooter className="flex flex-col space-y-4 border-t border-blue-900/30 pt-6">
            <div className="text-xs text-center text-blue-200/30 px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-blue-200/40 text-sm flex items-center justify-center gap-2">
            Secure Infrastructure <Globe className="h-3 w-3" /> Encrypted Auth
          </p>
        </div>
      </div>
    </div>
  );
}
