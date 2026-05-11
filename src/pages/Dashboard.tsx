import { Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

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
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back, Jordan"
        description="Here's what's happening across your interview pipeline today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <PlayCircle className="mr-2 h-4 w-4" /> Tour
            </Button>
            <Button asChild className="rounded-xl bg-gradient-primary text-white shadow-elegant">
              <Link to="/interviews/new">
                <Plus className="mr-2 h-4 w-4" /> New interview
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="group relative overflow-hidden rounded-2xl border-border/60 shadow-soft transition hover:shadow-elegant">
            <div className="absolute inset-0 -z-10 bg-gradient-glow opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <k.icon className="h-4 w-4" />
                </div>
                <Badge variant="secondary" className="gap-1 rounded-full text-[10px] font-medium text-success">
                  <TrendingUp className="h-3 w-3" /> {k.delta}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{k.value}</p>
              </div>
              <div className="mt-3"><Sparkline data={k.spark} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Interview activity</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <div className="flex gap-1.5 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Started</span>
              <span className="ml-3 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ai" />Completed</span>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityChart />
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
              <Link to="/interviews/new">
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
              <Link to="/candidates/new">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Create candidate
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
            <Donut value={71} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Score distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {[34, 52, 78, 96, 88, 72, 48, 30].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-ai"
                    style={{ height: `${v}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{i * 10}+</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { who: "Mira K.", what: "completed Senior Backend", when: "2m ago", color: "bg-success" },
                { who: "Tariq A.", what: "started QA Automation", when: "12m ago", color: "bg-info" },
                { who: "Lin Y.", what: "invited to Frontend Mid", when: "1h ago", color: "bg-primary" },
                { who: "Nora P.", what: "report ready", when: "3h ago", color: "bg-ai" },
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${a.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{a.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityChart() {
  const a = [12, 18, 14, 22, 19, 26, 30, 28, 34, 31, 38, 42, 39, 45];
  const b = [6, 10, 9, 14, 12, 18, 22, 20, 26, 24, 29, 33, 30, 36];
  const max = Math.max(...a);
  const toPath = (data: number[]) =>
    data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 90}`).join(" ");

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
