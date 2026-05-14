import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRescheduleEmail } from "@/lib/mail";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId, date, timeSlot } = await req.json();

    if (!assignmentId || !date || !timeSlot) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Calculate new scheduled date in IST
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    
    const scheduledDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    scheduledDate.setMinutes(scheduledDate.getMinutes() - 330); // Subtract 330 minutes for IST offset

    // 2. Update assignment and candidate status
    const result = await prisma.$transaction(async (tx) => {
      const assignment = await (tx.interviewAssignment as any).update({
        where: { id: assignmentId },
        data: {
          date: scheduledDate,
          status: "Invited", // Reset to Invited so they can start again
          score: null,      // Reset score
          transcript: null, // Reset transcript
          feedback: null,   // Reset feedback
        },
        include: {
          candidate: true,
          interview: true,
        },
      });

      await (tx.candidate as any).update({
        where: { id: assignment.candidateId },
        data: { status: "Invited" },
      });

      return assignment;
    });

    // 3. Send Reschedule Email
    await sendRescheduleEmail(
      result.candidate.email,
      result.candidate.name,
      result.interview.title,
      date,
      timeSlot,
      result.interview.id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reschedule API Error:", error);
    return NextResponse.json({ error: "Failed to reschedule interview" }, { status: 500 });
  }
}
