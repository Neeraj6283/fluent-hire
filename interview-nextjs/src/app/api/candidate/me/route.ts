import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser || authUser.role !== "member") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the candidate record associated with this user's email
    const candidate = await prisma.candidate.findUnique({
      where: { email: authUser.email },
      include: {
        interviews: {
          include: {
            interview: {
              include: {
                questions: true,
                _count: {
                  select: { questions: true }
                },
                organization: true
              }
            }
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
    }

    // Check for expired interviews and update status if necessary
    const now = new Date();
    let statusUpdated = false;

    for (const assignment of (candidate as any).interviews) {
      if (assignment.status !== "Completed" && assignment.status !== "Expired") {
        const scheduledTime = new Date(assignment.date);
        const oneHourAfter = new Date(scheduledTime.getTime() + 60 * 60 * 1000);

        if (now > oneHourAfter) {
          // Update assignment status to Expired
          await prisma.interviewAssignment.update({
            where: { id: assignment.id },
            data: { status: "Expired" }
          });
          
          // Also update candidate global status
          await prisma.candidate.update({
            where: { id: candidate.id },
            data: { status: "Expired" }
          });
          
          statusUpdated = true;
        }
      }
    }

    // Re-fetch candidate if any status was updated
    let finalCandidate = candidate;
    if (statusUpdated) {
      const updatedCandidate = await prisma.candidate.findUnique({
        where: { email: authUser.email },
        include: {
          interviews: {
            include: {
              interview: {
                include: {
                  questions: true,
                  _count: { select: { questions: true } },
                  organization: true
                }
              }
            }
          },
          answers: { include: { question: true } }
        }
      });
      if (updatedCandidate) finalCandidate = updatedCandidate;
    }

    return NextResponse.json({
      user: {
        name: authUser.name,
        email: authUser.email
      },
      candidate: finalCandidate,
      adminEmail: process.env.SMTP_EMAIL || "admin@fluenthire.com"
    });
  } catch (error) {
    console.error("Get candidate me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
