import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Loader2, Users, Calendar, Sparkles,
  Heart, Briefcase, Star, Users2, Crown,
  UserPlus, Zap, Copy, Check, Share2,
  RefreshCw, ShieldAlert, Settings2, Save,
  Coffee, Music, Briefcase as BriefcaseIcon, Building, Trees, Home,
  CalendarDays,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import AvailabilityModal from "@/components/AvailabilityModal";

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

function initials(name: string | null, email: string | null): string {
  const src = name || email || "?";
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0]! + parts[1][0]!).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function MemberAvatar({ name, email, role }: { name: string | null; email: string | null; role: string }) {
  const bg = role === "admin"
    ? "bg-gradient-to-br from-amber-700 to-amber-900"
    : "bg-gradient-to-br from-blue-700 to-blue-900";
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
      <span className="text-xs font-bold text-white">{initials(name, email)}</span>
    </div>
  );
}

function safeParseJSON(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

type ChipOpt = { value: string; label: string; icon?: React.ReactNode };

function ChipGroup({
  options, selected, onChange, multi = true,
}: {
  options: ChipOpt[];
  selected: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
}) {
  function toggle(val: string) {
    if (multi) {
      onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    } else {
      onChange(selected.includes(val) ? [] : [val]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
              active
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                : "bg-blue-950/40 border-blue-900/40 text-blue-200/60 hover:border-blue-700/60 hover:text-blue-200/90"
            }`}
          >
            {opt.icon && <span className="h-3.5 w-3.5 flex-shrink-0">{opt.icon}</span>}
            {opt.label}
            {active && <Check className="h-3 w-3 ml-0.5 text-amber-400" />}
          </button>
        );
      })}
    </div>
  );
}

const VIBE_OPTIONS: ChipOpt[] = [
  { value: "chill", label: "Chill", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "lively", label: "Lively", icon: <Music className="h-3.5 w-3.5" /> },
  { value: "productive", label: "Productive", icon: <BriefcaseIcon className="h-3.5 w-3.5" /> },
  { value: "romantic", label: "Romantic", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "adventurous", label: "Adventurous", icon: <Zap className="h-3.5 w-3.5" /> },
];

const BUDGET_OPTIONS: ChipOpt[] = [
  { value: "£", label: "£ — Budget" },
  { value: "££", label: "££ — Mid-range" },
  { value: "£££", label: "£££ — Premium" },
];

const VENUE_TYPE_OPTIONS: ChipOpt[] = [
  { value: "restaurant", label: "Restaurant", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "bar", label: "Bar / Pub", icon: <Music className="h-3.5 w-3.5" /> },
  { value: "cafe", label: "Café", icon: <Coffee className="h-3.5 w-3.5" /> },
  { value: "park", label: "Park", icon: <Trees className="h-3.5 w-3.5" /> },
  { value: "indoor_activity", label: "Indoor Activity", icon: <Building className="h-3.5 w-3.5" /> },
  { value: "outdoor_activity", label: "Outdoor Activity", icon: <Home className="h-3.5 w-3.5" /> },
];

function CirclePreferencesPanel({
  circleId,
  isCreator,
}: {
  circleId: string;
  isCreator: boolean;
}) {
  const utils = trpc.useUtils();
  const { data: circlePrefs, isLoading } = trpc.circles.getPreferences.useQuery({ id: circleId });
  const updateMutation = trpc.circles.updatePreferences.useMutation({
    onSuccess: () => {
      utils.circles.getPreferences.invalidate({ id: circleId });
      setIsDirty(false);
      setIsSaving(false);
      toast.success("Circle preferences saved");
    },
    onError: (err) => {
      setIsSaving(false);
      toast.error(err.message || "Failed to save circle preferences");
    },
  });

  const [preferredArea, setPreferredArea] = useState("");
  const [budgetRange, setBudgetRange] = useState<string[]>([]);
  const [defaultVibe, setDefaultVibe] = useState<string[]>([]);
  const [defaultVenueType, setDefaultVenueType] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!circlePrefs) return;
    setPreferredArea(circlePrefs.preferredArea ?? "");
    setBudgetRange(circlePrefs.budgetRange ? [circlePrefs.budgetRange] : []);
    setDefaultVibe(safeParseJSON(circlePrefs.defaultVibe));
    setDefaultVenueType(safeParseJSON(circlePrefs.defaultVenueType));
  }, [circlePrefs]);

  function markDirty() { setIsDirty(true); }

  function handleSave() {
    setIsSaving(true);
    updateMutation.mutate({
      id: circleId,
      preferredArea: preferredArea || undefined,
      budgetRange: budgetRange[0] as "£" | "££" | "£££" | undefined,
      defaultVibe,
      defaultVenueType,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-sm text-blue-200/40">Loading preferences…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isCreator && (
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/30">
          <p className="text-xs text-blue-200/50">Only the circle admin can edit these preferences.</p>
        </div>
      )}

      {/* Preferred area */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">Preferred Area / Neighbourhood</p>
        <Input
          value={preferredArea}
          onChange={(e) => { setPreferredArea(e.target.value); markDirty(); }}
          placeholder="e.g., Shoreditch, Central London…"
          disabled={!isCreator}
          className="bg-blue-950/40 border-blue-900/40 text-white placeholder:text-blue-200/30 disabled:opacity-50"
        />
      </div>

      {/* Budget range */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">Circle Budget</p>
        <ChipGroup
          options={BUDGET_OPTIONS}
          selected={budgetRange}
          onChange={(v) => { if (isCreator) { setBudgetRange(v); markDirty(); } }}
          multi={false}
        />
      </div>

      {/* Default vibe */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">Default Vibe</p>
        <ChipGroup
          options={VIBE_OPTIONS}
          selected={defaultVibe}
          onChange={(v) => { if (isCreator) { setDefaultVibe(v); markDirty(); } }}
        />
      </div>

      {/* Venue type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">Preferred Venue Types</p>
        <ChipGroup
          options={VENUE_TYPE_OPTIONS}
          selected={defaultVenueType}
          onChange={(v) => { if (isCreator) { setDefaultVenueType(v); markDirty(); } }}
        />
      </div>

      {isCreator && isDirty && (
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-amber-500 hover:bg-amber-400 text-[#0a0a1a] font-semibold rounded-xl"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Save Circle Preferences</>
          )}
        </Button>
      )}
    </div>
  );
}

function InviteDialog({
  open,
  onOpenChange,
  circleName,
  inviteToken,
  circleId,
  isCreator,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleName: string;
  inviteToken: string;
  circleId: string;
  isCreator: boolean;
}) {
  const utils = trpc.useUtils();
  const [copied, setCopied] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const inviteUrl = `${window.location.origin}/join/${inviteToken}`;

  const regenMutation = trpc.circles.regenerateInviteLink.useMutation({
    onSuccess: () => {
      utils.circles.getById.invalidate({ id: circleId });
      setConfirmRegen(false);
      toast.success("Invite link regenerated");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }

  function handleShare() {
    if (typeof navigator.share === "function") {
      navigator.share({
        title: `Join ${circleName} on Nexus`,
        text: `You're invited to join the ${circleName} circle on Nexus — Golden Window Planner.`,
        url: inviteUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setConfirmRegen(false); }}>
      <DialogContent className="bg-[#11112b] border-blue-900/40 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-400" />
            Invite to {circleName}
          </DialogTitle>
          <DialogDescription className="text-blue-200/50">
            Share this link with people you want to invite. Anyone with the link can join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-blue-200/50 uppercase tracking-wider font-semibold">Invite Link</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="bg-blue-950/40 border-blue-900/40 text-blue-200 text-xs font-mono flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-800/60 hover:bg-blue-700/70 text-white border border-blue-700/40"
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <><Check className="mr-1.5 h-3.5 w-3.5 text-green-400" /> Copied!</>
                ) : (
                  <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link</>
                )}
              </Button>
              <Button
                className="flex-1 bg-blue-800/60 hover:bg-blue-700/70 text-white border border-blue-700/40"
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </div>

          {isCreator && (
            <div className="pt-2 border-t border-blue-900/30">
              {!confirmRegen ? (
                <button
                  className="w-full flex items-center gap-2 text-xs text-blue-400/60 hover:text-blue-300/80 transition-colors py-1"
                  onClick={() => setConfirmRegen(true)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate link (invalidates current link)
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-900/20 border border-amber-900/30">
                    <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300/80">
                      This will invalidate the current invite link. Anyone who has it will no longer be able to join.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-900/40 text-blue-300"
                      onClick={() => setConfirmRegen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-amber-700 hover:bg-amber-600 text-white"
                      onClick={() => regenMutation.mutate({ id: circleId })}
                      disabled={regenMutation.isPending}
                    >
                      {regenMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Regenerate"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CircleDetail() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const circleId = params.id;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  const { data: circle, isLoading, error } = trpc.circles.getById.useQuery(
    { id: circleId ?? "" },
    { enabled: Boolean(circleId) }
  );

  const { data: members } = trpc.circles.getMembers.useQuery(
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

        {/* Members section */}
        {members && members.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider px-1">
              Members · {members.length}
            </h2>
            <Card className="border-blue-900/30 bg-[#11112b]/60">
              <CardContent className="p-0">
                {members.map((m, i) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? "border-b border-blue-900/20" : ""}`}
                  >
                    <MemberAvatar name={m.name} email={m.email} role={m.role} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {m.name || m.email || "Unknown"}
                        {m.userId === user?.id && (
                          <span className="ml-1.5 text-xs text-blue-400/50 font-normal">· You</span>
                        )}
                      </p>
                      {m.name && m.email && (
                        <p className="text-blue-200/40 text-xs truncate">{m.email}</p>
                      )}
                    </div>
                    {m.role === "admin" && (
                      <span className="flex items-center gap-1 text-xs text-amber-400/70 border border-amber-900/30 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Crown className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Circle Preferences section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider">
              Circle Preferences
            </h2>
            <button
              onClick={() => setPrefsOpen(!prefsOpen)}
              className="flex items-center gap-1.5 text-xs text-blue-400/60 hover:text-blue-300/90 transition-colors"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {prefsOpen ? "Collapse" : "Expand"}
            </button>
          </div>

          {prefsOpen ? (
            <Card className="border-blue-900/30 bg-[#11112b]/60">
              <CardContent className="p-5">
                <CirclePreferencesPanel circleId={circleId} isCreator={isCreator} />
              </CardContent>
            </Card>
          ) : (
            <button
              onClick={() => setPrefsOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-800/40 transition-colors">
                <Settings2 className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">
                  {isCreator ? "Configure Circle Preferences" : "View Circle Preferences"}
                </div>
                <div className="text-xs text-blue-200/40">
                  {isCreator
                    ? "Set default vibe, budget, area and venue type for this circle"
                    : "Preferred vibe, budget, area and venue type for this circle"}
                </div>
              </div>
              <Settings2 className="h-4 w-4 text-blue-400/40 group-hover:text-blue-300/60 transition-colors flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-blue-200/50 uppercase tracking-wider px-1">Actions</h2>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setInviteOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/50 transition-colors">
                <UserPlus className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">Invite Members</div>
                <div className="text-xs text-blue-200/40">Share a link to invite people to this circle</div>
              </div>
              <Share2 className="h-4 w-4 text-blue-400/40 group-hover:text-blue-300/60 transition-colors flex-shrink-0" />
            </button>

            <button
              onClick={() => setAvailOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-900/40 bg-[#11112b]/60 hover:bg-[#11112b] hover:border-blue-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/50 transition-colors">
                <CalendarDays className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">Set My Availability</div>
                <div className="text-xs text-blue-200/40">Tell the group which days and times work for you</div>
              </div>
              <CalendarDays className="h-4 w-4 text-blue-400/40 group-hover:text-blue-300/60 transition-colors flex-shrink-0" />
            </button>

            <button
              onClick={() => setLocation(`/golden-window/${circleId}`)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/20 hover:border-amber-700/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-800/40 transition-colors">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-amber-300">Find Golden Window</div>
                <div className="text-xs text-amber-200/40">Discover the best time for everyone to meet</div>
              </div>
              <Zap className="h-4 w-4 text-amber-400/40 group-hover:text-amber-300/60 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {circle.inviteToken && (
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          circleName={circle.name}
          inviteToken={circle.inviteToken}
          circleId={circle.id}
          isCreator={isCreator}
        />
      )}

      <AvailabilityModal
        open={availOpen}
        onOpenChange={setAvailOpen}
        circleId={circleId}
        circleName={circle.name}
      />
    </div>
  );
}
