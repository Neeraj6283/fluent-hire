import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check, ArrowLeft, ArrowRight, Sparkles, Plus, Trash2, RefreshCw,
  FileText, Wand2, GripVertical, Clock, Minus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";

const steps = [
  { id: 1, label: "Setup", icon: FileText },
  { id: 2, label: "AI Questions", icon: Sparkles },
  { id: 3, label: "Review", icon: Check },
];

const skillsByCat: Record<string, string[]> = {
  Backend: ["Node.js", "Python", "PHP", "Java", "Go", "Ruby", "PostgreSQL", "Redis", "Microservices"],
  Frontend: ["React", "TypeScript", "Next.js", "CSS", "Tailwind", "Vue", "State mgmt"],
  Tester: ["Selenium", "Cypress", "Playwright", "JMeter", "API testing"],
};

const difficulties = [
  { id: "easy", label: "Easy", desc: "Foundational concepts", color: "from-emerald-500 to-teal-500" },
  { id: "medium", label: "Medium", desc: "Applied problem solving", color: "from-amber-500 to-orange-500" },
  { id: "hard", label: "Hard", desc: "Senior / system design", color: "from-rose-500 to-pink-500" },
];

type SkillEntry = { name: string; count: number };
type GeneratedQuestion = { id: number; skill: string; type: string; text: string };

const SAMPLE_BANK: Record<string, { type: string; text: string }[]> = {
  "Node.js": [
    { type: "Technical", text: "Walk me through how you'd design a rate limiter for a Node.js API serving 100k req/min." },
    { type: "Technical", text: "Explain the Node.js event loop and how a long synchronous task affects it." },
    { type: "Scenario", text: "A Node service is leaking memory in production — describe your debugging approach." },
    { type: "Technical", text: "How would you implement graceful shutdown for an Express server behind a load balancer?" },
  ],
  "PostgreSQL": [
    { type: "Technical", text: "Describe an indexing strategy for a 50M-row table queried by composite filters." },
    { type: "Technical", text: "Compare optimistic vs pessimistic locking — when would you reach for each?" },
    { type: "Scenario", text: "Queries are suddenly 10x slower after a release. How do you diagnose it?" },
    { type: "Technical", text: "Explain MVCC and how VACUUM affects performance." },
  ],
  "React": [
    { type: "Technical", text: "Explain the difference between useMemo, useCallback, and React.memo." },
    { type: "Scenario", text: "A list of 10k rows is janky. Walk me through how you'd optimise it." },
    { type: "Technical", text: "How does React's reconciliation handle keys in dynamic lists?" },
  ],
  "TypeScript": [
    { type: "Technical", text: "Explain conditional types with a real example you've shipped." },
    { type: "Technical", text: "When would you use `unknown` vs `any` vs a generic constraint?" },
  ],
};

const DEFAULT_QS = [
  { type: "Behavioral", text: "Tell me about a time you disagreed with a senior engineer. How did you resolve it?" },
  { type: "Scenario", text: "Walk me through your approach to onboarding into a new codebase." },
  { type: "Technical", text: "Describe a recent technical decision and the trade-offs you weighed." },
];

function buildQuestions(skills: SkillEntry[]): GeneratedQuestion[] {
  let id = 1;
  const out: GeneratedQuestion[] = [];
  for (const s of skills) {
    const bank = SAMPLE_BANK[s.name] ?? DEFAULT_QS;
    for (let i = 0; i < s.count; i++) {
      const q = bank[i % bank.length];
      out.push({ id: id++, skill: s.name, type: q.type, text: q.text });
    }
  }
  return out;
}

export function CreateInterview() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("Senior Backend Engineer");
  const [category, setCategory] = useState("Backend");
  const [diff, setDiff] = useState("medium");
  const [duration, setDuration] = useState([30]);
  const [skills, setSkills] = useState<SkillEntry[]>([
    { name: "Node.js", count: 3 },
    { name: "PostgreSQL", count: 2 },
  ]);
  const [customSkill, setCustomSkill] = useState("");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);

  const totalCount = useMemo(
    () => skills.reduce((sum, s) => sum + s.count, 0),
    [skills],
  );

  const toggleSkill = (name: string) => {
    setSkills((prev) =>
      prev.find((s) => s.name === name)
        ? prev.filter((s) => s.name !== name)
        : [...prev, { name, count: 2 }],
    );
  };

  const updateCount = (name: string, delta: number) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.name === name ? { ...s, count: Math.max(1, Math.min(15, s.count + delta)) } : s,
      ),
    );
  };

  const addCustom = () => {
    const n = customSkill.trim();
    if (!n || skills.find((s) => s.name === n)) return;
    setSkills([...skills, { name: n, count: 2 }]);
    setCustomSkill("");
  };

  const generate = () => {
    setGenerating(true);
    setQuestions([]);
    setTimeout(() => {
      setQuestions(buildQuestions(skills));
      setGenerating(false);
    }, 1400);
  };

  const goToQuestions = () => {
    setStep(2);
    if (!questions.length) generate();
  };

  const canContinue = skills.length > 0 && totalCount > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="New interview"
        title="Build an AI interview"
        description="Three quick steps. Our AI does the heavy lifting."
      />

      {/* Stepper */}
      <div className="flex items-center justify-between rounded-2xl border bg-card p-2 shadow-soft">
        {steps.map((s, i) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                onClick={() => setStep(s.id)}
                className={`group flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  active ? "bg-accent" : "hover:bg-muted/60"
                }`}
              >
                <div
                  className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition ${
                    done
                      ? "bg-success text-white"
                      : active
                      ? "bg-gradient-primary text-white shadow-elegant"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {s.id}</p>
                  <p className="text-sm font-medium">{s.label}</p>
                </div>
              </button>
              {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Setup (details + skills + per-skill counts) */}
      {step === 1 && (
        <Card className="rounded-2xl shadow-soft">
          <CardContent className="space-y-7 p-6 md:p-8">
            <div className="grid gap-2">
              <Label>Interview title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 rounded-xl"
                placeholder="e.g. Senior Backend Engineer"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Backend">Backend</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="Tester">Tester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label>Duration</Label>
                  <span className="text-sm font-medium">{duration[0]} min</span>
                </div>
                <Slider value={duration} onValueChange={setDuration} min={10} max={90} step={5} />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Difficulty</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {difficulties.map((d) => {
                  const active = diff === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDiff(d.id)}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                        active ? "border-primary shadow-elegant" : "hover:border-primary/40"
                      }`}
                    >
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition group-hover:opacity-10 ${d.color} ${active ? "opacity-15" : ""}`} />
                      <p className="font-semibold">{d.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{d.desc}</p>
                      {active && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Skills</Label>
                <span className="text-xs text-muted-foreground">
                  Pick skills for <span className="font-medium text-foreground">{category}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(skillsByCat[category] || []).map((s) => {
                  const sel = !!skills.find((x) => x.name === s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSkill(s)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        sel
                          ? "border-transparent bg-gradient-primary text-white shadow-elegant"
                          : "hover:border-primary/40 hover:bg-muted/60"
                      }`}
                    >
                      {sel && <Check className="mr-1 inline h-3 w-3" />} {s}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                  className="h-9 rounded-xl"
                  placeholder="Add a custom skill and press Enter"
                />
                <Button variant="outline" className="rounded-xl" onClick={addCustom}>
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            </div>

            {/* Per-skill question count */}
            {skills.length > 0 && (
              <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Questions per skill</p>
                  <Badge variant="secondary" className="rounded-full">
                    {totalCount} total {totalCount === 1 ? "question" : "questions"}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {skills.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-ai text-[10px] font-semibold text-white">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate text-sm font-medium">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-md"
                          onClick={() => updateCount(s.name, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="grid h-7 w-9 place-items-center rounded-md border bg-muted/40 text-xs font-semibold">
                          {s.count}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-md"
                          onClick={() => updateCount(s.name, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-7 w-7 rounded-md text-muted-foreground hover:text-destructive"
                          onClick={() => toggleSkill(s.name)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium">Publish immediately</p>
                <p className="text-xs text-muted-foreground">Otherwise saved as draft</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Questions */}
      {step === 2 && (
        <Card className="ai-border rounded-2xl shadow-glow">
          <CardContent className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-ai text-white animate-pulse-glow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI question generation</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCount} questions across {skills.length} {skills.length === 1 ? "skill" : "skills"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={generate} disabled={generating}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} /> Regenerate all
                </Button>
              </div>
            </div>

            {generating && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ai opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ai" />
                  </span>
                  Crafting questions for {skills.map((s) => s.name).join(", ")}…
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {!generating && skills.map((s) => {
              const items = questions.filter((q) => q.skill === s.name);
              if (!items.length) return null;
              return (
                <div key={s.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-ai" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.name}
                    </p>
                    <span className="text-xs text-muted-foreground">· {items.length} questions</span>
                  </div>
                  {items.map((q, idx) => (
                    <div key={q.id} className="group flex gap-3 rounded-xl border p-4 transition hover:border-primary/40 animate-fade-up">
                      <div className="flex flex-col items-center gap-2 pt-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4 cursor-grab" />
                        <span className="text-xs font-medium">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <Badge
                          variant="secondary"
                          className={`mb-2 rounded-full text-[10px] ${
                            q.type === "Technical" ? "bg-info/15 text-info" :
                            q.type === "Behavioral" ? "bg-ai/15 text-ai" :
                            "bg-warning/15 text-warning"
                          }`}
                        >
                          {q.type}
                        </Badge>
                        <Textarea
                          defaultValue={q.text}
                          rows={2}
                          className="min-h-[44px] resize-y rounded-lg border-border/70 bg-background p-3 text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/40"
                        />
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setQuestions((prev) => prev.filter((p) => p.id !== q.id))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {!generating && questions.length === 0 && (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-ai text-white shadow-glow">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium">Ready when you are</p>
                <p className="mt-1 text-xs text-muted-foreground">Click Regenerate to draft questions with AI.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review (full details) */}
      {step === 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 rounded-2xl shadow-soft">
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Interview</p>
                <h3 className="mt-1 text-lg font-semibold">{title || "Untitled interview"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {category} · {diff} · {totalCount} questions · {duration[0]} min
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills breakdown
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {skills.map((s) => (
                    <div key={s.name} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                      <span className="font-medium">{s.name}</span>
                      <Badge variant="secondary" className="rounded-full text-[10px]">
                        {s.count} {s.count === 1 ? "question" : "questions"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  All questions ({questions.length})
                </p>
                <div className="space-y-2">
                  {questions.length === 0 && (
                    <p className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
                      No questions yet — go back to step 2 to generate them.
                    </p>
                  )}
                  {questions.map((q, i) => (
                    <div key={q.id} className="rounded-lg border p-3 text-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                        <Badge variant="secondary" className="rounded-full text-[10px]">{q.skill}</Badge>
                        <Badge
                          variant="secondary"
                          className={`rounded-full text-[10px] ${
                            q.type === "Technical" ? "bg-info/15 text-info" :
                            q.type === "Behavioral" ? "bg-ai/15 text-ai" :
                            "bg-warning/15 text-warning"
                          }`}
                        >
                          {q.type}
                        </Badge>
                      </div>
                      {q.text}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-soft">
            <CardContent className="space-y-3 p-6">
              <h3 className="font-semibold">Summary</h3>
              <Stat label="Title" value={title || "—"} />
              <Stat label="Category" value={category} />
              <Stat label="Difficulty" value={diff} />
              <Stat label="Skills" value={`${skills.length} selected`} />
              <Stat label="Questions" value={String(totalCount)} />
              <Stat label="Est. time" value={`${duration[0]} min`} icon={<Clock className="h-3.5 w-3.5" />} />
              <Button className="mt-4 w-full rounded-xl bg-gradient-primary text-white shadow-elegant">
                <Check className="mr-2 h-4 w-4" /> Publish interview
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link to="/interviews">Save as draft</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="rounded-xl" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-xs text-muted-foreground">Step {step} of {steps.length}</p>
        {step < 3 ? (
          <Button
            className="rounded-xl bg-gradient-primary text-white"
            onClick={() => (step === 1 ? goToQuestions() : setStep(step + 1))}
            disabled={step === 1 && !canContinue}
          >
            {step === 1 ? (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> Generate questions
              </>
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button asChild className="rounded-xl bg-gradient-primary text-white">
            <Link to="/interviews">Finish</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium capitalize">{icon}{value}</span>
    </div>
  );
}

