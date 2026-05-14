"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, Clock, CheckCircle2, ArrowRight, Trophy, Calendar,
  LogOut, User, LayoutDashboard, ListChecks, Loader2, AlertCircle, Mail, ShieldAlert, Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";

type View = "dashboard" | "results";

export function CandidatePortal() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/candidate/me");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const candidateName = data?.user?.name || "Candidate";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <CandidateSidebar view={view} setView={setView} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-sm font-semibold">
                  {view === "dashboard" ? "Dashboard" : "Results"}
                </p>
                <p className="text-[10px] text-muted-foreground">Candidate portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <User className="mr-2 h-4 w-4" /> {candidateName}
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-lg">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">
            {view === "dashboard" ? <DashboardView data={data} /> : <ResultsView data={data} />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function CandidateSidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const items: { key: View; title: string; icon: any }[] = [
    { key: "dashboard", title: "Dashboard", icon: LayoutDashboard },
    { key: "results", title: "Results", icon: ListChecks },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link href="/candidate" className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-ai shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Voxa AI</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Candidate
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={view === item.key}
                    tooltip={item.title}
                    onClick={() => setView(item.key)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function DashboardView({ data }: { data: any }) {
  const assignments = data?.candidate?.interviews || [];
  const pending = assignments.filter((i: any) => i.status.toLowerCase() !== "completed" && i.status.toLowerCase() !== "expired");
  const completed = assignments.filter((i: any) => i.status.toLowerCase() === "completed");
  const expired = assignments.filter((i: any) => i.status.toLowerCase() === "expired");
  
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [showEarlyDialog, setShowEarlyDialog] = useState(false);
  const [selectedInterviewTime, setSelectedInterviewTime] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const adminEmail = data?.adminEmail || "admin@fluenthire.com";
  const router = useRouter();

  // Update current time every minute to refresh UI if needed
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartClick = async (item: any) => {
    const scheduledDate = item.date.endsWith('Z') ? item.date : `${item.date.replace(' ', 'T')}Z`;
    const scheduledTime = new Date(scheduledDate);
    const now = new Date();
    
    // Absolute millisecond values
    const nowMs = now.getTime();
    const startMs = scheduledTime.getTime();
    const endMs = startMs + (60 * 60 * 1000); // 1 hour grace period

    const formattedTimeIST = scheduledTime.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (nowMs < startMs) {
      console.log("TIMING: Too early", { nowMs, startMs, diff: startMs - nowMs });
      // 1. Too early
      setSelectedInterviewTime(formattedTimeIST + " IST");
      setShowEarlyDialog(true);
    } else if (nowMs >= startMs && nowMs <= endMs) {
      console.log("TIMING: On time", { nowMs, startMs, endMs });
      // 2. Just right
      router.push(`/interview/${item.interview?.id}`);
    } else {
      console.log("TIMING: Too late", { nowMs, endMs, diff: nowMs - endMs });
      // 3. Too late (Expired)
      try {
        await fetch("/api/interview/expire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId: item.id }),
        });
        setShowExpiredDialog(true);
      } catch (error) {
        console.error("Error updating status to expired:", error);
        setShowExpiredDialog(true);
      }
    }
  };

  const avgScore = completed.length
    ? Math.round(completed.reduce((s: number, r: any) => s + (r.score || 0), 0) / completed.length)
    : 0;

  const candidateFirstName = data?.user?.name?.split(" ")[0] || "there";

  const checkInterviewStatus = (dateStr: string) => {
    // Ensure we parse the date string as UTC (as stored in DB)
    const safeDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`;
    const scheduledTime = new Date(safeDateStr);
    const oneHourAfter = new Date(scheduledTime.getTime() + 60 * 60 * 1000);

    const formattedTimeIST = scheduledTime.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const nowMs = currentTime.getTime();
    const startMs = scheduledTime.getTime();
    const endMs = oneHourAfter.getTime();

    if (nowMs < startMs) {
      return { status: "early", message: `Interview will start at ${formattedTimeIST} IST` };
    } else if (nowMs >= startMs && nowMs <= endMs) {
      return { status: "ontime", message: "" };
    } else {
      return { status: "expired", message: "Interview has expired" };
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-ai/10 p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-ai opacity-20 blur-3xl" />
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ai">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Hi {candidateFirstName} — ready for your next interview?</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          You have {pending.length} pending interview{pending.length === 1 ? "" : "s"}. Current time: {currentTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true })} IST.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Pending" value={String(pending.length)} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completed.length)} />
        <StatCard icon={Trophy} label="Average score" value={avgScore ? `${avgScore}` : "—"} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Scheduled interviews</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map((item: any) => {
            const timing = checkInterviewStatus(item.date);
            const isEarly = timing.status === "early";
            const isExpired = timing.status === "expired" || item.status === "Expired";

            return (
              <Card key={item.id} className={`rounded-2xl border-border/60 shadow-soft transition hover:shadow-elegant ${isExpired ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div>
                    <Badge variant="secondary" className="rounded-full text-[10px]">{item.interview?.category || "General"}</Badge>
                    <CardTitle className="mt-2 text-base">{item.interview?.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{item.interview?.organization?.name || "Acme Corp"}</p>
                  </div>
                  <div className={`grid h-10 w-10 place-items-center rounded-xl text-white ${isExpired ? 'bg-muted text-muted-foreground' : 'bg-gradient-ai'}`}>
                    {isExpired ? <ShieldAlert className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {item.interview?.duration || "20-30"} min</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {item.interview?._count?.questions || 0} questions</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> 
                      {(() => {
                        const d = item.date.endsWith('Z') ? item.date : `${item.date.replace(' ', 'T')}Z`;
                        return new Date(d).toLocaleString('en-US', {
                          timeZone: 'Asia/Kolkata',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                      })()} IST
                    </span>
                  </div>

                  {isExpired ? (
                    <Button 
                      variant="destructive" 
                      className="w-full rounded-xl"
                      onClick={() => handleStartClick(item)}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" /> Interview Expired
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleStartClick(item)}
                      className="w-full rounded-xl bg-gradient-primary text-white shadow-elegant"
                    >
                      Start interview <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {/* Also show explicitly expired assignments */}
          {expired.map((item: any) => (
            <Card key={item.id} className="rounded-2xl border-border/60 shadow-soft transition opacity-60 grayscale-[0.5]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <Badge variant="outline" className="rounded-full text-[10px] border-destructive text-destructive">Expired</Badge>
                  <CardTitle className="mt-2 text-base">{item.interview?.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{item.interview?.organization?.name || "Acme Corp"}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> 
                    Scheduled: {new Date(item.date).toLocaleString('en-US', {
                      timeZone: 'UTC',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })} UTC
                  </span>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xl"
                  onClick={() => handleStartClick(item)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" /> Interview Expired
                </Button>
              </CardContent>
            </Card>
          ))}

          {pending.length === 0 && expired.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending interviews. Nice job!</p>
          )}
        </div>
      </section>

      <Dialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <DialogContent className="rounded-3xl border-border/60 shadow-elegant sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Interview Expired</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your interview is expired due to a late join. Please contact the administrator to reschedule or for further assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Email</p>
                <a href={`mailto:${adminEmail}`} className="block truncate text-sm font-medium text-primary hover:underline">
                  {adminEmail}
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full rounded-2xl" onClick={() => setShowExpiredDialog(false)}>
              Close
            </Button>
            <Button asChild className="w-full rounded-2xl bg-gradient-primary text-white">
              <a href={`mailto:${adminEmail}`}>Contact Admin</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEarlyDialog} onOpenChange={setShowEarlyDialog}>
        <DialogContent className="rounded-3xl border-border/60 shadow-elegant sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ai/10 text-ai">
              <Timer className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Starting Soon</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your interview will start on time at <strong>{selectedInterviewTime} UTC</strong>. You can prepare yourself while you wait!
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <ul className="space-y-3 text-sm">
              {[
                "Ensure your microphone is working",
                "Find a quiet place for the interview",
                "Prepare your background and lighting",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ai" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button className="w-full rounded-2xl bg-gradient-primary text-white shadow-elegant" onClick={() => setShowEarlyDialog(false)}>
              Got it, I'll be ready!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResultsView({ data }: { data: any }) {
  const completed = (data?.candidate?.interviews || []).filter((i: any) => i.status.toLowerCase() === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Past results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your completed interviews and scores.
        </p>
      </div>
      <Card className="rounded-2xl border-border/60 shadow-soft">
        <CardContent className="p-0">
          {completed.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">You haven't completed any interviews yet.</p>
          ) : (
            <ul className="divide-y">
              {completed.map((item: any) => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.interview?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()} · {item.interview?.duration} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gradient">{item.score || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">score</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-lg">
                    <Link href={`/candidate/result/${item.id}`}>
                      View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
