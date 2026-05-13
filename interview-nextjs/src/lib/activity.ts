import { prisma } from "./prisma";

export async function logActivity(orgId: string, userId: string, type: string, description: string) {
  try {
    if (!(prisma as any).activity) {
      console.warn("Activity model not available in Prisma client yet.");
      return;
    }
    await (prisma as any).activity.create({
      data: {
        organizationId: orgId,
        userId: userId,
        type: type,
        description: description,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
