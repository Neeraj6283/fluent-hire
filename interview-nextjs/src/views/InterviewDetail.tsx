"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mic, Clock, Layers, Users, FileText, Loader2, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  Invited: "bg-info/15 text-info",
  "In Progress": "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Expired: "bg-destructive/15 text-destructive",
};

const diffColor: Record<string, string> = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Hard: "bg-destructive/15 text-destructive",
};

type Question = {
  id: string;
  skill: string;
  question: string;
  difficulty: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type Assignment = {
  id: string;
  candidate: Candidate;
  status: string;
  score: number | null;
  createdAt: string;
};

type Interview = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: string;
  duration: string;
  description?: string;
  createdAt: string;
  questions: Question[];
  assignments: Assignment[];
  _count: {
    assignments: number;
  };
};

export function InterviewDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInterviewDetail();
    }
  }, [id]);

  const fetchInterviewDetail = async () => {
    setLoading(true);
    try {
      console.log("Fetching interview with ID:", id);
      const response = await fetch(`/api/interviews/${id}`);
      const data = await response.json();
      console.log("API Response:", data);
      if (response.ok) {
        setInterview(data.interview);
      } else {
        console.error("API Error:", data.error);
        toast.error(data.error || "Failed to load interview details");
      }
    } catch (error) {
      console.error("Fetch Catch Error:", error);
      toast.error("An error occurred while loading interview details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-semibold">Interview not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been deleted.</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/interviews">Back to interviews</Link>
        </Button>
      </div>
    );
  }

  // Group questions by skill for the sidebar display if needed, 
  // but the UI shows them as a list. We can extract unique skills.
  const uniqueSkills = Array.from(new Set(interview.questions.map(q => q.skill)));

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="rounded-lg -ml-2 text-muted-foreground hover:text-foreground">
        <Link href="/interviews">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to interviews
        </Link>
      </Button>

      <PageHeader
        eyebrow="INTERVIEW"
        title={interview.title}
        description={interview.description || "Deep technical interview for candidates focused on " + uniqueSkills.join(", ") + "."}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`rounded-full px-3 ${diffColor[interview.difficulty] || ""}`}>
              {interview.difficulty}
            </Badge>
            {interview.status === "Public" || interview.status === "Published" ? (
              <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15 px-3">
                ● Published
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full px-3">
                ○ Draft
              </Badge>
            )}
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { l: "Category", v: interview.category, i: Layers },
          { l: "Duration", v: `${interview.duration} min`, i: Clock },
          { l: "Questions", v: String(interview.questions.length), i: FileText },
          { l: "Candidates", v: String(interview._count.assignments), i: Users },
        ].map((s) => (
          <Card key={s.l} className="rounded-2xl border-border/60 p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <s.i className="h-3.5 w-3.5" /> {s.l}
            </div>
            <p className="mt-2.5 text-2xl font-bold tracking-tight">{s.v}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-2">
              <Mic className="h-4 w-4 text-ai" />
              <h2 className="text-lg font-semibold tracking-tight">Questions ({interview.questions.length})</h2>
            </div>
            <div className="space-y-4">
              {interview.questions.map((q, i) => (
                <div key={q.id} className="rounded-2xl border border-border/60 p-5 transition hover:border-primary/30">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                      {q.skill}
                    </Badge>
                    <Badge variant="secondary" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${diffColor[q.difficulty] || ""}`}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="text-[15px] leading-relaxed font-medium">{q.question}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-ai" />
                <h2 className="text-lg font-semibold tracking-tight">Candidates ({interview.assignments.length})</h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-xs">
                <Link href="/candidates">View all</Link>
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              {interview.assignments.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-4 font-semibold">Candidate</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Date</th>
                      <th className="pb-4 font-semibold">Score</th>
                      <th className="pb-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {interview.assignments.map((assignment) => (
                      <tr key={assignment.id} className="group transition hover:bg-muted/30">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border/50">
                              <AvatarFallback className="bg-gradient-primary text-[11px] font-bold text-white uppercase">
                                {assignment.candidate.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{assignment.candidate.name}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{assignment.candidate.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge className={`rounded-full px-2 py-0 text-[10px] font-medium shadow-none border-none ${statusStyle[assignment.status] || "bg-muted text-muted-foreground"}`}>
                            {assignment.status}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-xs font-medium text-muted-foreground">
                          {new Date(assignment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-4 pr-4">
                          {assignment.score !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{assignment.score}</span>
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/60">
                                <div 
                                  className="h-full bg-gradient-primary rounded-full" 
                                  style={{ width: `${assignment.score}%` }} 
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-muted-foreground/60">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 transition group-hover:opacity-100">
                            <Link href={`/candidates/${assignment.candidate.id}?assignmentId=${assignment.id}`}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rounded-2xl border border-dashed py-12 text-center">
                  <p className="text-sm text-muted-foreground font-medium">No candidates have been invited yet.</p>
                  <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
                    <Link href="/candidates/new">Invite a candidate</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Skills Covered</h3>
             <div className="flex flex-wrap gap-2">
               {uniqueSkills.map(skill => (
                 <Badge key={skill} variant="secondary" className="rounded-lg px-3 py-1.5 text-xs font-medium bg-muted/50">
                   {skill}
                 </Badge>
               ))}
             </div>
          </Card>

          <Card className="rounded-2xl border-border/60 p-6 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Created</span>
                <span className="font-semibold text-foreground">
                  {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Difficulty</span>
                <span className="font-semibold text-foreground">{interview.difficulty}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="font-semibold text-foreground">{interview.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Duration</span>
                <span className="font-semibold text-foreground">{interview.duration} min</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
