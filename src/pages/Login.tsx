import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function Login() {
  const navigate = useNavigate();
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("voxa_auth", "1");
    }
    navigate({ to: "/" });
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-ai shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">Voxa AI</span>
        </Link>

        <div className="mx-auto w-full max-w-sm space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ai">Welcome back</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Sign in to your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">Conduct AI-powered voice interviews.</p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="h-10 w-full rounded-xl">
              <Github className="mr-2 h-4 w-4" /> Continue with GitHub
            </Button>
            <Button variant="outline" className="h-10 w-full rounded-xl">
              <span className="mr-2 text-base">G</span> Continue with Google
            </Button>
          </div>

          <div className="relative my-2 text-center">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>

          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@company.com" className="h-10 rounded-xl pl-9" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd">Password</Label>
                <a className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="pwd" type="password" placeholder="••••••••" className="h-10 rounded-xl pl-9" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox /> Remember me for 30 days
            </label>
            <Button type="submit" className="h-10 w-full rounded-xl bg-gradient-primary text-white shadow-elegant">
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New to Voxa?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create a workspace
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 Voxa AI · SOC 2 Type II</p>
      </div>

      {/* Right: visual */}
      <div className="relative hidden overflow-hidden bg-gradient-subtle lg:block">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-ai opacity-30 blur-3xl" />

        <div className="relative flex h-full items-center justify-center p-12">
          <div className="w-full max-w-md space-y-5">
            <div className="glass animate-float rounded-3xl p-5 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-ai text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">AI is listening</p>
                  <div className="mt-2 flex h-6 items-center gap-1">
                    {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.7, 0.5, 0.6, 0.8, 0.4].map((h, i) => (
                      <span
                        key={i}
                        className="wave-bar w-1 rounded-full bg-gradient-ai"
                        style={{ height: `${h * 100}%`, animationDelay: `${i * 0.08}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-5 shadow-soft">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Question 3 / 10</p>
              <p className="mt-2 text-sm font-medium leading-relaxed">
                "Walk me through how you'd design a rate limiter for a Node.js API serving 100k req/min."
              </p>
            </div>

            <div className="ai-border rounded-3xl bg-card/80 p-5 shadow-glow">
              <p className="text-[11px] uppercase tracking-wider text-ai">AI Score</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-semibold tracking-tight text-gradient">88</p>
                <span className="text-xs text-muted-foreground">Recommend hire</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
