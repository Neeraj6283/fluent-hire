"use client";

import Link from "next/link";
import {
  User, Mail, Building2, Briefcase, Bell, Shield, KeyRound, CreditCard,
  Camera, Save, LogOut, Sparkles, Calendar, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";

export function Profile() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage your personal info, preferences, and security."
        actions={
          <Button asChild variant="outline" className="rounded-xl text-destructive hover:text-destructive">
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </Link>
          </Button>
        }
      />

      {/* Hero card */}
      <Card className="overflow-hidden rounded-2xl shadow-soft">
        <div className="relative h-32 bg-gradient-ai">
          <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        </div>
        <CardContent className="relative -mt-12 flex flex-wrap items-end justify-between gap-4 p-6">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-elegant">
                <AvatarFallback className="bg-gradient-primary text-2xl font-semibold text-white">
                  JD
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full border bg-card shadow-soft transition hover:bg-accent">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight">Jane Doe</h2>
                <Badge variant="secondary" className="rounded-full text-[10px]">
                  <Shield className="mr-1 h-2.5 w-2.5" /> Admin
                </Badge>
                <Badge variant="secondary" className="rounded-full bg-ai/15 text-[10px] text-ai">
                  <Sparkles className="mr-1 h-2.5 w-2.5" /> Pro plan
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">jane.doe@acme.com · Acme Corp</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl">Cancel</Button>
            <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant">
              <Save className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Personal info */}
        <Card className="md:col-span-2 rounded-2xl shadow-soft">
          <CardContent className="space-y-5 p-6 md:p-8">
            <div>
              <h3 className="text-sm font-semibold">Personal information</h3>
              <p className="text-xs text-muted-foreground">Update your name and contact details.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={User} label="Full name" defaultValue="Jane Doe" />
              <Field icon={Briefcase} label="Job title" defaultValue="Head of Talent" />
              <Field icon={Mail} label="Email" type="email" defaultValue="jane.doe@acme.com" />
              <Field icon={Building2} label="Company" defaultValue="Acme Corp" />
              <Field icon={Globe} label="Timezone" defaultValue="Europe/Berlin" />
              <Field icon={Calendar} label="Joined" defaultValue="Jan 2026" disabled />
            </div>
            <div className="grid gap-2">
              <Label>Bio</Label>
              <Textarea
                className="min-h-[88px] rounded-xl"
                placeholder="A short bio for your team profile…"
                defaultValue="Building hiring funnels powered by AI. Previously at Lumen Labs."
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-soft">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-sm font-semibold">Preferences</h3>
              <ToggleRow
                icon={Bell}
                title="Email notifications"
                desc="Interview results and weekly digest"
                defaultChecked
              />
              <ToggleRow
                icon={Sparkles}
                title="AI suggestions"
                desc="Smart prompts while creating interviews"
                defaultChecked
              />
              <ToggleRow
                icon={Shield}
                title="2-factor auth"
                desc="Require code on every sign-in"
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-soft">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-sm font-semibold">Security</h3>
              <Button variant="outline" className="w-full justify-start rounded-xl">
                <KeyRound className="mr-2 h-4 w-4" /> Change password
              </Button>
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link href="/usage">
                  <CreditCard className="mr-2 h-4 w-4" /> Manage subscription
                </Link>
              </Button>
              <Separator className="my-2" />
              <Button asChild variant="ghost" className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive">
                <Link href="/login">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  defaultValue,
  type = "text",
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  defaultValue?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={type}
          defaultValue={defaultValue}
          disabled={disabled}
          className="h-10 rounded-xl pl-9"
        />
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  desc,
  defaultChecked,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-card text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium leading-tight">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
