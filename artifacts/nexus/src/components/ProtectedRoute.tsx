import { useAuthContext } from "@/contexts/AuthContext";
import { isDemoMode } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import type { ComponentType } from "react";

type Props = {
  component: ComponentType;
};

export default function ProtectedRoute({ component: Component }: Props) {
  const { isAuthenticated, loading } = useAuthContext();

  // In demo mode, allow access to protected routes
  if (isDemoMode) {
    return <Component />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <Loader2 className="animate-spin h-8 w-8 text-[#d4a853]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}
