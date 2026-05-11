import { Download, Share2, Sparkles, ThumbsUp, MessageSquare, Brain, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";

export function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="AI evaluation reports and performance analytics."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
            <Button variant="outline" className="rounded-xl"><Download className="mr-2 h-4 w-4" /> PDF</Button>
          </>
        }
      />

      <Card className="rounded-2xl border-border/60 p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {["Date range", "Interview", "Candidate", "Difficulty", "Score range"].map((f) => (
            <Select key={f}>
              <SelectTrigger className="h-9 w-40 rounded-xl"><SelectValue placeholder={f} /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem></SelectContent>
            </Select>
          ))}
          <Button variant="ghost" className="h-9 rounded-xl text-muted-foreground"><Filter className="mr-2 h-4 w-4" /> Reset</Button>
        </div>
      </Card>

      {/* Featured report */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 ai-border rounded-2xl shadow-glow">
          <CardContent className="p-6 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mira Khan · Senior Backend</p>
            <ScoreCircle value={88} />
            <Badge className="mt-3 rounded-full bg-success/15 text-success hover:bg-success/15">
              <ThumbsUp className="mr-1 h-3 w-3" /> Recommend to hire
            </Badge>
            <div className="mt-6 grid grid-cols-3 gap-2 text-left">
              {[
                { l: "Technical", v: 91 },
                { l: "Communication", v: 84 },
                { l: "Confidence", v: 88 },
              ].map((m) => (
                <div key={m.l}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</p>
                  <p className="text-lg font-semibold">{m.v}</p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${m.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border-border/60 shadow-soft">
          <CardHeader className="flex-row items-center gap-2">
            <Brain className="h-4 w-4 text-ai" />
            <CardTitle className="text-base">AI evaluation breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                q: "Walk me through how you'd design a rate limiter for a Node.js API.",
                t: "Discussed sliding-window log algorithm with Redis sorted sets. Compared with token bucket. Explained eviction strategy and edge cases for distributed deployments.",
                fb: "Strong systems thinking. Mentioned production-grade trade-offs unprompted.",
                score: 92,
              },
              {
                q: "Index strategy for 50M-row PostgreSQL table.",
                t: "Proposed composite B-tree on (status, created_at) and partial index. Briefly touched BRIN.",
                fb: "Solid baseline. Could expand on covering indexes and query planner stats.",
                score: 84,
              },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">Q{i + 1}. {r.q}</p>
                  <Badge variant="secondary" className="rounded-full">{r.score}</Badge>
                </div>
                <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  <MessageSquare className="mr-1 inline h-3 w-3" /> {r.t}
                </div>
                <div className="mt-2 rounded-lg border border-ai/30 bg-ai/5 p-3 text-xs">
                  <Sparkles className="mr-1 inline h-3 w-3 text-ai" />
                  <span className="font-medium text-ai">AI feedback:</span>{" "}
                  <span className="text-foreground/80">{r.fb}</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-ai" style={{ width: `${r.score}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader><CardTitle className="text-base">Performance comparison</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Aiko Sato", score: 92 },
                { name: "Mira Khan", score: 88 },
                { name: "Nora Park", score: 76 },
                { name: "Lin Yang", score: 71 },
                { name: "Tariq Ahmed", score: 64 },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-28 truncate text-sm">{c.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${c.score}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm font-medium">{c.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader><CardTitle className="text-base">Top candidates this month</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {["Aiko Sato — 92", "Mira Khan — 88", "Jordan Riv. — 86", "Sasha Ono — 84"].map((t, i) => (
                <li key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-ai text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </span>
                  <Badge variant="secondary" className="rounded-full text-success bg-success/15">Hire</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreCircle({ value }: { value: number }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto mt-2 h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="sc" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.22 255)" />
            <stop offset="100%" stopColor="oklch(0.65 0.24 305)" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(0.92 0.012 270)" strokeWidth="12" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="url(#sc)" strokeWidth="12"
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div>
          <p className="text-4xl font-semibold tracking-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground">overall score</p>
        </div>
      </div>
    </div>
  );
}
