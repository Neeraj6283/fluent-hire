import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendPasswordSetEmail, sendNewInterviewEmail } from "@/lib/mail";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { logActivity } from "@/lib/activity";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_this_in_production"
);

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = authUser.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found for user" }, { status: 400 });
    }

    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const interviewId = formData.get("interviewId") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;
    const phone = formData.get("phone") as string;
    const date = formData.get("date") as string;
    const timeSlot = formData.get("timeSlot") as string;
    const timezone = formData.get("timezone") as string;
    const resumeFile = formData.get("resume") as File | null;
    const sendEmail = formData.get("sendEmail") === "true";

    console.log("DEBUG: POST /api/candidates - sendEmail flag:", sendEmail);

    if (!firstName || !email || !interviewId || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!resumeFile) {
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
    }

    let resumePath = "";
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory already exists or error
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${resumeFile.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    resumePath = `/uploads/${filename}`;

    const fullName = `${firstName} ${lastName}`.trim();

    // Combine date and timeSlot into a single Date object in IST (UTC+5:30)
    // We parse as IST and store as the corresponding UTC timestamp
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = (timeSlot || "10:00").split(':').map(Number);
    
    // Create date object and manually adjust for IST offset (+5:30)
    // UTC = IST - 5.5 hours
    const scheduledDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    scheduledDate.setMinutes(scheduledDate.getMinutes() - 330); // Subtract 330 minutes (5h 30m)

    // Generate temp password hash BEFORE transaction (bcrypt is slow)
    const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

    // Everything inside a transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create/Get User
      let user = await (tx.user as any).findUnique({ where: { email } });
      let isNewUser = false;
      
      if (user) {
        if (user.role !== "admin") {
          user = await (tx.user as any).update({
            where: { email },
            data: { role: "member" },
          });
        }
      } else {
        isNewUser = true;
        user = await (tx.user as any).create({
          data: {
            name: fullName,
            email,
            password: tempPassword,
            role: "member",
            organizationId: orgId,
          },
        });
      }

      // 2. Create/Update Candidate record
      let candidate = await (tx.candidate as any).findUnique({ where: { email } });
      if (candidate) {
        candidate = await (tx.candidate as any).update({
          where: { email },
          data: {
            name: fullName,
            phone,
            role,
            linkedinUrl,
            location,
            notes,
            resume: resumePath || undefined,
            organizationId: orgId,
            status: sendEmail ? "Invited" : "Draft",
          }
        });
        console.log(`DEBUG: Updated candidate status to: ${sendEmail ? "Invited" : "Draft"}`);
      } else {
        candidate = await (tx.candidate as any).create({
          data: {
            name: fullName,
            email,
            phone,
            role,
            linkedinUrl,
            location,
            notes,
            resume: resumePath,
            organizationId: orgId,
            status: sendEmail ? "Invited" : "Draft",
          },
        });
        console.log(`DEBUG: Created candidate with status: ${sendEmail ? "Invited" : "Draft"}`);
      }

      // 3. Assign Interview (Always create a new one as per user request)
      const assignment = await tx.interviewAssignment.create({
        data: {
          candidateId: candidate.id,
          interviewId: interviewId,
          status: sendEmail ? "Invited" : "Draft",
          date: scheduledDate,
        },
        include: {
          interview: true
        }
      });
      console.log(`DEBUG: Created new assignment with status: ${sendEmail ? "Invited" : "Draft"}`);

      return { candidate, user, assignment, isNewUser };
    });

    // 4. Generate token for setting password (only if needed)
    const token = await new SignJWT({ email: result.user.email, userId: result.user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // 5. Send Email (if requested)
    let emailSent = false;
    let emailError = null;
    if (sendEmail) {
      console.log(`DEBUG: Attempting to send email to: ${result.user.email}`);
      try {
        if (result.isNewUser) {
          // New user needs to set their password
          await sendPasswordSetEmail(result.user.email, result.user.name, token);
        } else {
          // Existing user just gets a notification with a link to their dashboard
          await sendNewInterviewEmail(
            result.user.email, 
            result.user.name, 
            result.assignment.interview.title, 
            date, 
            timeSlot, 
            result.assignment.id
          );
        }
        
        emailSent = true;
        console.log("DEBUG: Email sent successfully");
      } catch (error: any) {
        console.error("DEBUG: Email sending error in API:", error);
        emailError = error.message;

        // CRITICAL FIX: If email fails, update candidate and assignment status to "Draft"
        console.log("DEBUG: Reverting status to Draft due to email failure...");
        await prisma.$transaction([
          (prisma.candidate as any).update({
            where: { id: result.candidate.id },
            data: { status: "Draft" }
          }),
          (prisma.interviewAssignment as any).updateMany({
            where: { candidateId: result.candidate.id },
            data: { status: "Draft" }
          })
        ]);
        console.log("DEBUG: Status reverted to Draft successfully");
      }
    } else {
      console.log("DEBUG: Skipping email sending (sendEmail is false)");
    }

    // 6. Log Activities
    await logActivity(orgId, authUser.userId, "candidate_created", `Created candidate: ${fullName}`);
    if (sendEmail && emailSent) {
      await logActivity(orgId, authUser.userId, "interview_scheduled", `Scheduled interview for ${fullName}`);
    }

    return NextResponse.json({
      message: emailError 
        ? "Issue sending mail, candidate created, please send mail after some time" 
        : (sendEmail ? "Candidate created and invitation sent" : "Candidate created and scheduled as draft"),
      candidate: result.candidate,
      emailSent,
      emailError
    }, { status: 201 });

  } catch (error: any) {
    console.error("Create candidate error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isExport = searchParams.get("export") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const orgId = authUser.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found for user" }, { status: 400 });
    }

    if (isExport) {
      const allAssignments = await (prisma.interviewAssignment as any).findMany({
        where: {
          candidate: {
            organizationId: orgId
          }
        },
        include: {
          candidate: true,
          interview: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ assignments: allAssignments });
    }

    const [assignments, total, stats] = await Promise.all([
      (prisma.interviewAssignment as any).findMany({
        where: {
          candidate: {
            organizationId: orgId
          }
        },
        include: {
          candidate: true,
          interview: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      (prisma.interviewAssignment as any).count({
        where: {
          candidate: {
            organizationId: orgId
          }
        }
      }),
      (prisma.interviewAssignment as any).groupBy({
        by: ['status'],
        where: {
          candidate: {
            organizationId: orgId
          }
        },
        _count: { _all: true }
      })
    ]);

    const formattedStats = {
      Invited: stats.find((s: any) => s.status === 'Invited')?._count._all || 0,
      'In Progress': stats.find((s: any) => s.status === 'In Progress')?._count._all || 0,
      Completed: stats.find((s: any) => s.status === 'Completed')?._count._all || 0,
      Expired: stats.find((s: any) => s.status === 'Expired')?._count._all || 0,
    };

    return NextResponse.json({
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: formattedStats
    });
  } catch (error) {
    console.error("Get candidates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    // Verify candidate belongs to the same organization
    const candidate = await (prisma.candidate as any).findUnique({
      where: { id },
      select: { organizationId: true, email: true }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    if (candidate.organizationId !== authUser.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the associated User account first (if exists)
    await prisma.user.deleteMany({
      where: { email: candidate.email }
    });

    // Delete candidate (this will cascade delete assignments and answers due to schema)
    await (prisma.candidate as any).delete({
      where: { id }
    });

    // Log Activity
    await logActivity(candidate.organizationId, authUser.userId, "candidate_deleted", `Deleted candidate: ${candidate.email}`);

    return NextResponse.json({ message: "Candidate and associated account deleted successfully" });
  } catch (error) {
    console.error("Delete candidate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
