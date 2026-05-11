import { Link } from "@tanstack/react-router";
import { Sparkles, Mail, Lock, User, ArrowRight, Github, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const perks = [
  "Unlimited AI-generated questions",
  "Real-time voice scoring",
  "Team collaboration & shared reports",
];

export function Signup() {
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
            <p className="text-xs font-medium uppercase tracking-wider text-ai">Get started</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Create your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Free for 14 days. No credit card required.
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="h-10 w-full rounded-xl">
              <Github className="mr-2 h-4 w-4" /> Sign up with GitHub
            </Button>
            <Button variant="outline" className="h-10 w-full rounded-xl">
              <span className="mr-2 text-base">G</span> Sign up with Google
            </Button>
          </div>

          <div className="relative my-2 text-center">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>

          <form className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="Jane Doe" className="h-10 rounded-xl pl-9" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@company.com" className="h-10 rounded-xl pl-9" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pwd">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="pwd" type="password" placeholder="At least 8 characters" className="h-10 rounded-xl pl-9" />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox className="mt-0.5" />
              <span>
                I agree to the <a className="text-primary hover:underline">Terms</a> and{" "}
                <a className="text-primary hover:underline">Privacy Policy</a>.
              </span>
            </label>
            <Button asChild className="h-10 w-full rounded-xl bg-gradient-primary text-white shadow-elegant">
              <Link to="/">Create account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
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
            <div className="glass animate-float rounded-3xl p-6 shadow-elegant">
              <p className="text-[11px] uppercase tracking-wider text-ai">What you get</p>
              <ul className="mt-3 space-y-2.5">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-ai text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-border rounded-3xl bg-card/80 p-5 shadow-glow">
              <p className="text-[11px] uppercase tracking-wider text-ai">Trusted by teams</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                "We cut our screening time by 60% in the first month."
              </p>
              <p className="mt-3 text-xs font-medium">— Talent lead, Acme Corp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
