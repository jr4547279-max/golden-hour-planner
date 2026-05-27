import { useState, useEffect } from "react";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Loader2, Users, Calendar, Sparkles,
  Heart, Briefcase, Star, Users2, Crown,
  UserPlus, Zap, Copy, Check, Share2,
  RefreshCw, Settings2, ChevronRight,
  CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import AvailabilityModal from "@/components/AvailabilityModal";
import { MobileLayout } from "@/components/nexus/BottomNav";
import { GlassCard, GoldenButton, StatusBadge } from "@/components/nexus/Cards";
import { OrbitalBackground, GoldenRing } from "@/components/nexus/GoldenRing";

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

function initials(name: string | null, email: string | null): string {
  const src = name || email || "?";
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function MemberAvatar({ 
  name, 
  email, 
  role, 
  synced = false,
  size = "md" 
}: { 
  name: string | null; 
  email: string | null; 
  role: string;
  synced?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  
  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#d4a853]/20 flex items-center justify-center`}>
        <span className="font-semibold text-white">{initials(name, email)}</span>
        {role === "admin" && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#d4a853] flex items-center justify-center">
            <Crown className="w-2.5 h-2.5 text-[#070b14]" />
          </div>
        )}
      </div>
      {synced && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#111827] flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
}

export default function CircleDetail() {
  useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const circleId = params.id ?? "";
  const utils = trpc.useUtils();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  const { data: circle, isLoading, error } = trpc.circles.getById.useQuery(
    { id: circleId },
    { enabled: Boolean(circleId) }
  );
  
  const { data: members } = trpc.circles.getMembers.useQuery(
    { circleId },
    { enabled: Boolean(circleId) }
  );
  
  const { data: myAvail } = trpc.availability.getMine.useQuery(
    { circleId },
    { enabled: Boolean(circleId) }
  );

  const inviteMutation = trpc.circles.inviteByEmail.useMutation({
    onSuccess: () => {
      utils.circles.getMembers.invalidate({ circleId });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteLoading(false);
      toast.success("Invitation sent");
    },
    onError: (err) => {
      setInviteLoading(false);
      toast.error(err.message || "Failed to invite");
    },
  });

  const hasMyAvail = (myAvail?.availableDays?.length ?? 0) > 0;
  const membersList = members ?? [];
  const syncedCount = membersList.filter(m => m.calendarConnected).length;
  const isCreator = circle?.createdBy === circle?.id;

  async function handleCopyInviteLink() {
    if (!circle?.inviteToken) return;
    const url = `${window.location.origin}/join/${circle.inviteToken}`;
    await navigator.clipboard.writeText(url);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
    toast.success("Invite link copied");
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    inviteMutation.mutate({ circleId, email: inviteEmail.trim() });
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-[#d4a853]" />
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !circle) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-white font-semibold mb-2">Circle not found</p>
          <p className="text-muted-foreground text-sm mb-6">
            This circle may have been deleted or you may not have access.
          </p>
          <GoldenButton onClick={() => setLocation("/circles")} variant="secondary">
            Back to Circles
          </GoldenButton>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#070b14]">
        <OrbitalBackground />
        
        <div className="relative px-4 pt-6 pb-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <button
              onClick={() => setLocation("/circles")}
              className="p-2 rounded-xl border border-[#d4a853]/10 text-muted-foreground hover:text-white hover:border-[#d4a853]/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-white truncate">{circle.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#d4a853]">{typeLabel(circle.type)}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-muted-foreground text-xs">{membersList.length} members</span>
              </div>
            </div>
            <button
              onClick={() => setInviteOpen(true)}
              className="p-2 rounded-xl border border-[#d4a853]/10 text-[#d4a853] hover:bg-[#d4a853]/10 transition-all"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </motion.header>

          {/* Golden Window Discovery Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <GlassCard 
              className="p-6 border-[#d4a853]/20 overflow-hidden relative" 
              glow
            >
              {/* Background decoration */}
              <div className="absolute -top-10 -right-10 opacity-20">
                <GoldenRing size={120} animate={false} />
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[#d4a853]" />
                  <h3 className="text-white font-semibold">Golden Window Discovery</h3>
                </div>
                
                {/* Sync Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    {membersList.slice(0, 4).map((m, i) => (
                      <div 
                        key={m.id}
                        className={`w-8 h-8 rounded-full border-2 border-[#111827] flex items-center justify-center ${
                          m.calendarConnected 
                            ? "bg-green-500/20" 
                            : "bg-[#1e293b]"
                        }`}
                      >
                        <span className="text-xs text-white">{initials(m.name, m.email)}</span>
                      </div>
                    ))}
                    {membersList.length > 4 && (
                      <div className="w-8 h-8 rounded-full border-2 border-[#111827] bg-[#1e293b] flex items-center justify-center">
                        <span className="text-xs text-[#d4a853]">+{membersList.length - 4}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {syncedCount} of {membersList.length} synced
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {syncedCount === membersList.length 
                        ? "Ready to find your window" 
                        : "Waiting for more calendars"}
                    </p>
                  </div>
                </div>
                
                <GoldenButton
                  onClick={() => setLocation(`/golden-window/${circleId}`)}
                  className="w-full"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Find Golden Window
                </GoldenButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Your Availability Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <GlassCard 
              className={`p-4 cursor-pointer transition-all ${
                hasMyAvail 
                  ? "border-green-500/20 hover:border-green-500/40" 
                  : "border-[#d4a853]/20 hover:border-[#d4a853]/40"
              }`}
              hoverable
              onClick={() => setAvailOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  hasMyAvail 
                    ? "bg-green-500/10 border border-green-500/20" 
                    : "bg-[#d4a853]/10 border border-[#d4a853]/20"
                }`}>
                  <Calendar className={`w-5 h-5 ${hasMyAvail ? "text-green-400" : "text-[#d4a853]"}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${hasMyAvail ? "text-green-300" : "text-[#d4a853]"}`}>
                    {hasMyAvail ? "Your availability is set" : "Set your availability"}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {hasMyAvail 
                      ? `${myAvail?.availableDays?.length ?? 0} days available`
                      : "Tap to add your free times"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Members Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold uppercase text-xs tracking-wider">
                Members
              </h2>
              <button
                onClick={() => setInviteOpen(true)}
                className="text-[#d4a853] text-xs font-medium hover:text-[#e8c77d] transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite
              </button>
            </div>
            
            <div className="space-y-2">
              {membersList.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                >
                  <GlassCard className="p-3">
                    <div className="flex items-center gap-3">
                      <MemberAvatar 
                        name={member.name} 
                        email={member.email} 
                        role={member.role}
                        synced={member.calendarConnected}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm truncate">
                            {member.name || member.email?.split("@")[0] || "Member"}
                          </span>
                          {member.role === "admin" && (
                            <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs truncate">
                          {member.email}
                        </p>
                      </div>
                      <StatusBadge 
                        status={member.calendarConnected ? "synced" : "pending"} 
                        label={member.calendarConnected ? "Synced" : "Pending"}
                      />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Shared Preferences Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold uppercase text-xs tracking-wider">
                Group Preferences
              </h2>
              <button
                onClick={() => setLocation("/preferences")}
                className="text-[#d4a853] text-xs font-medium hover:text-[#e8c77d] transition-colors flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
            
            <GlassCard className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#d4a853]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Evenings</p>
                    <p className="text-muted-foreground text-xs">Preferred time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
                    <span className="text-[#d4a853] text-xs font-medium">$$</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Mid-range</p>
                    <p className="text-muted-foreground text-xs">Budget</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
      
      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-[#111827] border-[#d4a853]/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Invite to {circle.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share the invite link or send an email invitation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Copy Link */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Share invite link</p>
              <button
                onClick={handleCopyInviteLink}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1e293b]/50 border border-[#d4a853]/10 text-left hover:border-[#d4a853]/30 transition-all"
              >
                <span className="text-white text-sm truncate flex-1 mr-3">
                  {`${window.location.origin}/join/${circle.inviteToken?.slice(0, 8)}...`}
                </span>
                {inviteLinkCopied ? (
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
            </div>
            
            {/* Email Invite */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Or invite by email</p>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50"
                />
                <GoldenButton disabled={inviteLoading || !inviteEmail.trim()}>
                  {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                </GoldenButton>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Availability Modal */}
      <AvailabilityModal
        open={availOpen}
        onOpenChange={setAvailOpen}
        circleId={circleId}
      />
    </MobileLayout>
  );
}
