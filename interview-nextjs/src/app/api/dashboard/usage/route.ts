import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { subDays, format, startOfDay, parseISO, endOfDay, addDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = authUser.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    // Date filtering
    const dateFilter: any = { organizationId: orgId };
    if (startDateStr || endDateStr) {
      dateFilter.createdAt = {};
      if (startDateStr) dateFilter.createdAt.gte = startOfDay(parseISO(startDateStr));
      if (endDateStr) dateFilter.createdAt.lte = endOfDay(parseISO(endDateStr));
    }

    // 1. Get all usage for the organization with filtering and include interview details
    const allUsage = await (prisma as any).aIUsage.findMany({
      where: dateFilter,
      include: {
        interview: {
          select: {
            title: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group usage by project, type, and DATE for the table
    const groupedUsage = allUsage.reduce((acc: any, curr: any) => {
      const dateKey = format(new Date(curr.createdAt), "yyyy-MM-dd");
      const projectId = curr.interviewId || 'general';
      const projectTitle = curr.interview?.title || 'General AI Usage';
      const key = `${dateKey}-${projectId}-${curr.type}`;

      if (!acc[key]) {
        acc[key] = {
          id: key,
          date: dateKey,
          title: projectTitle,
          type: curr.type,
          input: 0,
          output: 0,
          total: 0,
          calls: 0
        };
      }

      acc[key].input += curr.inputTokens;
      acc[key].output += curr.outputTokens;
      acc[key].total += curr.totalTokens;
      acc[key].calls += 1;

      return acc;
    }, {});

    const sortedUsage = Object.values(groupedUsage).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalRecords = sortedUsage.length;
    const projectUsage = sortedUsage.slice(skip, skip + limit);

    // 2. Get usage for graph (Dynamic range based on filters, fallback to 30 days)
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 29));
    let chartStartDate = thirtyDaysAgo;
    let chartEndDate = endOfDay(new Date());

    if (startDateStr) {
      chartStartDate = startOfDay(parseISO(startDateStr));
      if (endDateStr) {
        const potentialEndDate = endOfDay(parseISO(endDateStr));
        // Only update if end date is actually after start date
        if (potentialEndDate >= chartStartDate) {
          chartEndDate = potentialEndDate;
        } else {
          // If user picked end date before start date, adjust end date to start date
          chartEndDate = endOfDay(chartStartDate);
        }
      }
    }

    const daysToDisplay = Math.max(1, Math.ceil((chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)));

    const dailyUsageData = await (prisma as any).aIUsage.findMany({
      where: {
        organizationId: orgId,
        createdAt: { 
          gte: chartStartDate,
          lte: chartEndDate
        }
      },
      select: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        createdAt: true
      }
    });

    const chartData = Array.from({ length: daysToDisplay }).map((_, i) => {
      const date = addDays(chartStartDate, i);
      // Safety check to not exceed chartEndDate
      if (date > chartEndDate) return null;
      return {
        label: format(date, "MMM dd"),
        day: format(date, "d"),
        input: 0,
        output: 0,
        total: 0,
        fullDate: format(date, "yyyy-MM-dd")
      };
    }).filter((d): d is NonNullable<typeof d> => d !== null);

    dailyUsageData.forEach((usage: any) => {
      const dateKey = format(new Date(usage.createdAt), "yyyy-MM-dd");
      const dayData = chartData.find(d => d.fullDate === dateKey);
      if (dayData) {
        dayData.input += usage.inputTokens;
        dayData.output += usage.outputTokens;
        dayData.total += usage.totalTokens;
      }
    });

    // 3. Totals (based on filtered data)
    const totalInput = sortedUsage.reduce((acc: number, curr: any) => acc + curr.input, 0);
    const totalOutput = sortedUsage.reduce((acc: number, curr: any) => acc + curr.output, 0);
    const totalTokens = sortedUsage.reduce((acc: number, curr: any) => acc + curr.total, 0);
    const totalCalls = sortedUsage.reduce((acc: number, curr: any) => acc + curr.calls, 0);

    // 4. Today's Usage
    const startOfToday = startOfDay(new Date());
    const todayUsage = await (prisma as any).aIUsage.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: startOfToday }
      },
      select: { 
        inputTokens: true,
        outputTokens: true,
        totalTokens: true 
      }
    });
    
    const todayStats = todayUsage.reduce((acc: any, curr: any) => {
      acc.input += curr.inputTokens;
      acc.output += curr.outputTokens;
      acc.total += curr.totalTokens;
      return acc;
    }, { input: 0, output: 0, total: 0 });

    return NextResponse.json({
      projectUsage,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit)
      },
      chart: chartData,
      totals: {
        input: totalInput,
        output: totalOutput,
        tokens: totalTokens,
        calls: totalCalls,
        today: todayStats
      },
      allForExport: sortedUsage // Return all filtered data for CSV export
    });
  } catch (error) {
    console.error("Usage Stats Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
