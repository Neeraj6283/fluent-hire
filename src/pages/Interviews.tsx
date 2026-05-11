import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal, Mic, Filter, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/PageHeader";
import { interviewRows } from "@/data/interviews";
import { toast } from "sonner";

const diffColor = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Hard: "bg-destructive/15 text-destructive",
} as const;

export function Interviews() {
  const [rows, setRows] = useState(interviewRows);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const target = rows.find((r) => r.id === pendingDelete);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setRows((r) => r.filter((x) => x.id !== pendingDelete));
    toast.success(`Deleted "${target?.title}"`);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Interviews"
        description="Create, edit and publish AI-powered interview templates."
        actions={
          <Button asChild className="rounded-xl bg-gradient-primary text-white shadow-elegant">
            <Link to="/interviews/new">
              <Plus className="mr-2 h-4 w-4" /> New interview
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl border-border/60 p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-9 rounded-xl pl-9" placeholder="Search interviews…" />
          </div>
          <Select>
            <SelectTrigger className="h-9 w-36 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="tester">Tester</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-9 w-36 rounded-xl"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9 rounded-xl">
            <Filter className="mr-2 h-4 w-4" /> More filters
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2"><Checkbox /></th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Difficulty</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Questions</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t transition hover:bg-muted/40">
                  <td className="px-3 py-3"><Checkbox /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-ai text-white">
                        <Mic className="h-4 w-4" />
                      </div>
                      <div>
                        <Link to="/interviews/$id" params={{ id: r.id }} className="font-medium hover:underline">
                          {r.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">~ {r.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{r.category}</td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary" className={`rounded-full ${diffColor[r.difficulty as keyof typeof diffColor]}`}>{r.difficulty}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    {r.status === "Published" ? (
                      <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">● Published</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full">○ Draft</Badge>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{r.count}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-3 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link to="/interviews/$id" params={{ id: r.id }}>
                            <Eye className="mr-2 h-4 w-4" /> View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => { e.preventDefault(); setPendingDelete(r.id); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <AlertDialogTitle>Delete interview?</AlertDialogTitle>
            <AlertDialogDescription>
              {target ? `"${target.title}" will be permanently removed along with its questions. This action cannot be undone.` : ""}
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
