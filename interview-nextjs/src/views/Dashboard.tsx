"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Mic,
  Users,
  CheckCircle2,
  Gauge,
  Sparkles,
  TrendingUp,
  Plus,
  PlayCircle,
  UserPlus,
  Zap,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";

const kpis = [
  { label: "Total Interviews", value: "1,284", delta: "+12.4%", icon: Mic, spark: [4, 8, 6, 10, 7, 12, 14] },
  { label: "Active Candidates", value: "342", delta: "+5.1%", icon: Users, spark: [6, 7, 5, 9, 11, 10, 13] },
  { label: "Completed", value: "918", delta: "+18.2%", icon: CheckCircle2, spark: [3, 5, 7, 6, 9, 12, 15] },
  { label: "Average Score", value: "82.4", delta: "+2.3", icon: Gauge, spark: [8, 7, 9, 8, 10, 11, 12] },
];

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${30 - (v / max) * 28}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.22 285)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.65 0.22 285)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="oklch(0.55 0.22 275)"
        strokeWidth="1.5"
        strokeLinecap="round"
        points={points}
      />
      <polygon fill="url(#sg)" points={`0,30 ${points} 100,30`} />
    </svg>
  );
}

export function Dashboard() {
  const [userName, setUserName] = useState("Jordan");
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("voxa_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.name) {
        setUserName(user.name.split(" ")[0]);
      }
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardKpis = [
    { label: "Total Interviews", value: stats?.kpis?.totalInterviews ?? "0", icon: Mic },
    { label: "Total Candidates", value: stats?.kpis?.totalCandidates ?? "0", icon: Users },
    { label: "Completed", value: stats?.kpis?.completedInterviews ?? "0", icon: CheckCircle2 },
    { label: "Average Score", value: stats?.kpis?.averageScore ?? "0.0", icon: Gauge },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${userName}`}
        description="Here's what's happening across your interview pipeline today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <PlayCircle className="mr-2 h-4 w-4" /> Tour
            </Button>
            <Button asChild className="rounded-xl bg-gradient-primary text-white shadow-elegant">
              <Link href="/interviews/new">
                <Plus className="mr-2 h-4 w-4" /> New interview
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((k) => (
          <Card key={k.label} className="group relative overflow-hidden rounded-2xl border-border/60 shadow-soft transition hover:shadow-elegant">
            <div className="absolute inset-0 -z-10 bg-gradient-glow opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin opacity-20" /> : k.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Interview activity</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <div className="flex gap-1.5 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Started</span>
              <span className="ml-3 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ai" />Completed</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-56 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <ActivityChart data={stats?.chart} />
            )}
          </CardContent>
        </Card>

        <Card className="ai-border rounded-2xl shadow-glow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-ai" />
              <CardTitle className="text-base">Quick options</CardTitle>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Jump straight into common actions.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              className="h-12 w-full justify-between rounded-xl bg-gradient-primary text-white shadow-elegant"
            >
              <Link href="/interviews/new">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create interview
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full justify-between rounded-xl"
            >
              <Link href="/candidates/new">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Invite candidate
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Tip</p>
              <p className="mt-1 text-sm">
                Create an interview first, then invite candidates to it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Completion rate</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-8">
            {isLoading ? (
              <div className="h-44 w-44 rounded-full border-4 border-muted animate-pulse" />
            ) : (
              <Donut value={stats?.completionRate ?? 0} />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-32 w-32 rotate-[-90deg]">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * (stats?.completionRate ?? 0)) / 100} className="text-ai transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-2xl font-bold">{stats?.completionRate ?? 0}%</span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Candidates completed the journey</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-full bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : (
              <ul className="space-y-3">
                {(stats?.recentActivity || []).map((a: any, i: number) => {
                  const typeColors: Record<string, string> = {
                    interview_completed: 'bg-success',
                    interview_created: 'bg-ai',
                    candidate_created: 'bg-primary',
                    interview_scheduled: 'bg-info',
                    interview_updated: 'bg-warning',
                    interview_deleted: 'bg-destructive',
                    candidate_deleted: 'bg-destructive',
                    interview_published: 'bg-success',
                  };
                  
                  // Helper to format time relative to now (simple version)
                  const formatTime = (date: Date) => {
                    const now = new Date();
                    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
                    if (diff < 60) return `${diff}s ago`;
                    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                    return new Date(date).toLocaleDateString();
                  };

                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeColors[a.type] || 'bg-primary'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-tight">
                          <span className="font-semibold text-foreground">{a.user?.name || "System"}</span>{" "}
                          <span className="text-muted-foreground">{a.description}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{formatTime(a.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No recent activity found. Try creating an interview or inviting a candidate.</p>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityChart({ data }: { data: any }) {
  const a = data?.started || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const b = data?.completed || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...a, ...b, 5);
  const toPath = (points: number[]) =>
    points.map((v, i) => `${(i / (points.length - 1)) * 100},${100 - (v / max) * 90}`).join(" ");

  return (
    <svg viewBox="0 0 100 110" className="h-56 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.22 275)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 275)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bg2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.24 295)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.65 0.24 295)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80].map((y) => (
        <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="oklch(0.85 0.01 270)" strokeWidth="0.2" strokeDasharray="0.5 1" />
      ))}
      <polygon fill="url(#ag)" points={`0,100 ${toPath(a)} 100,100`} />
      <polyline fill="none" stroke="oklch(0.55 0.22 275)" strokeWidth="1.2" points={toPath(a)} />
      <polygon fill="url(#bg2)" points={`0,100 ${toPath(b)} 100,100`} />
      <polyline fill="none" stroke="oklch(0.65 0.24 295)" strokeWidth="1.2" points={toPath(b)} />
    </svg>
  );
}

function Donut({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="dg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.22 255)" />
            <stop offset="100%" stopColor="oklch(0.65 0.24 305)" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={r} fill="none" stroke="oklch(0.92 0.012 270)" strokeWidth="14" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke="url(#dg)" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-3xl font-semibold tracking-tight">{value}%</p>
          <p className="text-[11px] text-muted-foreground">completion</p>
        </div>
      </div>
    </div>
  );
}
