"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, User, Phone, Briefcase, Linkedin, Upload, CalendarDays,
  Clock, Send, Check, Sparkles, Globe, MapPin, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

interface InterviewTemplate {
  id: string;
  title: string;
  duration: string;
  questions: any[];
}

const timezones = [
  "UTC", "Europe/London", "Europe/Berlin", "America/New_York",
  "America/Los_Angeles", "Asia/Karachi", "Asia/Tokyo", "Australia/Sydney",
];

export function CreateCandidate() {
  const router = useRouter();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [interview, setInterview] = useState<string>("");
  const [resume, setResume] = useState<File | null>(null);
  const [date, setDate] = useState<string>("");
  const [tz, setTz] = useState("UTC");
  const [sendNow, setSendNow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [slot, setSlot] = useState<string>("");
  const [expiry, setExpiry] = useState("7");
  const [reminders, setReminders] = useState(true);
  const [aiIntro, setAiIntro] = useState(true);

  const initials =
    `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "NN";
  const fullName = `${first} ${last}`.trim() || "New candidate";
  const slots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/interviews");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.interviews || []);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    }
    fetchTemplates();
  }, []);

  const handleCreate = async (shouldSend: boolean) => {
    // Validate all required fields
    const errors: string[] = [];
    
    if (!first.trim()) errors.push("First name is required");
    if (!email.trim()) errors.push("Email is required");
    if (!interview) errors.push("Interview template is required");
    if (!date) errors.push("Interview date is required");
    if (!slot) errors.push("Interview time slot is required");
    if (!resume) errors.push("Resume/CV file is required");
    
    if (errors.length > 0) {
      toast.error(errors.join("\n"));
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", first);
      formData.append("lastName", last);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("role", role);
      formData.append("location", location);
      formData.append("notes", notes);
      formData.append("interviewId", interview);
      formData.append("date", date);
      formData.append("timeSlot", slot);
      formData.append("timezone", tz);
      formData.append("sendEmail", String(shouldSend));
      if (resume) {
        formData.append("resume", resume);
      }

      const res = await fetch("/api/candidates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (data.emailError) {
          toast.warning(data.message, { duration: 6000 });
        } else {
          toast.success(data.message);
        }
        router.push("/candidates");
      } else {
        const errorMsg = data.error || "Failed to invite candidate";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error creating candidate:", error);
      toast.error("An error occurred. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedInterview = templates.find((i) => i.id === interview);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2">
          <Link href="/candidates"><ArrowLeft className="mr-1 h-4 w-4" /> Candidates</Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="People"
        title="Invite a candidate"
        description="Add candidate details and schedule their AI interview in one go."
        actions={
          <>
            <Button 
              variant="outline" 
              className="rounded-xl" 
              disabled={isLoading}
              onClick={() => {
                setSendNow(false);
                handleCreate(false);
              }}
            >
              Save as draft
            </Button>
            <Button 
              className="rounded-xl bg-gradient-primary text-white shadow-elegant"
              onClick={() => {
                setSendNow(true);
                handleCreate(true);
              }}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {sendNow ? "Send invitation" : "Schedule"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Candidate details */}
          <Card className="rounded-2xl border-border/60 shadow-soft">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold">Candidate details</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First name" icon={<User className="h-3.5 w-3.5" />} required>
                  <Input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Mira" className="rounded-xl" />
                </Field>
                <Field label="Last name">
                  <Input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Khan" className="rounded-xl" />
                </Field>
                <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />} required>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="mira@acme.com" className="rounded-xl" />
                </Field>
                <Field label="Phone (optional)" icon={<Phone className="h-3.5 w-3.5" />}>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 0100" className="rounded-xl" />
                </Field>
                <Field label="Role / position" icon={<Briefcase className="h-3.5 w-3.5" />}>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Backend Engineer" className="rounded-xl" />
                </Field>
                <Field label="LinkedIn (optional)" icon={<Linkedin className="h-3.5 w-3.5" />}>
                  <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/…" className="rounded-xl" />
                </Field>
                <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />}>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Berlin, DE" className="rounded-xl" />
                </Field>
                <Field label="Resume / CV" required>
                  <label className={`flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 text-sm transition ${ resume ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"} ${!resume ? "border-red-300" : ""}`}>
                    <Upload className="h-4 w-4" /> 
                    {resume ? resume.name : "Upload PDF or DOCX"}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setResume(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </Field>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Internal notes (optional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Referred by Aisha. Strong open-source contributions to Node ecosystem."
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interview & schedule */}
          <Card className="rounded-2xl border-border/60 shadow-soft">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ai/10 text-ai">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold">Schedule interview</h2>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Interview template <span className="text-red-500">*</span>
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {templates.length === 0 ? (
                    <div className="col-span-2 py-4 text-center text-sm text-muted-foreground">
                      No interview templates found. Please create one first.
                    </div>
                  ) : (
                    templates.map((i) => {
                      const active = interview === i.id;
                      return (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => setInterview(i.id)}
                          className={`group rounded-xl border p-3 text-left transition ${
                            active
                              ? "border-primary bg-primary/5 shadow-elegant"
                              : "border-border/70 hover:border-primary/50 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{i.title}</p>
                            {active && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {i.duration || "N/A"}</span>
                            <span>·</span>
                            <span>{(i as any)._count?.questions || 0} questions</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Timezone
                  </Label>
                  <Select value={tz} onValueChange={setTz}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {timezones.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Time slot <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const active = slot === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 hover:border-primary/50 hover:bg-muted/40"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <ToggleRow
                  label="Send invitation now"
                  desc="Email the candidate immediately after creation."
                  checked={sendNow}
                  onChange={setSendNow}
                />
                <ToggleRow
                  label="Automatic reminders"
                  desc="Send reminders 48h and 2h before the interview."
                  checked={reminders}
                  onChange={setReminders}
                />
                <ToggleRow
                  label="AI personal intro"
                  desc="Tailor the welcome message using the candidate's role and CV."
                  checked={aiIntro}
                  onChange={setAiIntro}
                  icon={<Sparkles className="h-3.5 w-3.5 text-ai" />}
                />
              </div> */}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: live preview */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border/60 shadow-soft">
            <CardContent className="space-y-5 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Preview
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-primary text-sm text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {email || "no-email@candidate.com"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <Row label="Role" value={role || "—"} />
                <Row label="Location" value={location || "—"} />
                <Row
                  label="Interview"
                  value={selectedInterview?.title || "Not selected"}
                />
                <Row
                  label="When"
                  value={
                    date && slot
                      ? `${date} · ${slot} (${tz})`
                      : "Not scheduled"
                  }
                />
                <Row label="Invite expires" value={`${expiry} days`} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sendNow && <Badge variant="secondary" className="rounded-full">Send now</Badge>}
                {reminders && <Badge variant="secondary" className="rounded-full">Reminders on</Badge>}
                {aiIntro && (
                  <Badge className="rounded-full bg-ai/15 text-ai hover:bg-ai/15">
                    <Sparkles className="mr-1 h-3 w-3" /> AI intro
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-soft">
            <CardContent className="space-y-3 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email preview
              </p>
              <div className="rounded-xl border border-border/60 bg-background p-4 text-sm">
                <p className="font-medium">
                  Hi {first || "there"}, you're invited to interview
                </p>
                <p className="mt-1 text-muted-foreground">
                  {selectedInterview
                    ? `We'd love you to take the "${selectedInterview.title}" interview.`
                    : "Pick an interview template to personalise this message."}
                  {date && slot ? ` It's scheduled for ${date} at ${slot} ${tz}.` : ""}
                </p>
                <Button size="sm" className="mt-3 rounded-lg bg-gradient-primary text-white">
                  Start interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  required,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  icon,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
