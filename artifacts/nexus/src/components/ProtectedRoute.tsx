import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import type { ComponentType } from "react";

type Props = {
  component: ComponentType;
};

export default function ProtectedRoute({ component: Component }: Props) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="animate-spin h-8 w-8 text-amber-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}
