import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendPasswordSetEmail } from "@/lib/mail";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-dev-only"
);

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, email } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Candidate ID and email are required" }, { status: 400 });
    }

    // 1. Fetch candidate and verify organization
    const candidate = await (prisma.candidate as any).findUnique({
      where: { id },
    });

    if (!candidate || candidate.organizationId !== authUser.organizationId) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Find associated user by current candidate email
    const user = await (prisma.user as any).findUnique({
      where: { email: candidate.email }
    });

    // 2. Update candidate email and user email if changed
    await prisma.$transaction(async (tx) => {
      await (tx.candidate as any).update({
        where: { id },
        data: { 
          email,
          status: "Invited" 
        }
      });

      if (user) {
        await (tx.user as any).update({
          where: { id: user.id },
          data: { email }
        });
      }

      // Update assignment status
      await (tx.interviewAssignment as any).updateMany({
        where: { candidateId: id },
        data: { status: "Invited" }
      });
    });

    // 3. Send Invitation Email
    const token = await new jose.SignJWT({ 
      email, 
      userId: user?.id || "",
      candidateId: candidate.id 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    try {
      await sendPasswordSetEmail(email, candidate.name, token);
      return NextResponse.json({ message: "Invitation resent successfully" });
    } catch (emailError: any) {
      console.error("Resend email error:", emailError);
      return NextResponse.json({ 
        error: "Candidate updated but failed to send email. Please try again later." 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Resend API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
