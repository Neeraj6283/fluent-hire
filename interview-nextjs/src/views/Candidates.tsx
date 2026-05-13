"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Mail, Filter, Download, Eye, Trash2, Loader2 } from "lucide-react";
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
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  Invited: "bg-info/15 text-info",
  "In Progress": "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Expired: "bg-destructive/15 text-destructive",
};

export function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [resendTarget, setResendTarget] = useState<any>(null);
  const [newEmail, setNewEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
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
        setCandidates((prev) => prev.filter((c) => c.id !== pendingDelete));
        toast.success("Candidate removed successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete candidate");
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
          id: resendTarget.id,
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

  const filteredCandidates = candidates.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    invited: candidates.filter(c => c.status === "Invited").length,
    inProgress: candidates.filter(c => c.status === "In Progress").length,
    completed: candidates.filter(c => c.status === "Completed").length,
    expired: candidates.filter(c => c.status === "Expired").length,
  };

  const target = candidates.find((c) => c.id === pendingDelete);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Candidates"
        description="Invite, track and evaluate candidates across interviews."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button asChild className="rounded-xl bg-gradient-primary text-white shadow-elegant">
              <Link href="/candidates/new"><Plus className="mr-2 h-4 w-4" /> Invite candidate</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Invited", v: stats.invited, c: "bg-info" },
          { l: "In Progress", v: stats.inProgress, c: "bg-warning" },
          { l: "Completed", v: stats.completed, c: "bg-success" },
          { l: "Expired", v: stats.expired, c: "bg-destructive" },
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
                {filteredCandidates.map((c) => {
                  const latestInterview = c.interviews?.[0];
                  const displayStatus = latestInterview?.status || c.status;
                  const displayScore = latestInterview?.score ?? c.score;
                  
                  return (
                    <tr key={c.id} className="border-t transition hover:bg-muted/40">
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
                        {latestInterview?.interview?.title || "No interview assigned"}
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={`rounded-full ${statusStyle[displayStatus] || "bg-muted text-muted-foreground"} hover:${statusStyle[displayStatus]}`}>
                          {displayStatus}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
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
                                setResendTarget(c);
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => { e.preventDefault(); setPendingDelete(c.id); }}
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
          {!isLoading && filteredCandidates.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No candidates found matching your search.
            </div>
          )}
        </div>
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
    </div>
  );
}
