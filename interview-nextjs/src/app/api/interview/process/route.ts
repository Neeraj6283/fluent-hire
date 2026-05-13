import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { history, question, answer, followUpCount } = await req.json();

    const prompt = `
      You are a technical interviewer. 
      Current Question: "${question}"
      User's Answer: "${answer}"
      Follow-up count for this question: ${followUpCount}

      Evaluation Criteria:
      1. Analyze the user's latest answer and provide a score (0-10).
      2. If the user's answer is accurate and complete, respond with "MOVE_NEXT".
      3. If the user's answer is incomplete, slightly incorrect, or lacks detail, ask a VERY SHORT, relevant follow-up question (max 15 words).
      4. If the follow-up count is already 2 or more, respond with "MOVE_NEXT" regardless of the answer quality.
      5. Do not provide the correct answer yourself. Just ask the follow-up or say MOVE_NEXT.

      Conversation History:
      ${JSON.stringify(history)}

      Respond in JSON format:
      {
        "aiResponse": "follow-up question OR MOVE_NEXT",
        "score": number // Always provide a score (0-10) for the user's latest answer
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const aiResponse = result.aiResponse || "MOVE_NEXT";
    const score = result.score;

    return NextResponse.json({ aiResponse, score });
  } catch (error: any) {
    console.error("GPT Process Error:", error);
    return NextResponse.json({ error: "Failed to process turn" }, { status: 500 });
  }
}
