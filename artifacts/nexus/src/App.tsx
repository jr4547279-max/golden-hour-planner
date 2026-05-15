import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Preferences from "./pages/Preferences";
import GoldenWindow from "./pages/GoldenWindow";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./pages/ResetPassword";
import Circles from "./pages/Circles";
import CircleDetail from "./pages/CircleDetail";
import JoinCircle from "./pages/JoinCircle";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/circles" component={() => <ProtectedRoute component={Circles} />} />
      <Route path="/circles/:id" component={() => <ProtectedRoute component={CircleDetail} />} />
      <Route path="/join/:token" component={() => <ProtectedRoute component={JoinCircle} />} />
      <Route path="/preferences" component={() => <ProtectedRoute component={Preferences} />} />
      <Route path="/golden-window/:circleId" component={() => <ProtectedRoute component={GoldenWindow} />} />
      <Route path="/golden-window" component={() => <ProtectedRoute component={GoldenWindow} />} />
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
