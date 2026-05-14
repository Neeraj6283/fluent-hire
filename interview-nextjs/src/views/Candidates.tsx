"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Mail, Filter, Download, Eye, Trash2, Loader2, ChevronLeft, ChevronRight, FileDown, Calendar, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { generateInterviewPDF, parseTranscript } from "@/lib/pdf-utils";

const statusStyle: Record<string, string> = {
  Invited: "bg-info/15 text-info",
  "In Progress": "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Expired: "bg-destructive/15 text-destructive",
};

const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export function Candidates() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [resendTarget, setResendTarget] = useState<any>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:30");
  const [newEmail, setNewEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [candidateStats, setCandidateStats] = useState<any>({
    Invited: 0,
    'In Progress': 0,
    Completed: 0,
    Expired: 0
  });

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.total);
        if (data.stats) {
          setCandidateStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    
    try {
      const res = await fetch(`/api/candidates?id=${pendingDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== pendingDelete));
        toast.success("Assignment removed successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete assignment");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setPendingDelete(null);
    }
  };

  const handleResend = async () => {
    if (!resendTarget) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/candidates/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: resendTarget.candidate.id,
          email: newEmail
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Invitation resent successfully");
        setResendTarget(null);
        fetchCandidates(); // Refresh list to show updated email
      } else {
        toast.error(data.error || "Failed to resend invitation");
      }
    } catch (error) {
      toast.error("An error occurred while resending");
    } finally {
      setIsResending(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      toast.error("Please select a date and time slot");
      return;
    }

    setIsRescheduling(true);
    try {
      const res = await fetch("/api/candidates/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: rescheduleTarget.id,
          date: rescheduleDate,
          timeSlot: rescheduleTime
        }),
      });

      if (res.ok) {
        toast.success("Interview rescheduled successfully");
        setRescheduleTarget(null);
        fetchCandidates();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reschedule interview");
      }
    } catch (error) {
      toast.error("An error occurred while rescheduling");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/candidates?export=true");
      if (!res.ok) throw new Error("Failed to fetch candidates for export");
      
      const { assignments: allAssignments } = await res.json();
      
      const headers = ["Candidate Name", "Email", "Interview", "Status", "Scheduled", "Score", "Location", "Phone", "LinkedIn URL"];
      const baseUrl = window.location.origin;
      
      const csvData = allAssignments.map((a: any) => [
        `"${a.candidate.name}"`,
        `"${a.candidate.email}"`,
        `"${a.interview.title}"`,
        `"${a.status}"`,
        `"${new Date(a.date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}"`,
        `"${a.score || ""}"`,
        `"${a.candidate.location || ""}"`,
        `"${a.candidate.phone || ""}"`,
        `"${a.candidate.linkedinUrl || ""}"`
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((e: any) => e.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `interviews-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Interviews exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export interviews");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadReport = (candidate: any, assignment: any) => {
    if (!assignment) return;

    let parsedFeedback = null;
    try {
      parsedFeedback = assignment.feedback ? JSON.parse(assignment.feedback) : null;
    } catch (e) {
      console.error("Error parsing feedback:", e);
      parsedFeedback = { summary: assignment.feedback };
    }

    const transcript = Array.isArray(assignment.transcript) ? assignment.transcript : [];
    const qas = parseTranscript(transcript);

    generateInterviewPDF({
      userName: candidate.name,
      title: assignment.interview.title,
      date: new Date(assignment.updatedAt).toLocaleDateString(),
      duration: (assignment.interview.duration || "0") + "m",
      score: assignment.score || 0,
      feedback: parsedFeedback?.summary || assignment.feedback || "",
      strengths: parsedFeedback?.strengths || ["N/A"],
      improvements: parsedFeedback?.improvements || ["N/A"],
      qas
    });

    // Log activity
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PDF_DOWNLOAD",
        description: `Downloaded interview report for ${candidate.name} - ${assignment.interview.title}`
      })
    }).catch(err => console.error("Failed to log activity:", err));
  };

  const filteredAssignments = assignments.filter((a) => 
    a.candidate.name.toLowerCase().includes(search.toLowerCase()) ||
    a.candidate.email.toLowerCase().includes(search.toLowerCase()) ||
    a.interview.title.toLowerCase().includes(search.toLowerCase())
  );

  const target = assignments.find((a) => a.id === pendingDelete);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Candidates"
        description="Invite, track and evaluate candidates across interviews."
        actions={
          <>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export
            </Button>
            <Button asChild className="rounded-xl bg-gradient-primary text-white shadow-elegant">
              <Link href="/candidates/new"><Plus className="mr-2 h-4 w-4" /> Invite candidate</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Invited", v: candidateStats.Invited, c: "bg-info" },
          { l: "In Progress", v: candidateStats['In Progress'], c: "bg-warning" },
          { l: "Completed", v: candidateStats.Completed, c: "bg-success" },
          { l: "Expired", v: candidateStats.Expired, c: "bg-destructive" },
        ].map((s) => (
          <Card key={s.l} className="rounded-2xl border-border/60 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${s.c}`} />
              <span className="text-xs text-muted-foreground">{s.l}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{s.v}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/60 p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              className="h-9 rounded-xl pl-9" 
              placeholder="Search candidates…" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-9 rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2"><Checkbox /></th>
                  <th className="px-3 py-2 font-medium">Candidate</th>
                  <th className="px-3 py-2 font-medium">Interview</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Scheduled</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => {
                  const c = a.candidate;
                  const displayStatus = a.status;
                  const displayScore = a.score;
                  
                  return (
                    <tr key={a.id} className="border-t transition hover:bg-muted/40">
                      <td className="px-3 py-3"><Checkbox /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gradient-primary text-xs text-white">
                              {c.name.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">
                              {c.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {a.interview?.title || "No interview template"}
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={`rounded-full ${statusStyle[displayStatus] || "bg-muted text-muted-foreground"} hover:${statusStyle[displayStatus]}`}>
                          {displayStatus}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <span className="whitespace-nowrap">
                          {new Date(a.date).toLocaleString('en-US', {
                            timeZone: 'Asia/Kolkata',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })} IST
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {displayScore != null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${displayScore}%` }} />
                            </div>
                            <span className="text-sm font-medium">{displayScore}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {displayStatus === "Draft" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setResendTarget(a);
                                setNewEmail(c.email);
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem asChild>
                                <Link href={`/candidates/${c.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View details
                                </Link>
                              </DropdownMenuItem>
                              {displayStatus === "Completed" && (
                                <DropdownMenuItem onSelect={() => handleDownloadReport(c, a)}>
                                  <FileDown className="mr-2 h-4 w-4" /> Download Report
                                </DropdownMenuItem>
                              )}
                              {displayStatus === "Expired" && (
                                <DropdownMenuItem onSelect={() => {
                                  setRescheduleTarget(a);
                                  // Default to tomorrow
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  setRescheduleDate(tomorrow.toISOString().split('T')[0]);
                                }}>
                                  <RefreshCw className="mr-2 h-4 w-4" /> Reschedule
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => { e.preventDefault(); setPendingDelete(a.id); }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!isLoading && filteredAssignments.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No interviews found matching your search.
            </div>
          )}
        </div>

        {!isLoading && filteredAssignments.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * limit, totalRecords)}
              </span>{" "}
              of <span className="font-medium">{totalRecords}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 rounded-xl p-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              {target ? `${target.name} (${target.email}) will be removed along with their interview record. This action cannot be undone.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!resendTarget} onOpenChange={(o) => !o && setResendTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send Interview Invitation</DialogTitle>
            <DialogDescription>
              Confirm or update the email address to send the interview invitation to {resendTarget?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="email" className="mb-2 block text-sm font-medium">
              Candidate Email
            </Label>
            <Input 
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setResendTarget(null)}>
              Cancel
            </Button>
            <Button 
              className="rounded-xl bg-gradient-primary text-white" 
              onClick={handleResend}
              disabled={isResending || !newEmail.trim()}
            >
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rescheduleTarget} onOpenChange={(o) => !o && setRescheduleTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>
              Select a new date and time for {rescheduleTarget?.name}'s interview.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> New Date
              </Label>
              <Input 
                type="date"
                value={rescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> New Time Slot (IST)
              </Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRescheduleTarget(null)}>
              Cancel
            </Button>
            <Button 
              className="rounded-xl bg-gradient-primary text-white" 
              onClick={handleReschedule}
              disabled={isRescheduling || !rescheduleDate}
            >
              {isRescheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Reschedule & Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
