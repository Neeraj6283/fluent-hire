"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, Mail, Filter, Download, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PageHeader } from "@/components/PageHeader";
import { candidateRows } from "@/data/candidates";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  Invited: "bg-info/15 text-info",
  "In Progress": "bg-warning/15 text-warning",
  Completed: "bg-success/15 text-success",
  Expired: "bg-destructive/15 text-destructive",
};

export function Candidates() {
  const [rows, setRows] = useState(candidateRows);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const target = rows.find((r) => r.id === pendingDelete);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setRows((r) => r.filter((x) => x.id !== pendingDelete));
    toast.success(`Removed ${target?.name}`);
    setPendingDelete(null);
  };

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
          { l: "Invited", v: "48", c: "bg-info" },
          { l: "In Progress", v: "12", c: "bg-warning" },
          { l: "Completed", v: "286", c: "bg-success" },
          { l: "Expired", v: "9", c: "bg-destructive" },
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
            <Input className="h-9 rounded-xl pl-9" placeholder="Search candidates…" />
          </div>
          <Button variant="outline" className="h-9 rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
        </div>

        <div className="mt-4 overflow-x-auto">
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
              {rows.map((c) => (
                <tr key={c.id} className="border-t transition hover:bg-muted/40">
                  <td className="px-3 py-3"><Checkbox /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-primary text-xs text-white">
                          {c.name.split(" ").map((n) => n[0]).join("")}
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
                  <td className="px-3 py-3 text-muted-foreground">{c.interview}</td>
                  <td className="px-3 py-3">
                    <Badge className={`rounded-full ${statusStyle[c.status]} hover:${statusStyle[c.status]}`}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-3 py-3">
                    {c.score != null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${c.score}%` }} />
                        </div>
                        <span className="text-sm font-medium">{c.score}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
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
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
