"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, FileText, Sparkles,
  ShieldCheck, Target, Lightbulb, TrendingUp, Star, MessageSquare,
  CalendarDays, Send, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { candidateRows } from "@/data/candidates";

const statusStyle: Record<string, string> = {
  Invited: "bg-info/15 text-info",
  "In Progress": "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Expired: "bg-destructive/15 text-destructive",
};

export function CandidateDetail() {
  const params = useParams();
  const id = params?.id as string;
  const c = candidateRows.find((r) => r.id === id);

  if (!c) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-semibold">Candidate not found</h1>
        <p className="mt-2 text-muted-foreground">They may have been removed.</p>
        <Button asChild className="mt-6 rounded-xl"><Link href="/candidates">Back to candidates</Link></Button>
      </div>
    );
  }

  const ratings = c.answers.map((a) => a.rating ?? 0).filter((r) => r > 0);
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : "—";
  const score = c.score ?? 0;

  const tier =
    score >= 80 ? { label: "Excellent", tone: "text-success" }
    : score >= 60 ? { label: "Promising", tone: "text-warning" }
    : score > 0 ? { label: "Needs work", tone: "text-destructive" }
    : { label: "Pending", tone: "text-muted-foreground" };

  const recommendation =
    score >= 80 ? "Advance to next round"
    : score >= 60 ? "Consider for next round"
    : score > 0 ? "Not a fit at this time"
    : "Awaiting interview completion";

  const strengths = [
    "Clear, structured communication",
    "Solid grasp of fundamentals",
    score >= 70 ? "Strong technical reasoning" : "Stayed composed under pressure",
  ];
  const improvements = [
    "Add concrete metrics & trade-offs",
    "Deepen system-level thinking",
    "Tie answers back to business impact",
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="rounded-lg -ml-2">
        <Link href="/candidates"><ArrowLeft className="mr-1 h-4 w-4" /> Back to candidates</Link>
      </Button>

      <PageHeader
        eyebrow="Candidate"
        title={c.name}
        description={c.role}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`rounded-full ${statusStyle[c.status]} hover:${statusStyle[c.status]}`}>{c.status}</Badge>
            <Button size="sm" variant="outline" className="rounded-xl"><Send className="mr-2 h-4 w-4" /> Message</Button>
            <Button size="sm" className="rounded-xl bg-gradient-primary text-white shadow-elegant"><CalendarDays className="mr-2 h-4 w-4" /> Schedule</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-primary text-lg text-white">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{c.name}</h2>
                <p className="text-sm text-muted-foreground">{c.role}</p>
              </div>
              {c.score != null && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-3xl font-semibold tracking-tight">{c.score}</p>
                </div>
              )}
            </div>
            <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {c.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {c.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {c.location}</div>
              <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> {c.interview}</div>
            </div>
          </Card>

          {c.score != null && c.answers.length > 0 && (
            <Card className="ai-border rounded-2xl shadow-glow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-ai text-white"><Sparkles className="h-4 w-4" /></span>
                    <CardTitle className="text-base">AI overview & feedback</CardTitle>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[10px]">Voxa AI · v1</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-relaxed">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat icon={Star} label="Avg rating" value={`${avgRating}/10`} />
                  <Stat icon={MessageSquare} label="Answers" value={`${c.answers.length}`} />
                  <Stat icon={TrendingUp} label="Tier" value={tier.label} valueClass={tier.tone} />
                </div>

                <p>
                  Across {c.answers.length} questions, {c.name.split(" ")[0]} demonstrated{" "}
                  <span className="font-medium">{tier.label.toLowerCase()}</span> performance with an average answer rating of{" "}
                  <span className="font-medium">{avgRating}/10</span>.
                  {score >= 80 && " Responses were precise, well-structured, and showed depth in technical reasoning."}
                  {score < 80 && score >= 60 && " Communication was clear with solid fundamentals; system-level thinking has room to grow."}
                  {score < 60 && score > 0 && " Foundational knowledge is present, but responses lacked depth in key areas."}
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <FeedbackBlock icon={ShieldCheck} title="Strengths" tone="success" items={strengths} />
                  <FeedbackBlock icon={Target} title="Areas to improve" tone="warning" items={improvements} />
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skill breakdown</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SkillBar label="Technical depth" value={Math.min(100, score + 4)} />
                    <SkillBar label="Communication" value={Math.min(100, score + 8)} />
                    <SkillBar label="Problem solving" value={Math.max(0, score - 2)} />
                    <SkillBar label="Clarity" value={Math.min(100, score + 2)} />
                  </div>
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
          )}

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold">Interview answers</h3>
            {c.answers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No answers yet — interview not completed.</p>
            ) : (
              <ol className="space-y-4">
                {c.answers.map((a, i) => (
                  <li key={i} className="rounded-xl border border-border/60 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">Q{i + 1}. {a.question}</p>
                      {a.rating != null && (
                        <Badge variant="secondary" className="rounded-full">{a.rating}/10</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.answer}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Interview</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Template</dt><dd>{c.interview}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Scheduled</dt><dd>{c.date}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{c.status}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Score</dt><dd>{c.score ?? "—"}</dd></div>
            </dl>
          </Card>

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resume</h3>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
              <FileText className="h-5 w-5 text-ai" />
              <div className="flex-1 truncate text-sm">{c.resume}</div>
              <Button size="sm" variant="outline" className="rounded-lg"><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
            </div>
          </Card>

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Internal notes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.notes}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, valueClass }: { icon: any; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/60 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold ${valueClass ?? ""}`}>{value}</p>
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
