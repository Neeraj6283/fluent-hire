import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Mic, Clock, Layers, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
import { interviewRows } from "@/data/interviews";

const diffColor: Record<string, string> = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Hard: "bg-destructive/15 text-destructive",
};

export function InterviewDetail() {
  const { id } = useParams({ from: "/_app/interviews/$id" });
  const interview = interviewRows.find((r) => r.id === id);

  if (!interview) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-semibold">Interview not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been deleted.</p>
        <Button asChild className="mt-6 rounded-xl"><Link to="/interviews">Back to interviews</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="rounded-lg -ml-2">
        <Link to="/interviews"><ArrowLeft className="mr-1 h-4 w-4" /> Back to interviews</Link>
      </Button>

      <PageHeader
        eyebrow="Interview"
        title={interview.title}
        description={interview.description}
        actions={
          <>
            <Badge variant="secondary" className={`rounded-full ${diffColor[interview.difficulty]}`}>{interview.difficulty}</Badge>
            {interview.status === "Published" ? (
              <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">● Published</Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full">○ Draft</Badge>
            )}
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { l: "Category", v: interview.category, i: Layers },
          { l: "Duration", v: interview.duration, i: Clock },
          { l: "Questions", v: String(interview.count), i: FileText },
          { l: "Candidates", v: String(interview.takers.length), i: Users },
        ].map((s) => (
          <Card key={s.l} className="rounded-2xl border-border/60 p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.i className="h-3.5 w-3.5" /> {s.l}
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight">{s.v}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Mic className="h-4 w-4 text-ai" />
              <h2 className="text-lg font-semibold">Questions ({interview.questions.length})</h2>
            </div>
            <ol className="space-y-4">
              {interview.questions.map((q, i) => (
                <li key={i} className="rounded-xl border border-border/60 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-muted text-xs font-semibold">{i + 1}</span>
                    <Badge variant="secondary" className="rounded-full">{q.skill}</Badge>
                    <Badge variant="secondary" className={`rounded-full ${diffColor[q.difficulty]}`}>{q.difficulty}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{q.question}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-ai" />
              <h2 className="text-lg font-semibold">Candidates who took this interview</h2>
            </div>
            {interview.takers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No candidates yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Candidate</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interview.takers.map((t) => (
                      <tr key={t.email} className="border-t">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-primary text-xs text-white">
                                {t.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{t.name}</p>
                              <p className="text-xs text-muted-foreground">{t.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{t.status}</td>
                        <td className="px-3 py-3 text-muted-foreground">{t.date}</td>
                        <td className="px-3 py-3">{t.score ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills covered</h3>
            <div className="flex flex-wrap gap-2">
              {interview.skills.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>{interview.date}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Difficulty</dt><dd>{interview.difficulty}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{interview.status}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Duration</dt><dd>{interview.duration}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
