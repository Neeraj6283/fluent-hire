"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight, Github, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      toast.success("Account created! Redirecting to login...");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-20">
        <Link href="/dashboard" className="flex items-center gap-2.5">
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
            <Button variant="outline" className="h-10 w-full rounded-xl" disabled={isLoading}>
              <Github className="mr-2 h-4 w-4" /> Sign up with GitHub
            </Button>
            <Button variant="outline" className="h-10 w-full rounded-xl" disabled={isLoading}>
              <span className="mr-2 text-base">G</span> Sign up with Google
            </Button>
          </div>

          <div className="relative my-2 text-center">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="name" 
                  placeholder="Jane Doe" 
                  className="h-10 rounded-xl pl-9" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@company.com" 
                  className="h-10 rounded-xl pl-9" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pwd">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="pwd" 
                  type="password" 
                  placeholder="At least 8 characters" 
                  className="h-10 rounded-xl pl-9" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox 
                className="mt-0.5" 
                checked={acceptedTerms} 
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <span>
                I agree to the <a className="text-primary hover:underline">Terms</a> and{" "}
                <a className="text-primary hover:underline">Privacy Policy</a>.
              </span>
            </label>
            <Button 
              type="submit" 
              className="h-10 w-full rounded-xl bg-gradient-primary text-white shadow-elegant"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 Voxa AI · SOC 2 Type II</p>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-subtle md:block">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-ai opacity-30 blur-3xl" />

        <div className="relative flex h-full items-center justify-center p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">The future of hiring is here.</h2>
              <p className="text-muted-foreground">Join thousands of teams using Voxa to conduct smarter interviews.</p>
            </div>

            <div className="space-y-4">
              {[
                "Unlimited AI-generated questions",
                "Real-time voice scoring",
                "Team collaboration & shared reports",
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium">{perk}</span>
                </div>
              ))}
            </div>

            <div className="glass animate-float rounded-3xl p-6 shadow-elegant">
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                "Voxa has completely transformed our engineering recruitment. We've cut our screening time by 70% while increasing the quality of our on-site candidates."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary" />
                <div>
                  <p className="text-sm font-semibold">Alex Rivera</p>
                  <p className="text-xs text-muted-foreground">CTO at Lumen Labs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
