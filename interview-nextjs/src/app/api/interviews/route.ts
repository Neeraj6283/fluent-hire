import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ interviews });
  } catch (error: any) {
    console.error("Failed to fetch interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, category, difficulty, duration, status, questions } = await request.json();

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const interview = await prisma.interview.create({
      data: {
        title,
        category,
        difficulty,
        duration: String(duration),
        status, // "Public" or "Draft"
        questions: {
          create: questions.map((q: any) => ({
            skill: q.skill,
            question: q.text,
            difficulty: difficulty,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ interview });
  } catch (error: any) {
    console.error("Failed to create interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create interview" },
      { status: 500 }
    );
  }
}
