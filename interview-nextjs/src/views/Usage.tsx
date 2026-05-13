"use client";

import { Sparkles, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

export function Usage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Usage & plan"
        description="Track interview minutes, AI credits and invoices."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 ai-border rounded-2xl shadow-glow">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge className="rounded-full bg-gradient-ai text-white">Pro</Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Pro plan · $149/mo</h2>
                <p className="mt-1 text-sm text-muted-foreground">Renews on June 1, 2026</p>
              </div>
              <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant">
                <Sparkles className="mr-2 h-4 w-4" /> Upgrade to Scale
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { l: "Interview minutes", v: 8420, max: 12000 },
                { l: "AI credits", v: 2450, max: 4000 },
                { l: "Active seats", v: 8, max: 15 },
              ].map((u) => (
                <div key={u.l} className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{u.l}</p>
                  <p className="mt-1 text-xl font-semibold">{u.v.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">of {u.max.toLocaleString()}</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(u.v / u.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader><CardTitle className="text-base">Plan benefits</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm">
              {["Unlimited interview templates", "AI question generation", "Voice-based interviews", "Detailed AI reports", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-soft">
        <CardHeader><CardTitle className="text-base">Monthly usage</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-3">
            {[40, 55, 48, 70, 62, 84, 92, 78, 88, 95, 70, 82].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-ai" style={{ height: `${v}%` }} />
                <span className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Billing history</CardTitle>
          <Button variant="outline" size="sm" className="rounded-xl"><Download className="mr-2 h-3.5 w-3.5" /> Export</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: "INV-2026-005", d: "May 1, 2026", a: "$149.00", s: "Paid" },
                { n: "INV-2026-004", d: "Apr 1, 2026", a: "$149.00", s: "Paid" },
                { n: "INV-2026-003", d: "Mar 1, 2026", a: "$149.00", s: "Paid" },
              ].map((i) => (
                <tr key={i.n} className="border-t">
                  <td className="px-3 py-3 font-medium">{i.n}</td>
                  <td className="px-3 py-3 text-muted-foreground">{i.d}</td>
                  <td className="px-3 py-3">{i.a}</td>
                  <td className="px-3 py-3"><Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">{i.s}</Badge></td>
                  <td className="px-3 py-3 text-right"><Button variant="ghost" size="sm">View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
