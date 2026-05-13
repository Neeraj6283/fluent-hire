import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const candidate = await (prisma.candidate as any).findUnique({
      where: {
        id,
        organizationId: authUser.organizationId,
      },
      include: {
        interviews: {
          include: {
            interview: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Get candidate detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
