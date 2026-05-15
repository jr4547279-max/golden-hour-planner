import { useState } from "react";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, Plus, Loader2, Heart, Briefcase, Star, Sparkles, Users2 } from "lucide-react";
import { useLocation } from "wouter";

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
    <div className="min-h-screen bg-[#0a0a1a] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="text-blue-300 hover:text-white hover:bg-blue-900/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Your Circles</h1>
              <p className="text-blue-200/50">Groups you plan with</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-none shadow-lg shadow-blue-900/40">
                <Plus className="h-4 w-4" />
                Create Circle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#11112b] border-blue-900/50 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Create a Circle</DialogTitle>
                <DialogDescription className="text-blue-200/50">
                  Name your group and choose a type to get started.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-5 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="circle-name" className="text-blue-100/70">Circle Name</Label>
                  <Input
                    id="circle-name"
                    placeholder="e.g. Work Lunch Crew"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circle-type" className="text-blue-100/70">Circle Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as CircleTypeValue)}>
                    <SelectTrigger id="circle-type" className="bg-blue-950/30 border-blue-900/50 text-white focus:border-amber-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#11112b] border-blue-900/50">
                      {CIRCLE_TYPES.map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value} className="text-white focus:bg-blue-900/40 focus:text-white">
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-400" />
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circle-desc" className="text-blue-100/70">
                    Description <span className="text-blue-400/40 text-xs">(optional)</span>
                  </Label>
                  <Textarea
                    id="circle-desc"
                    placeholder="What's this circle for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-blue-950/30 border-blue-900/50 text-white placeholder:text-blue-400/30 focus:border-amber-500/50 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-400">{formError}</p>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setOpen(false); resetForm(); }}
                    className="text-blue-300 hover:text-white hover:bg-blue-900/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-none"
                  >
                    {createMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
                    ) : "Create Circle"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Circle list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
          </div>
        ) : circles && circles.length > 0 ? (
          <div className="space-y-3">
            {circles.map((circle) => (
              <button
                key={circle.id}
                onClick={() => setLocation(`/circles/${circle.id}`)}
                className="w-full text-left"
              >
                <Card className="border-blue-900/40 bg-[#11112b]/70 hover:bg-[#11112b] hover:border-blue-700/60 transition-all cursor-pointer group">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-800/50 transition-colors">
                      <TypeIcon type={circle.type} className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white truncate">{circle.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadgeColor(circle.type)}`}>
                          {typeLabel(circle.type)}
                        </span>
                      </div>
                      {circle.description && (
                        <p className="text-sm text-blue-200/50 truncate mt-0.5">{circle.description}</p>
                      )}
                    </div>
                    <ArrowLeft className="h-4 w-4 text-blue-400/40 rotate-180 flex-shrink-0 group-hover:text-blue-300 transition-colors" />
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-blue-900/40 bg-[#11112b]/40">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="rounded-full bg-blue-900/30 p-5">
                <Users className="h-10 w-10 text-blue-400/60" />
              </div>
              <div>
                <CardTitle className="text-white mb-1">No circles yet</CardTitle>
                <CardDescription className="text-blue-200/40 max-w-xs">
                  Create a circle and invite friends to start finding Golden Windows together.
                </CardDescription>
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-none mt-2"
              >
                <Plus className="h-4 w-4" />
                Create your first circle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* How circles work */}
        {(!circles || circles.length === 0) && !isLoading && (
          <Card className="border-blue-900/30 bg-[#11112b]/40">
            <CardHeader>
              <CardTitle className="text-base text-white">How circles work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-200/50">
              <p>1. Create a circle and give it a name (e.g. "Work Lunch Crew").</p>
              <p>2. Invite your friends via email.</p>
              <p>3. Everyone connects their calendar and syncs availability.</p>
              <p>4. Nexus finds the Golden Window — the time that works for everyone.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
