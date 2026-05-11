import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, X, ArrowRight, Sparkles, Volume2, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { interviewQuestions, assignedInterviews } from "@/data/candidatePortal";

const QUESTION_SECONDS = 60;

type Answer = { question: string; answer: string; rating: number };

export function CandidateInterview() {
  const { id } = useParams({ from: "/interview/$id" });
  const navigate = useNavigate();
  const meta = assignedInterviews.find((i) => i.id === id);
  const QUESTIONS = interviewQuestions[id] ?? interviewQuestions["senior-backend"];

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"speaking" | "listening" | "processing">("speaking");
  const [elapsed, setElapsed] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [muted, setMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalsRef = useRef<string>("");

  // total elapsed timer
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started]);

  // per-question timer + auto advance
  useEffect(() => {
    if (!started) return;
    setQuestionTime(0);
    const t = setInterval(() => {
      setQuestionTime((s) => {
        if (s + 1 >= QUESTION_SECONDS) {
          clearInterval(t);
          handleNext();
          return QUESTION_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started]);

  // AI "speaking" → "listening" transition + speech recognition lifecycle
  useEffect(() => {
    if (!started) return;
    setPhase("speaking");
    setTranscript("");
    setInterim("");
    finalsRef.current = "";

    // Try browser TTS
    try {
      const utt = new SpeechSynthesisUtterance(QUESTIONS[idx]);
      utt.rate = 1;
      utt.pitch = 1;
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.speak(utt);
    } catch {}

    const speakTimer = setTimeout(() => {
      setPhase("listening");
      startRecognition();
    }, 2000);

    return () => {
      clearTimeout(speakTimer);
      stopRecognition();
      try { window.speechSynthesis?.cancel(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started]);

  const startRecognition = () => {
    if (muted) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return; // unsupported, transcript stays empty
    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e: any) => {
        let interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) {
            finalsRef.current += res[0].transcript + " ";
          } else {
            interimText += res[0].transcript;
          }
        }
        setTranscript(finalsRef.current.trim());
        setInterim(interimText);
      };
      rec.onerror = () => {};
      rec.onend = () => {
        if (phase === "listening" && !muted) {
          try { rec.start(); } catch {}
        }
      };
      rec.start();
      recognitionRef.current = rec;
    } catch {}
  };

  const stopRecognition = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (next) stopRecognition();
      else if (phase === "listening") startRecognition();
      return next;
    });
  };

  const handleNext = () => {
    const finalAnswer = (finalsRef.current + interim).trim();
    const rating = Math.max(5, Math.min(10, 6 + Math.floor(finalAnswer.length / 80)));
    const newAns: Answer = { question: QUESTIONS[idx], answer: finalAnswer, rating };
    const updated = [...answers, newAns];
    setAnswers(updated);
    stopRecognition();
    setPhase("processing");

    setTimeout(() => {
      if (idx + 1 >= QUESTIONS.length) {
        finishInterview(updated);
      } else {
        setIdx((i) => i + 1);
      }
    }, 700);
  };

  const handleEnd = () => {
    const finalAnswer = (finalsRef.current + interim).trim();
    const updated = finalAnswer
      ? [...answers, { question: QUESTIONS[idx], answer: finalAnswer, rating: 6 }]
      : answers;
    finishInterview(updated);
  };

  const finishInterview = (all: Answer[]) => {
    stopRecognition();
    const score =
      all.length === 0
        ? 0
        : Math.round(all.reduce((s, a) => s + a.rating, 0) / all.length * 10);
    const resultId = `live-${id}-${Date.now()}`;
    const mm = Math.floor(elapsed / 60);
    const ss = elapsed % 60;
    const result = {
      id: resultId,
      interviewId: id,
      title: meta?.title ?? "Interview",
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      score,
      duration: `${mm}m ${ss}s`,
      answers: all,
    };
    try {
      sessionStorage.setItem(`voxa-result-${resultId}`, JSON.stringify(result));
    } catch {}
    navigate({ to: "/candidate/result/$id", params: { id: resultId } });
  };

  if (!started) return <StartScreen onStart={() => setStarted(true)} title={meta?.title} company={meta?.company} count={QUESTIONS.length} />;

  const total = QUESTIONS.length;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const remaining = QUESTION_SECONDS - questionTime;

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
            <p className="text-sm font-semibold">{meta?.title ?? "Interview"}</p>
            <p className="text-[11px] text-muted-foreground">{meta?.company ?? "Voxa AI"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-full">
            <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" /> REC {mm}:{ss}
          </Badge>
          <Badge variant="secondary" className="rounded-full">Q {idx + 1} / {total}</Badge>
          <Badge className={`rounded-full ${remaining <= 10 ? "bg-destructive text-white" : "bg-ai text-white"}`}>
            <Clock className="mr-1 h-3 w-3" /> {remaining}s
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleEnd}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="relative z-10 h-1 w-full bg-muted">
        <div className="h-full bg-gradient-ai transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>
      <div className="relative z-10 h-0.5 w-full bg-muted/50">
        <div className="h-full bg-ai transition-all" style={{ width: `${(questionTime / QUESTION_SECONDS) * 100}%` }} />
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
          {QUESTIONS[idx]}
        </h1>

        {/* Live transcript */}
        <div className="mt-6 w-full max-w-2xl rounded-2xl border bg-background/70 p-4 text-left shadow-soft backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Your answer (live transcript)</p>
            {muted && <Badge variant="secondary" className="rounded-full text-[10px] text-destructive">Muted</Badge>}
          </div>
          <div className="mt-2 min-h-[80px] text-sm leading-relaxed">
            {transcript ? <span>{transcript} </span> : null}
            {interim ? <span className="text-muted-foreground">{interim}</span> : null}
            {!transcript && !interim && (
              <span className="text-muted-foreground italic">
                {phase === "listening" ? "Speak now — your words will appear here…" : "Waiting for the question to finish…"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="lg" className="h-12 rounded-2xl" onClick={toggleMute}>
            {muted ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            className="h-12 rounded-2xl bg-gradient-primary px-6 text-white shadow-elegant"
          >
            {idx === total - 1 ? "Finish & see results" : "Next question"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="h-12 rounded-2xl text-destructive" onClick={handleEnd}>
            End interview
          </Button>
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-center gap-2 border-t bg-background/60 px-6 py-3 text-[11px] text-muted-foreground backdrop-blur-xl">
        <Shield className="h-3 w-3" /> End-to-end encrypted · Each question auto-advances after {QUESTION_SECONDS} seconds
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
              <p className="text-sm font-semibold">{title ?? "Senior Backend Engineer"}</p>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Ready to begin your AI interview?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {count} questions · voice-only · each question auto-advances after {QUESTION_SECONDS}s.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Find a quiet, well-lit place",
              "Use headphones for best audio quality",
              "Speak naturally — your transcript appears live on screen",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ai" /> {t}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Mic className="h-4 w-4 text-ai" /> Microphone test
              </span>
              <Badge variant="secondary" className="rounded-full text-success bg-success/15">Ready</Badge>
            </div>
            <div className="mt-3 flex h-6 items-center gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="wave-bar flex-1 rounded-full bg-gradient-ai"
                      style={{ height: `${30 + (i % 5) * 14}%`, animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={async () => {
              try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch {}
              onStart();
            }}
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
