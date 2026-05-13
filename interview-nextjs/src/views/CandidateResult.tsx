"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Sparkles, Trophy, CheckCircle2, MessageSquare, Star,
  TrendingUp, ShieldCheck, Target, Lightbulb, Share2, Download,
  LogOut, User, LayoutDashboard, ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { completedResults } from "@/data/candidatePortal";

type StoredResult = {
  id: string;
  interviewId: string;
  title: string;
  date: string;
  score: number;
  duration: string;
  answers: { question: string; answer: string; rating: number }[];
};

function loadStored(id: string): StoredResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`voxa-result-${id}`);
    return raw ? (JSON.parse(raw) as StoredResult) : null;
  } catch {
    return null;
  }
}

export function CandidateResult() {
  const params = useParams();
  const id = params?.id as string;
  const stored = loadStored(id);
  const result = stored ?? completedResults.find((r) => r.id === id);

  if (!result) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Result not found</h1>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/candidate">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const avgRating = result.answers.length
    ? (result.answers.reduce((s, a) => s + a.rating, 0) / result.answers.length).toFixed(1)
    : "—";

  const tier =
    result.score >= 80 ? { label: "Excellent", tone: "text-success" }
    : result.score >= 60 ? { label: "Promising", tone: "text-warning" }
    : { label: "Needs work", tone: "text-destructive" };

  const recommendation =
    result.score >= 80 ? "Advance to next round"
    : result.score >= 60 ? "Consider for next round"
    : "Not a fit at this time";

  const strengths = [
    "Clear, structured communication",
    "Solid grasp of fundamentals",
    result.score >= 70 ? "Strong technical reasoning" : "Stayed composed under pressure",
  ];
  const improvements = [
    "Add concrete metrics & trade-offs",
    "Deepen system-level thinking",
    "Tie answers back to business impact",
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ResultSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link href="/candidate"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link>
              </Button>
              <Badge variant="secondary" className="rounded-full">Interview report</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <User className="mr-2 h-4 w-4" /> Mira Khan
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <Link href="/"><LogOut className="mr-2 h-4 w-4" /> Sign out</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 space-y-8 px-6 py-10">
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-subtle p-8 md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gradient-ai opacity-25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div>
              <Badge className="rounded-full bg-gradient-ai text-white shadow-glow">
                <Sparkles className="mr-1 h-3 w-3" /> Interview complete
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{result.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{result.date} · {result.duration} · {result.answers.length} questions</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="rounded-xl"><Share2 className="mr-2 h-4 w-4" /> Share report</Button>
                <Button size="sm" variant="outline" className="rounded-xl"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <ScoreRing score={result.score} />
              <div className="space-y-3">
                <MiniStat icon={Star} label="Avg rating" value={`${avgRating}/10`} />
                <MiniStat icon={MessageSquare} label="Answers" value={`${result.answers.length}`} />
                <MiniStat icon={Trophy} label="Tier" value={tier.label} valueClass={tier.tone} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="ai-border rounded-2xl shadow-glow lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-ai text-white"><Sparkles className="h-4 w-4" /></span>
                  <CardTitle className="text-base">AI overview</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">Voxa AI · v1</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-relaxed">
              <p>
                Across {result.answers.length} questions, the candidate demonstrated{" "}
                <span className="font-medium">{tier.label.toLowerCase()}</span> performance with an average answer rating of{" "}
                <span className="font-medium">{avgRating}/10</span>.
                {result.score >= 80 && " Responses were precise, well-structured, and showed depth in technical reasoning."}
                {result.score < 80 && result.score >= 60 && " Communication was clear with solid fundamentals; system-level thinking has room to grow."}
                {result.score < 60 && " Foundational knowledge is present, but the responses lacked depth and specificity in key areas."}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <FeedbackBlock icon={ShieldCheck} title="Strengths" tone="success" items={strengths} />
                <FeedbackBlock icon={Target} title="Areas to improve" tone="warning" items={improvements} />
              </div>
              <Separator />
              <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4">
                <Lightbulb className="mt-0.5 h-5 w-5 text-ai" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommendation</p>
                  <p className="mt-0.5 text-sm font-semibold">{recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-ai" />
                <CardTitle className="text-base">Skill breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillBar label="Technical depth" value={Math.min(100, result.score + 4)} />
              <SkillBar label="Communication" value={Math.min(100, result.score + 8)} />
              <SkillBar label="Problem solving" value={Math.max(0, result.score - 2)} />
              <SkillBar label="Clarity" value={Math.min(100, result.score + 2)} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Questions & answers</h2>
          {result.answers.map((a, i) => (
            <Card key={i} className="rounded-2xl border-border/60 shadow-soft">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 rounded-full">Q{i + 1}</Badge>
                    <p className="font-medium">{a.question}</p>
                  </div>
                  <Badge className="rounded-full bg-gradient-ai text-white">
                    <Star className="mr-1 h-3 w-3" /> {a.rating}/10
                  </Badge>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your answer</p>
                  <p className="mt-1 text-sm leading-relaxed">{a.answer || <span className="italic text-muted-foreground">No answer recorded</span>}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="flex justify-center pt-4">
          <Button asChild className="rounded-xl bg-gradient-primary text-white shadow-elegant">
            <Link href="/candidate"><CheckCircle2 className="mr-2 h-4 w-4" /> Back to dashboard</Link>
          </Button>
        </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ResultSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/candidate">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Results">
                  <Link href="/candidate">
                    <ListChecks className="h-4 w-4" />
                    <span>Results</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function MiniStat({ icon: Icon, label, value, valueClass }: { icon: any; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/70 px-3 py-2 backdrop-blur">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold ${valueClass ?? ""}`}>{value}</p>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg viewBox="0 0 140 140" className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.2 250)" />
            <stop offset="50%" stopColor="oklch(0.6 0.24 300)" />
            <stop offset="100%" stopColor="oklch(0.7 0.2 330)" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</p>
        <p className="text-4xl font-semibold tracking-tight">{score}</p>
        <p className="text-[10px] text-muted-foreground">/ 100</p>
      </div>
    </div>
  );
}

function FeedbackBlock({ icon: Icon, title, tone, items }: { icon: any; title: string; tone: "success" | "warning"; items: string[] }) {
  const toneClass = tone === "success" ? "text-success bg-success/10" : "text-warning bg-warning/10";
  return (
    <div className="rounded-xl border bg-background/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid h-6 w-6 place-items-center rounded-md ${toneClass}`}><Icon className="h-3.5 w-3.5" /></span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current" /> {s}</li>
        ))}
      </ul>
    </div>
  );
}

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
