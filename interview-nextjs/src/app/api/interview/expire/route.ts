import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const assignment = await (prisma.interviewAssignment as any).findUnique({
      where: { id: assignmentId },
      select: { candidateId: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await prisma.$transaction([
      (prisma.interviewAssignment as any).update({
        where: { id: assignmentId },
        data: { status: "Expired" }
      }),
      (prisma.candidate as any).update({
        where: { id: assignment.candidateId },
        data: { status: "Expired" }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Interview Expire Error:", error);
    return NextResponse.json({ error: "Failed to update status to expired" }, { status: 500 });
  }
}
