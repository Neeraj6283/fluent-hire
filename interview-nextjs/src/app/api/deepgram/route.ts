import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const key = process.env.Deepgram_API_KEY;
    
    if (!key) {
      return NextResponse.json({ error: "Deepgram API key not found" }, { status: 500 });
    }

    // For simplicity and to avoid SDK version issues, we'll return the key directly.
    // In a real production app, you'd use a temporary key or proxy the request.
    return NextResponse.json({ key });
  } catch (err) {
    console.error("Deepgram Route Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
