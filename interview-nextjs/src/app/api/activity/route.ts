import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, description } = await request.json();

    if (!type || !description) {
      return NextResponse.json({ error: "Type and description are required" }, { status: 400 });
    }

    let orgId = authUser.organizationId;
    
    if (!orgId) {
      // Try to find orgId from candidate record if it's a candidate
      const candidate = await (prisma as any).candidate.findUnique({
        where: { email: authUser.email },
        select: { organizationId: true }
      });
      orgId = candidate?.organizationId || null;
    }

    if (!orgId) {
      return NextResponse.json({ error: "Organization not found for user" }, { status: 400 });
    }

    await logActivity(orgId, authUser.userId, type, description);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity logging API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
