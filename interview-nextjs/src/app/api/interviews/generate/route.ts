import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, difficulty, duration, skills } = await request.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "No skills provided" }, { status: 400 });
    }

    const prompt = `
      You are an expert interviewer for ${category} roles. 
      Generate a list of interview questions for a ${difficulty} level ${title} position.
      The interview is expected to last ${duration} minutes.
      
      Generate the specific number of questions for each skill as requested below:
      ${skills.map((s: any) => `- ${s.name}: ${s.count} questions`).join("\n")}
      
      For each question, provide:
      1. The skill it belongs to.
      2. The type (Technical, Scenario, or Behavioral).
      3. The question text itself.
      
      Format the output as a JSON array of objects with the following structure:
      [
        { "skill": "Skill Name", "type": "Technical", "text": "Question text..." },
        ...
      ]
      
      Return ONLY the JSON array.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates interview questions in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedContent = JSON.parse(content);
    // Handle both { "questions": [...] } and direct array if OpenAI wraps it
    const questions = Array.isArray(parsedContent) ? parsedContent : parsedContent.questions || [];

    // Add unique IDs to the questions
    const questionsWithIds = questions.map((q: any, index: number) => ({
      ...q,
      id: Date.now() + index,
    }));

    // Track AI Usage
    try {
      if (authUser.organizationId) {
        await (prisma as any).aIUsage.create({
          data: {
            organizationId: authUser.organizationId,
            type: "generate_questions",
            inputTokens: response.usage?.prompt_tokens || 0,
            outputTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          }
        });
      }
    } catch (usageError) {
      console.error("Failed to track AI usage during generation:", usageError);
    }

    return NextResponse.json({ questions: questionsWithIds });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
