import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    console.log("API: Fetching interview ID:", id);

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questions: true,
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
