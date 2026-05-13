"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, Sparkles, Volume2, Shield, Clock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SILENCE_TIMEOUT = 5000; // 5 seconds silence timeout

type Message = { role: "ai" | "user"; content: string };

export function CandidateInterview() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [phase, setPhase] = useState<"speaking" | "listening" | "processing">("speaking");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [muted, setMuted] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTranscriptRef = useRef("");
  
  // Refs for stale closure prevention
  const idxRef = useRef(0);
  const historyRef = useRef<Message[]>([]);
  const followUpCountRef = useRef(0);

  // Sync refs with state
  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { followUpCountRef.current = followUpCount; }, [followUpCount]);

  // Load interview data
  useEffect(() => {
    async function fetchInterview() {
      try {
        const res = await fetch(`/api/candidate/me`);
        if (res.ok) {
          const data = await res.json();
          const assignment = data.candidate.interviews.find((i: any) => i.interview.id === id);
          if (assignment) {
            setInterview(assignment);
            setQuestions(assignment.interview.questions);
          } else {
            toast.error("Interview assignment not found");
          }
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview");
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id]);

  // total elapsed timer
  useEffect(() => {
    if (!started || isFinishing) return;
    const t = setInterval(() => {
      setElapsed((s) => {
        const durationLimit = parseInt(interview?.interview?.duration || "30") * 60;
        if (s >= durationLimit) {
          clearInterval(t);
          handleTimeFinish();
          return s;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, interview, isFinishing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSTT();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Initialize Deepgram STT
  const startSTT = async () => {
    if (muted || isFinishing) return;
    try {
      const response = await fetch("/api/deepgram");
      const { key } = await response.json();
      
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&smart_format=true", [
        "token",
        key,
      ]);

      socket.onopen = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
          mediaRecorder.addEventListener("dataavailable", (event) => {
            if (event.data.size > 0 && socket.readyState === 1) {
              socket.send(event.data);
            }
          });
          mediaRecorder.start(250);
          mediaRecorderRef.current = mediaRecorder;
        });
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        if (!received.channel) return;
        const transcriptText = received.channel.alternatives[0].transcript;
        
        if (transcriptText && received.is_final) {
          currentTranscriptRef.current += " " + transcriptText;
          setTranscript(currentTranscriptRef.current.trim());
          resetSilenceTimer();
        }
      };

      socketRef.current = socket;
    } catch (error) {
      console.error("STT Error:", error);
    }
  };

  const stopSTT = () => {
    socketRef.current?.close();
    mediaRecorderRef.current?.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (totalSilenceTimerRef.current) clearTimeout(totalSilenceTimerRef.current);
  };

  const startTotalSilenceTimer = () => {
    if (totalSilenceTimerRef.current) clearTimeout(totalSilenceTimerRef.current);
    totalSilenceTimerRef.current = setTimeout(() => {
      if (phase === "listening") {
        console.log("Total silence detected for 5 seconds. Auto-submitting empty answer.");
        handleTurn();
      }
    }, 5000); // 5 seconds total silence
  };

  const resetSilenceTimer = () => {
    if (totalSilenceTimerRef.current) clearTimeout(totalSilenceTimerRef.current); // Stop total silence if user starts talking
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (currentTranscriptRef.current.trim().length > 0) {
        handleTurn();
      }
    }, SILENCE_TIMEOUT);
  };

  const speakText = async (text: string) => {
    if (isFinishing && text !== "Your time is finished, please check the result.") return;
    setPhase("speaking");
    
    // Cleanup previous audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const response = await fetch("/api/interview/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Deepgram TTS API Error:", response.status, errorText);
        throw new Error(`Deepgram TTS failed: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Received empty audio blob");

      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      
      // Handle audio loading errors
      audio.onerror = (e) => {
        console.error("Audio element error:", e);
        URL.revokeObjectURL(url);
        fallbackToBrowserTTS(text);
      };

      audio.src = url;
      audioRef.current = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (!isFinishing) {
          setTimeout(() => {
            setPhase("listening");
            currentTranscriptRef.current = "";
            setTranscript("");
            startSTT();
            startTotalSilenceTimer();
          }, 500);
        }
      };

      await audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
      fallbackToBrowserTTS(text);
    }
  };

  const fallbackToBrowserTTS = (text: string) => {
    console.log("Falling back to browser SpeechSynthesis");
    const utt = new SpeechSynthesisUtterance(text);
    utt.onend = () => {
      if (!isFinishing) {
        setTimeout(() => {
          setPhase("listening");
          currentTranscriptRef.current = "";
          setTranscript("");
          startSTT();
          startTotalSilenceTimer();
        }, 500);
      }
    };
    window.speechSynthesis.speak(utt);
  };

  const handleTurn = async () => {
    const userMsg = currentTranscriptRef.current.trim();
    if (!userMsg || isFinishing) return;

    // Use refs to get latest values in the closure
    const currentIdx = idxRef.current;
    const currentHistory = historyRef.current;
    const currentFollowUpCount = followUpCountRef.current;

    stopSTT();
    setPhase("processing");

    // Artificial "thinking" delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedHistory: Message[] = [...currentHistory, { role: "user", content: userMsg }];
    setHistory(updatedHistory);
    
    console.log("Processing Turn:", { currentIdx, currentFollowUpCount, userMsg });

    try {
      const res = await fetch("/api/interview/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: updatedHistory,
          question: questions[currentIdx].question,
          answer: userMsg,
          followUpCount: currentFollowUpCount,
        }),
      });

      const { aiResponse, score } = await res.json();
      console.log("AI Response from Process API:", { aiResponse, score });

      // FORCE progression if currentFollowUpCount is already 2 OR AI says MOVE_NEXT
      if (aiResponse.includes("MOVE_NEXT") || currentFollowUpCount >= 2) {
        if (currentIdx + 1 < questions.length) {
          const nextIdx = currentIdx + 1;
          setIdx(nextIdx);
          setFollowUpCount(0);
          const nextQ = questions[nextIdx].question;
          const newHistory: any[] = [...updatedHistory, { role: "ai", content: nextQ, score: score }];
          setHistory(newHistory);
          speakText(nextQ);
        } else {
          const finalHistory: any[] = [...updatedHistory, { role: "ai", content: "MOVE_NEXT", score: score }];
          finishInterview(finalHistory);
        }
      } else {
        // AI asks a follow-up
        const nextFollowUpCount = currentFollowUpCount + 1;
        setFollowUpCount(nextFollowUpCount);
        const newHistory: any[] = [...updatedHistory, { role: "ai", content: aiResponse, score: score }];
        setHistory(newHistory);
        speakText(aiResponse);
      }
    } catch (error) {
      console.error("Turn Error:", error);
      if (currentIdx + 1 < questions.length) {
        const nextIdx = currentIdx + 1;
        const nextQ = questions[nextIdx].question;
        setIdx(nextIdx);
        setFollowUpCount(0);
        setHistory([...updatedHistory, { role: "ai", content: nextQ }]);
        speakText(nextQ);
      } else {
        finishInterview(updatedHistory);
      }
    }
  };

  const handleTimeFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    stopSTT();
    const finalMsg = "Your time is finished, please check the result.";
    speakText(finalMsg);
    setTimeout(() => finishInterview(historyRef.current), 5000);
  };

  const finishInterview = async (finalHistory: Message[]) => {
    setIsFinishing(true);
    stopSTT();
    console.log("Finishing Interview with History:", finalHistory);
    try {
      const res = await fetch("/api/interview/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: interview.id,
          history: finalHistory,
        }),
      });

      if (res.ok) {
        router.push(`/candidate/result/${interview.id}`);
      }
    } catch (error) {
      console.error("Finish Error:", error);
      toast.error("Failed to save results");
    }
  };

  const startInterview = () => {
    setStarted(true);
    const firstQ = questions[0].question;
    setHistory([{ role: "ai", content: firstQ }]);
    speakText(firstQ);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!interview || !questions || questions.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Interview not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">This interview has no questions or is not assigned to you.</p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/candidate">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!started) return <StartScreen onStart={startInterview} title={interview?.interview?.title} company={interview?.interview?.organization?.name} count={questions.length} />;

  const total = questions.length;
  const durationLimit = parseInt(interview?.interview?.duration || "30") * 60;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const remaining = Math.max(0, durationLimit - elapsed);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-ai opacity-20 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-ai text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{interview?.interview?.title ?? "Interview"}</p>
            <p className="text-[11px] text-muted-foreground">{interview?.interview?.organization?.name ?? "Voxa AI"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-full">
            <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" /> REC {mm}:{ss}
          </Badge>
          <Badge variant="secondary" className="rounded-full">Question {idx + 1} / {total}</Badge>
          <Badge className={`rounded-full ${remaining <= 60 ? "bg-destructive text-white" : "bg-ai text-white"}`}>
            <Clock className="mr-1 h-3 w-3" /> {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </Badge>
        </div>
      </header>

      <div className="relative z-10 h-1 w-full bg-muted">
        <div className="h-full bg-gradient-ai transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-8 text-center">
        <div className="relative mb-6">
          <div className={`absolute inset-0 rounded-full bg-gradient-ai blur-2xl transition-opacity ${phase === "speaking" ? "opacity-60" : "opacity-30"}`} />
          <div className={`relative grid h-32 w-32 place-items-center rounded-full bg-gradient-ai shadow-glow ${phase === "listening" ? "" : "animate-pulse-glow"}`}>
            <div className="grid h-24 w-24 place-items-center rounded-full bg-background/20 backdrop-blur-sm">
              {phase === "speaking" && <Volume2 className="h-8 w-8 text-white" />}
              {phase === "listening" && (
                <div className="flex h-10 items-center gap-1.5">
                  {[0.5, 0.9, 0.4, 0.8, 0.6, 0.95, 0.5, 0.7].map((h, i) => (
                    <span key={i} className="wave-bar w-1.5 rounded-full bg-white"
                          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
              {phase === "processing" && (
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2.5 w-2.5 animate-bounce rounded-full bg-white" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ai">
          {phase === "speaking" ? "AI is speaking" : phase === "listening" ? "Listening to you" : "Processing your answer"}
        </p>
        <h1 className="mt-3 max-w-2xl text-xl font-semibold leading-snug tracking-tight md:text-2xl">
          {[...history].reverse().find(m => m.role === "ai")?.content || questions[0].question}
        </h1>

        <div className="mt-6 w-full max-w-2xl rounded-2xl border bg-background/70 p-4 text-left shadow-soft backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Your answer (live transcript)</p>
            {muted && <Badge variant="secondary" className="rounded-full text-[10px] text-destructive">Muted</Badge>}
          </div>
          <div className="mt-2 min-h-[80px] text-sm leading-relaxed">
            {transcript ? <span>{transcript}</span> : (
              <span className="text-muted-foreground italic">
                {phase === "listening" ? "Speak now — your words will appear here…" : "Waiting for the question to finish…"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="lg" className="h-12 rounded-2xl" onClick={() => setMuted(!muted)}>
            {muted ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-2xl text-destructive"
            onClick={() => finishInterview(history)}
            disabled={isFinishing}
          >
            {isFinishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            End interview
          </Button>
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-center gap-2 border-t bg-background/60 px-6 py-3 text-[11px] text-muted-foreground backdrop-blur-xl">
        <Shield className="h-3 w-3" /> AI Interview Mode · Follow-ups enabled · Silence detection active
      </footer>
    </div>
  );
}

function StartScreen({ onStart, title, company, count }: { onStart: () => void; title?: string; company?: string; count: number }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-ai opacity-25 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-ai text-white shadow-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{company ?? "Acme Corp"}</p>
              <p className="text-sm font-semibold">{title ?? "Technical Interview"}</p>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Ready to begin your AI interview?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {count} questions · voice-only · AI will ask follow-up questions if needed.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Find a quiet place",
              "Speak naturally — silence for 5s will submit your answer",
              "AI will ask follow-up questions for better evaluation",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ai" /> {t}
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            onClick={onStart}
            className="mt-6 h-12 w-full rounded-2xl bg-gradient-primary text-white shadow-elegant animate-pulse-glow"
          >
            Start interview <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            <Shield className="mr-1 inline h-3 w-3" /> Your recording is encrypted and only visible to the hiring team
          </p>
        </div>
      </div>
    </div>
  );
}
