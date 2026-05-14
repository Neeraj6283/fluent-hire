"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store user data in localStorage for UI updates
      if (typeof window !== "undefined") {
        localStorage.setItem("voxa_user", JSON.stringify(data.user));
        localStorage.setItem("voxa_auth", "1");
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh(); // Force refresh to update server components/middleware state
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
            <p className="text-xs font-medium uppercase tracking-wider text-ai">Welcome back</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Sign in to your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">Conduct AI-powered voice interviews.</p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="h-10 w-full rounded-xl" disabled={isLoading}>
              <Github className="mr-2 h-4 w-4" /> Continue with GitHub
            </Button>
            <Button variant="outline" className="h-10 w-full rounded-xl" disabled={isLoading}>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd">Password</Label>
                <Link href="/auth/forgot-password" title="Forgot password?" className="text-xs text-primary hover:underline cursor-pointer">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="pwd" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-10 rounded-xl pl-9" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <Checkbox /> Remember me for 30 days
            </label>
            <Button 
              type="submit" 
              className="h-10 w-full rounded-xl bg-gradient-primary text-white shadow-elegant"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New to Voxa?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create a workspace
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 Voxa AI · SOC 2 Type II</p>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-subtle md:block">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-ai opacity-30 blur-3xl" />

        <div className="relative flex h-full items-center justify-center p-12">
          <div className="w-full max-w-md space-y-5">
            <div className="glass animate-float rounded-3xl p-5 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-ai text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Insight</p>
                  <p className="text-sm font-semibold">Real-time sentiment analysis</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                "The candidate shows high confidence and technical depth in their responses regarding distributed systems."
              </p>
            </div>

            <div className="glass animate-float-delayed rounded-3xl p-5 shadow-elegant ml-12">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-white">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Step</p>
                  <p className="text-sm font-semibold">Invite to technical round</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
