import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { subDays, startOfDay, endOfDay, format, startOfMonth } from "date-fns";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = authUser.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    // 1. KPI Stats
    const totalInterviews = await (prisma.interview as any).count({ where: { organizationId: orgId } });
    const totalCandidates = await (prisma.candidate as any).count({ where: { organizationId: orgId } });
    const completedAssignments = await (prisma.interviewAssignment as any).count({
      where: {
        candidate: { organizationId: orgId },
        status: "Completed",
      },
    });

    const averageScoreResult = await (prisma.interviewAssignment as any).aggregate({
      where: {
        candidate: { organizationId: orgId },
        status: "Completed",
      },
      _avg: {
        score: true,
      },
    });
    const averageScore = averageScoreResult._avg.score?.toFixed(1) || "0.0";

    // 2. Activity Chart (Last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const activityData = await (prisma.interviewAssignment as any).findMany({
      where: {
        candidate: { organizationId: orgId },
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: {
        status: true,
        updatedAt: true,
      },
    });

    // Group by day
    const chartLabels = Array.from({ length: 14 }).map((_, i) => {
      const date = subDays(new Date(), 13 - i);
      return format(date, "MMM dd");
    });

    const completedByDay = new Array(14).fill(0);
    const startedByDay = new Array(14).fill(0);

    activityData.forEach((item: any) => {
      const dayIndex = Math.floor((new Date(item.updatedAt).getTime() - subDays(new Date(), 13).getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 14) {
        if (item.status === "Completed") {
          completedByDay[dayIndex]++;
        } else {
          startedByDay[dayIndex]++;
        }
      }
    });

    // 3. Recent Activity 
    let recentActivities = [];
    try {
      recentActivities = await (prisma as any).activity.findMany({ 
        where: { organizationId: orgId }, 
        include: { user: { select: { name: true } } }, 
        orderBy: { createdAt: "desc" }, 
        take: 5,
      });
    } catch (e) {
      console.error("Error fetching activities, they might not exist in DB yet:", e);
    }

    // 4. Completion Rate
    const totalAssignments = await (prisma.interviewAssignment as any).count({
      where: { candidate: { organizationId: orgId } },
    });
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // 5. Monthly Token Usage
    const currentMonthStart = startOfMonth(new Date());
    const monthlyUsage = await (prisma as any).aIUsage.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: currentMonthStart },
      },
      select: {
        inputTokens: true,
        outputTokens: true,
      },
    });

    const monthlyTokens = monthlyUsage.reduce((acc: any, curr: any) => {
      acc.input += curr.inputTokens;
      acc.output += curr.outputTokens;
      acc.total += (curr.inputTokens + curr.outputTokens);
      return acc;
    }, { input: 0, output: 0, total: 0 });

    return NextResponse.json({
      kpis: {
        totalInterviews,
        totalCandidates,
        completedInterviews: completedAssignments,
        averageScore,
      },
      chart: {
        labels: chartLabels,
        completed: completedByDay,
        started: startedByDay,
      },
      recentActivity: recentActivities,
      completionRate,
      monthlyTokens,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
