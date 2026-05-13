import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fallback for organizationId if not in token
    let orgId = (user as any).organizationId;
    if (!orgId) {
      const dbUser = await (prisma.user as any).findUnique({
        where: { id: (user as any).userId },
        select: { organizationId: true }
      });
      orgId = (dbUser as any)?.organizationId || null;
    }

    const interviews = await (prisma.interview as any).findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ interviews });
  } catch (error: any) {
    console.error("Failed to fetch interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fallback for organizationId if not in token
    let orgId = (user as any).organizationId;
    if (!orgId) {
      const dbUser = await (prisma.user as any).findUnique({
        where: { id: (user as any).userId },
        select: { organizationId: true }
      });
      orgId = (dbUser as any)?.organizationId || null;
    }

    const { title, category, difficulty, duration, status, questions } = await request.json();

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const interview = await (prisma.interview as any).create({
      data: {
        title,
        category,
        difficulty,
        duration: String(duration),
        status, // "Public" or "Draft"
        userId: (user as any).userId,
        organizationId: orgId,
        questions: {
          create: questions.map((q: any) => ({
            skill: q.skill,
            question: q.text,
            difficulty: difficulty,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    // Log Activity
    await logActivity(orgId, (user as any).userId, "interview_created", `Created new interview: ${title}`);

    return NextResponse.json({ interview });
  } catch (error: any) {
    console.error("Failed to create interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create interview" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "ID and status are required" }, { status: 400 });

    const interview = await (prisma.interview as any).update({
      where: { id },
      data: { status }
    });

    // Log Activity
    let orgId = (user as any).organizationId;
    if (!orgId) {
      const dbUser = await (prisma.user as any).findUnique({
        where: { id: (user as any).userId },
        select: { organizationId: true }
      });
      orgId = (dbUser as any)?.organizationId || null;
    }
    
    await logActivity(orgId, (user as any).userId, "interview_published", `Published interview: ${interview.title}`);

    return NextResponse.json(interview);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}
