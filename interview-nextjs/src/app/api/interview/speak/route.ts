import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const key = process.env.Deepgram_API_KEY;

    if (!key) {
      console.error("Deepgram API key not found in environment variables");
      return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
      method: "POST",
      headers: {
        "Authorization": `Token ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram TTS Proxy Error:", response.status, errorText);
      return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS Proxy Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
