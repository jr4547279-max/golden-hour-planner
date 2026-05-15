import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Loader2, Users, Calendar, Sparkles,
  Heart, Briefcase, Star, Users2, Crown,
  UserPlus, Zap,
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

export default function CircleDetail() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const circleId = params.id;

  const { data: circle, isLoading, error } = trpc.circles.getById.useQuery(
    { id: circleId ?? "" },
    { enabled: Boolean(circleId) }
  );

  if (!circleId) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-blue-200/50">Circle not found.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error?.message || "Circle not found."}</p>
        <Button variant="ghost" onClick={() => setLocation("/circles")} className="text-blue-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Circles
        </Button>
      </div>
    );
  }

  const isCreator = circle.creator?.id === user?.id;

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/circles")}
          className="text-blue-300 hover:text-white hover:bg-blue-900/30 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Circles
        </Button>

        {/* Hero card */}
        <Card className="border-blue-900/40 bg-[#11112b]/80 overflow-hidden">
          <div className={`h-2 w-full bg-gradient-to-r ${typeAccentColor(circle.type)}`} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${typeAccentColor(circle.type)} flex items-center justify-center shadow-lg`}>
                <TypeIcon type={circle.type} className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-white">{circle.name}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeBadgeColor(circle.type)}`}>
                    {typeLabel(circle.type)}
                  </span>
                </div>
                {circle.description && (
                  <p className="text-blue-200/60 text-sm">{circle.description}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-blue-950/40 rounded-xl p-3 text-center border border-blue-900/30">
                <div className="text-2xl font-bold text-white">{circle.memberCount}</div>
                <div className="text-xs text-blue-200/50 mt-0.5">
                  {circle.memberCount === 1 ? "Member" : "Members"}
                </div>
              </div>
              <div className="bg-blue-950/40 rounded-xl p-3 text-center border border-blue-900/30">
                <div className="text-2xl font-bold text-white">{circle.pendingInvites}</div>
                <div className="text-xs text-blue-200/50 mt-0.5">Pending Invites</div>
              </div>
              <div className="bg-blue-950/40 rounded-xl p-3 text-center border border-blue-900/30">
                <div className="text-2xl font-bold text-amber-400">—</div>
                <div className="text-xs text-blue-200/50 mt-0.5">Golden Windows</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator info */}
        <Card className="border-blue-900/30 bg-[#11112b]/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blue-200/40 uppercase tracking-wider">Created by</p>
              <p className="text-white font-medium truncate">
                {isCreator ? "You" : circle.creator?.name || circle.creator?.email || "Unknown"}
                {isCreator && (
                  <span className="ml-2 text-xs text-amber-400/70 font-normal">· Admin</span>
                )}
              </p>
            </div>
            <div className="ml-auto text-xs text-blue-200/30">
              {new Date(circle.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider px-1">Actions</h2>

          <div className="grid grid-cols-1 gap-3">
            <button
              disabled
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/50 transition-colors">
                <UserPlus className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">Invite Members</div>
                <div className="text-xs text-blue-200/40">Share a link or send email invites</div>
              </div>
              <span className="text-xs text-blue-400/40 border border-blue-900/40 rounded-full px-2 py-0.5 flex-shrink-0">Soon</span>
            </button>

            <button
              disabled
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/50 transition-colors">
                <Calendar className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">Sync Calendars</div>
                <div className="text-xs text-blue-200/40">Pull everyone's availability from Google Calendar</div>
              </div>
              <span className="text-xs text-blue-400/40 border border-blue-900/40 rounded-full px-2 py-0.5 flex-shrink-0">Soon</span>
            </button>

            <button
              disabled
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/20 hover:border-amber-700/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-800/40 transition-colors">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-amber-300">Find Golden Window</div>
                <div className="text-xs text-amber-200/40">Discover the best time for everyone to meet</div>
              </div>
              <span className="text-xs text-amber-400/40 border border-amber-900/40 rounded-full px-2 py-0.5 flex-shrink-0">Soon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
