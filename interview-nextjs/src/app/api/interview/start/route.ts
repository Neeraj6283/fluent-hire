import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  try {
    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the interview assignment status to "In Progress"
      const assignment = await (tx.interviewAssignment as any).update({
        where: { id: assignmentId },
        data: {
          status: "In Progress",
        },
        include: {
          interview: true,
        },
      });

      // 2. Update the candidate's status to "In Progress"
      const candidate = await (tx.candidate as any).update({
        where: { id: assignment.candidateId },
        data: {
          status: "In Progress",
        },
      });

      // 3. Log Activity
      await logActivity(candidate.organizationId, candidate.id, "interview_started", `Started interview: ${assignment.interview.title}`);

      return { assignment, candidate };
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Interview Start Error:", error);
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 });
  }
}
