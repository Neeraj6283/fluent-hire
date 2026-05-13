import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
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

    const params = await context.params;
    const { id } = params;
    console.log("API: Fetching interview ID:", id);

    const interview = await (prisma.interview as any).findFirst({
      where: { 
        id,
        organizationId: orgId
      },
      include: {
        questions: true,
        assignments: {
          include: {
            candidate: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ interview });
  } catch (error: any) {
    console.error("Failed to fetch interview detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview detail" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
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

    const params = await context.params;
    const { id } = params;

    const interview = await (prisma.interview as any).findFirst({
      where: { 
        id,
        organizationId: orgId
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    await prisma.interview.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete interview:", error);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 }
    );
  }
}
