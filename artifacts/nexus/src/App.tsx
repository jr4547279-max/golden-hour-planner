import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Onboarding from "./pages/Onboarding";
import Preferences from "./pages/Preferences";
import GoldenWindow from "./pages/GoldenWindow";
import ResetPassword from "./pages/ResetPassword";
import Circles from "./pages/Circles";
import CircleDetail from "./pages/CircleDetail";
import JoinCircle from "./pages/JoinCircle";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/landing" component={LandingPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected routes */}
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/onboarding" component={() => <ProtectedRoute component={Onboarding} />} />
      <Route path="/circles" component={() => <ProtectedRoute component={Circles} />} />
      <Route path="/circles/:id" component={() => <ProtectedRoute component={CircleDetail} />} />
      <Route path="/join/:token" component={() => <ProtectedRoute component={JoinCircle} />} />
      <Route path="/preferences" component={() => <ProtectedRoute component={Preferences} />} />
      <Route path="/golden-window/:circleId" component={() => <ProtectedRoute component={GoldenWindow} />} />
      <Route path="/golden-window" component={() => <ProtectedRoute component={GoldenWindow} />} />
      <Route path="/activity" component={() => <ProtectedRoute component={Activity} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
