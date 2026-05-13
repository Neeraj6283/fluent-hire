import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { logActivity } from "@/lib/activity";

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { assignmentId, history } = await req.json();

    // Generate final score and feedback using GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o-mini which supports JSON mode better
      messages: [
        {
          role: "system",
          content: "Analyze this technical interview conversation and provide a final score out of 100, a detailed professional feedback summary, 3 key strengths, and 3 areas to improve. Format your response as JSON: { \"score\": number, \"feedback\": \"string\", \"strengths\": [\"string\", \"string\", \"string\"], \"improvements\": [\"string\", \"string\", \"string\"] }",
        },
        { role: "user", content: JSON.stringify(history) },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    // Save to database
    await prisma.$transaction(async (tx) => {
      // 1. Update the interview assignment
      const assignment = await (tx.interviewAssignment as any).update({
        where: { id: assignmentId },
        data: {
          score: result.score,
          feedback: JSON.stringify({
            summary: result.feedback,
            strengths: result.strengths,
            improvements: result.improvements
          }),
          transcript: history,
          status: "Completed",
        },
      });

      // 2. Update the candidate's global status and overall score
      const candidate = await (tx.candidate as any).update({
        where: { id: assignment.candidateId },
        data: {
          status: "Completed",
          score: result.score,
        },
      });

      // 3. Log Activity
      await (tx.activity as any).create({
        data: {
          organizationId: candidate.organizationId,
          userId: candidate.id, // Candidate is also a user in this context, or we should use admin's ID if available
          type: "interview_completed",
          description: `Completed interview: ${assignment.interview.title}`,
        },
      });
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Interview Finish Error:", error);
    return NextResponse.json({ error: "Failed to finish interview" }, { status: 500 });
  }
}
