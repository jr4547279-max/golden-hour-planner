import { useState } from "react";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, Plus, Loader2, Heart, Briefcase, Star, Sparkles, Users2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/nexus/BottomNav";
import { GlassCard, GoldenButton } from "@/components/nexus/Cards";
import { OrbitalBackground } from "@/components/nexus/GoldenRing";

const CIRCLE_TYPES = [
  { value: "friends", label: "Friends", icon: Users2 },
  { value: "family", label: "Family", icon: Heart },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "date_night", label: "Date Night", icon: Star },
  { value: "other", label: "Other", icon: Sparkles },
] as const;

type CircleTypeValue = typeof CIRCLE_TYPES[number]["value"];

function typeLabel(type: string) {
  return CIRCLE_TYPES.find((t) => t.value === type)?.label ?? type;
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const found = CIRCLE_TYPES.find((t) => t.value === type);
  const Icon = found?.icon ?? Users;
  return <Icon className={className} />;
}

export default function Circles() {
  useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CircleTypeValue>("friends");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: circles, isLoading } = trpc.circles.list.useQuery(undefined, {
    refetchOnMount: true,
  });

  const createMutation = trpc.circles.create.useMutation({
    onSuccess: (data) => {
      utils.circles.list.invalidate();
      setOpen(false);
      resetForm();
      setLocation(`/circles/${data.circle.id}`);
    },
    onError: (err) => {
      setFormError(err.message || "Failed to create circle.");
    },
  });

  function resetForm() {
    setName("");
    setDescription("");
    setType("friends");
    setFormError(null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Circle name is required.");
      return;
    }
    setFormError(null);
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined, type });
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
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/")}
                className="p-2 rounded-xl border border-[#d4a853]/10 text-muted-foreground hover:text-white hover:border-[#d4a853]/30 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Your Groups</h1>
                <p className="text-muted-foreground text-sm">Groups you plan with</p>
              </div>
            </div>
            <GoldenButton
              onClick={() => setOpen(true)}
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              New
            </GoldenButton>
          </motion.header>

          {/* Circle List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 text-[#d4a853] animate-spin" />
            </div>
          ) : circles && circles.length > 0 ? (
            <div className="space-y-3">
              {circles.map((circle, i) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard
                    hoverable
                    onClick={() => setLocation(`/circles/${circle.id}`)}
                    className="p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0">
                        <TypeIcon type={circle.type} className="w-6 h-6 text-[#d4a853]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white truncate">{circle.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20">
                            {typeLabel(circle.type)}
                          </span>
                        </div>
                        {circle.description && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {circle.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#d4a853]/50" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No groups yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  Create a group and invite friends to start finding Golden Windows together.
                </p>
                <GoldenButton
                  onClick={() => setOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create your first group
                </GoldenButton>
              </GlassCard>
            </motion.div>
          )}

          {/* How it works */}
          {(!circles || circles.length === 0) && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                  How groups work
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>1. Create a group and give it a name</p>
                  <p>2. Invite your friends via email</p>
                  <p>3. Everyone connects their calendar</p>
                  <p>4. Find your Golden Window</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="bg-[#111827] border-[#d4a853]/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create a Group</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Name your group and choose a type to get started.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="circle-name" className="text-muted-foreground">Group Name</Label>
              <Input
                id="circle-name"
                placeholder="e.g. Friday Drinks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="circle-type" className="text-muted-foreground">Group Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CircleTypeValue)}>
                <SelectTrigger id="circle-type" className="bg-[#1e293b]/50 border-[#d4a853]/10 text-white focus:border-[#d4a853]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-[#d4a853]/20">
                  {CIRCLE_TYPES.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value} className="text-white focus:bg-[#d4a853]/10 focus:text-white">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#d4a853]" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="circle-desc" className="text-muted-foreground">
                Description <span className="text-muted-foreground/50 text-xs">(optional)</span>
              </Label>
              <Textarea
                id="circle-desc"
                placeholder="What's this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#1e293b]/50 border-[#d4a853]/10 text-white placeholder:text-muted-foreground/50 focus:border-[#d4a853]/30 resize-none"
                rows={3}
                maxLength={500}
              />
            </div>

            {formError && (
              <p className="text-sm text-red-400">{formError}</p>
            )}

            <DialogFooter className="gap-2">
              <GoldenButton
                variant="ghost"
                onClick={() => { setOpen(false); resetForm(); }}
              >
                Cancel
              </GoldenButton>
              <GoldenButton
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                ) : "Create Group"}
              </GoldenButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
