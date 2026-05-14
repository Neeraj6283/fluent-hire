"use client";

import { Sparkles, Check, Download, Loader2, BrainCircuit, Cpu, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

export function Usage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Filters
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Temp states for inputs
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [page, startDate, endDate]);

  const fetchUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      
      const res = await fetch(`/api/dashboard/usage?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch usage data");
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
  };

  const handleClearFilter = () => {
    setTempStartDate("");
    setTempEndDate("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExport = () => {
    if (!stats?.allForExport) return;
    
    setIsExporting(true);
    try {
      const headers = ["Date", "Project", "Type", "Calls", "Input Tokens", "Output Tokens", "Total Tokens"];
      const csvData = stats.allForExport.map((row: any) => [
        row.date,
        row.title,
        row.type,
        row.calls,
        row.input,
        row.output,
        row.total
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((e: any) => e.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `ai-usage-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const INPUT_RATE = Number(process.env.NEXT_PUBLIC_INPUT_TOKEN_RATE) || 0.15 / 1000000;
  const OUTPUT_RATE = Number(process.env.NEXT_PUBLIC_OUTPUT_TOKEN_RATE) || 0.60 / 1000000;

  const calculateCost = (input: number, output: number) => {
    return (input * INPUT_RATE) + (output * OUTPUT_RATE);
  };

  const usageKpis = [
    { 
      l: "Input Tokens", 
      v: stats?.totals?.input ?? 0, 
      cost: (stats?.totals?.input ?? 0) * INPUT_RATE,
      icon: BrainCircuit,
      desc: "$0.15 per 1M tokens"
    },
    { 
      l: "Output Tokens", 
      v: stats?.totals?.output ?? 0, 
      cost: (stats?.totals?.output ?? 0) * OUTPUT_RATE,
      icon: Sparkles,
      desc: "$0.60 per 1M tokens"
    },
    { 
      l: "Total Consumption", 
      v: stats?.totals?.tokens ?? 0, 
      cost: calculateCost(stats?.totals?.input ?? 0, stats?.totals?.output ?? 0),
      icon: Cpu,
      desc: "Sum of input & output"
    },
    { 
      l: "Total GPT Calls", 
      v: stats?.totals?.calls ?? 0, 
      icon: BrainCircuit,
      desc: "API requests made"
    },
    { 
      l: "Today's Usage", 
      v: stats?.totals?.today?.total ?? 0, 
      cost: calculateCost(stats?.totals?.today?.input ?? 0, stats?.totals?.today?.output ?? 0),
      icon: Sparkles,
      desc: "Since midnight"
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Usage & AI Tracking"
        description="Track GPT calls, token usage per project, and AI costs."
      />

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <Info className="h-4 w-4" />
          {error}
          <Button variant="outline" size="sm" className="ml-auto h-7 text-[10px]" onClick={fetchUsage}>Retry</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {usageKpis.map((u) => (
          <Card key={u.l} className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-ai/10 text-ai">
                  <u.icon className="h-4 w-4" />
                </div>
                {u.cost !== undefined && (
                  <Badge variant="outline" className="text-[10px] font-mono border-ai/20 text-ai">
                    ${u.cost.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{u.l}</p>
                <h3 className="text-xl font-bold mt-1 tracking-tight">
                  {isLoading || !hasMounted ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                  ) : (
                    u.v.toLocaleString()
                  )}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  {u.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Monthly Token Consumption</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Daily breakdown of input and output tokens</p>
            </div>
            
            {/* Legend/Summary matching the image style */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Tokens</span>
                  <span className="text-lg font-bold">{(stats?.totals?.tokens ?? 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Input</span>
                  <span className="text-lg font-bold">{(stats?.totals?.input ?? 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Output</span>
                  <span className="text-lg font-bold">{(stats?.totals?.output ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2">
          <div className="h-[240px] w-full relative">
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ai/40" />
              </div>
            ) : !stats?.chart || stats.chart.length === 0 || stats.totals.tokens === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed">
                <BrainCircuit className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No usage data for this period</p>
                <p className="text-[10px]">Try selecting a different date range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.chart || []}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    interval={stats?.chart?.length > 15 ? 2 : 0}
                  />
                  <YAxis hide />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-3 border border-border/60 rounded-xl shadow-xl">
                            <p className="text-[10px] font-bold mb-2 text-slate-500 uppercase tracking-widest border-b pb-1">
                              {payload[0].payload.label}
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                  <span className="text-[10px] text-slate-600 font-medium">Input Tokens</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-indigo-600">{(payload[0].value as number).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                  <span className="text-[10px] text-slate-600 font-medium">Output Tokens</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-purple-600">{(payload[1].value as number).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-6 pt-1.5 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400 font-medium">Total Consumption</span>
                                <span className="text-xs font-mono font-bold text-slate-900">{(payload[0].payload.total as number).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="input" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorInput)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="output" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOutput)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-soft">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Project-wise AI Usage</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Detailed breakdown of tokens and calls per interview template</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 mr-2">
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={tempStartDate} 
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="h-9 w-[140px] pl-8 text-xs rounded-xl"
                />
              </div>
              <span className="text-muted-foreground text-xs">to</span>
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={tempEndDate} 
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="h-9 w-[140px] pl-8 text-xs rounded-xl"
                />
              </div>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleApplyFilter}
                className="h-9 rounded-xl px-4 text-xs bg-ai hover:bg-ai/90"
              >
                Filter
              </Button>
              {(startDate || endDate || tempStartDate || tempEndDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilter}
                  className="h-8 px-2 text-[10px]"
                >
                  Clear
                </Button>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl"
              onClick={handleExport}
              disabled={isExporting || !stats?.allForExport?.length}
            >
              {isExporting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Interview Project</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium text-center">Calls</th>
                  <th className="px-3 py-3 text-right">Input</th>
                  <th className="px-3 py-3 text-right">Output</th>
                  <th className="px-3 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="border-t animate-pulse">
                      <td colSpan={7} className="px-3 py-6 h-12 bg-muted/20" />
                    </tr>
                  ))
                ) : (
                  (stats?.projectUsage || []).map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {hasMounted ? format(new Date(p.date + 'T00:00:00'), 'MMM dd, yyyy') : p.date}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-ai" />
                          <span className="font-medium">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {(p.type || 'unknown').replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-center text-muted-foreground font-mono">{hasMounted ? (p.calls || 0).toLocaleString() : p.calls}</td>
                      <td className="px-3 py-4 text-right text-muted-foreground font-mono">{hasMounted ? (p.input || 0).toLocaleString() : p.input}</td>
                      <td className="px-3 py-4 text-right text-muted-foreground font-mono">{hasMounted ? (p.output || 0).toLocaleString() : p.output}</td>
                      <td className="px-3 py-4 text-right">
                        <Badge variant="secondary" className="rounded-full font-mono text-ai bg-ai/10">
                          {hasMounted ? (p.total || 0).toLocaleString() : p.total}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && (!stats?.projectUsage || stats.projectUsage.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground italic">
                      No AI usage data recorded for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {stats?.pagination && stats.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, stats.pagination.total)} of {stats.pagination.total} records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs font-medium">
                  Page {page} of {stats.pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setPage(p => Math.min(stats.pagination.totalPages, p + 1))}
                  disabled={page === stats.pagination.totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
