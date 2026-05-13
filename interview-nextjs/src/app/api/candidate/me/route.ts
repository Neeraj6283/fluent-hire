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

    return NextResponse.json({
      user: {
        name: authUser.name,
        email: authUser.email
      },
      candidate
    });
  } catch (error) {
    console.error("Get candidate me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
