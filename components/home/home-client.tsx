"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  MapPin,
  AlertTriangle,
  MessageCircle,
  Plus,
  UserCircle,
  Activity,
  ArrowRight,
  Clock3,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEmergencyStore } from "@/stores/emergency-store";

interface HomeClientProps {
  user: User | null;
}

interface HealthRecordSummary {
  id: string;
  type: string;
  title: string;
  date: string;
  createdAt: string;
}

interface FacilitySummary {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  distance?: string;
}

const QUICK_ACTIONS = [
  {
    icon: AlertTriangle,
    label: "Emergency",
    description: "Call help and find nearby care",
    emergency: true,
    color: "bg-red-600 text-white",
    tone: "border-red-200 bg-red-50 text-red-950 hover:border-red-300 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/30 dark:text-red-50",
  },
  {
    icon: FileText,
    label: "Add Record",
    description: "Save lab, visit, or medicine note",
    href: "/records",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
    tone: "border-sky-100 bg-white hover:border-sky-200 hover:bg-sky-50 dark:border-sky-950 dark:bg-card dark:hover:bg-sky-950/20",
  },
  {
    icon: MessageCircle,
    label: "Ask Dokito AI",
    description: "Describe symptoms calmly",
    href: "/ask",
    color: "bg-primary/10 text-primary",
    tone: "border-primary/10 bg-white hover:border-primary/30 hover:bg-primary/5 dark:bg-card",
  },
  {
    icon: MapPin,
    label: "Find Facility",
    description: "Hospitals and clinics nearby",
    href: "/facilities",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    tone: "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50 dark:border-emerald-950 dark:bg-card dark:hover:bg-emerald-950/20",
  },
];

export function HomeClient({ user }: HomeClientProps) {
  const supabase = createClient();
  const { activateEmergency } = useEmergencyStore();
  const [records, setRecords] = useState<HealthRecordSummary[]>([]);
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState(Boolean(user));
  const [recordsError, setRecordsError] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadRecords() {
      try {
        const response = await fetch("/api/health-records?limit=5");
        if (!response.ok) throw new Error("Failed to load records");
        const data = await response.json();
        setRecords(data.records || []);
      } catch {
        setRecordsError(true);
      } finally {
        setIsRecordsLoading(false);
      }
    }

    loadRecords();
  }, [user]);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const response = await fetch("/api/facilities?hasEmergency=true&limit=3");
        const data = await response.json();
        setFacilities(data.facilities || []);
      } catch {
        setFacilities([]);
      }
    }

    loadFacilities();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      alert("Google Sign-In is not configured yet.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[linear-gradient(180deg,rgba(14,165,233,0.08),transparent_320px)] px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm dark:border-sky-950/60">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Private health workspace
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {user ? `Welcome back, ${firstName}` : "Your health support starts here"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Keep your records, ask Dokito AI for health information, and find care nearby.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  {records.length} saved records
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {facilities.length || "Emergency"} care options
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-950 shadow-sm dark:border-red-950 dark:bg-red-950/30 dark:text-red-50">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-red-600 p-2 text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">Emergency access stays ready</p>
                  <p className="mt-1 text-sm leading-5 text-red-900/80 dark:text-red-50/80">
                    Start emergency mode or call 112 if someone needs urgent help.
                  </p>
                </div>
              </div>
              <Button onClick={activateEmergency} variant="destructive" className="mt-4 w-full rounded-xl">
                Start Emergency Mode
              </Button>
            </div>
            {!user && (
              <Button onClick={handleGoogleSignIn} className="w-full rounded-xl sm:w-auto lg:col-span-2 lg:w-fit">
                Sign in with Google
              </Button>
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const card = (
              <Card className={cn("h-full rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", action.tone)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn("mb-4 inline-flex rounded-xl p-2.5", action.color)}>
                    <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-base font-semibold">{action.label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            );

            if (action.emergency) {
              return (
                <button key={action.label} type="button" onClick={activateEmergency} className="h-full text-left">
                  {card}
                </button>
              );
            }

            return (
              <Link key={action.label} href={action.href || "/"} className="h-full">
                {card}
              </Link>
            );
          })}
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Health Summary</h2>
                </div>
                <p className="text-sm text-muted-foreground">Your latest saved records</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/records">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Link>
              </Button>
            </div>

            {isRecordsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-xl border p-3">
                    <Skeleton className="mb-2 h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : recordsError ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                We could not load your health summary. Try again.
              </p>
            ) : records.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-secondary/40 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm dark:bg-background">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="font-medium">Add your first health record</p>
                <p className="mt-1 text-sm text-muted-foreground">Save diagnoses, lab results, prescriptions, or visit notes.</p>
                <Button asChild className="mt-4 rounded-xl">
                  <Link href="/records">Add a record</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <Link key={record.id} href={`/records?id=${record.id}`} className="block rounded-xl border bg-white p-3 transition-colors hover:border-primary/30 hover:bg-primary/5 dark:bg-background">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm capitalize text-muted-foreground">{record.type.replace("_", " ")}</p>
                      </div>
                      <p className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{record.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold">Nearby Emergency Care</h2>
              </div>
              <p className="text-sm text-muted-foreground">Available from the facility API</p>
            </div>
            {facilities.length === 0 ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-950 dark:border-red-950 dark:bg-red-950/30 dark:text-red-50">
                Emergency numbers remain available: 112 and 199.
              </div>
            ) : (
              <div className="space-y-3">
                {facilities.map((facility) => (
                  <div key={facility.id} className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-background">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{facility.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{facility.address}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                        Open
                      </span>
                    </div>
                    {facility.phone && (
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full rounded-xl">
                        <Link href={`tel:${facility.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call facility
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <UserCircle className="h-5 w-5" />
              </div>
            <div>
              <h2 className="font-semibold">Keep your profile simple</h2>
              <p className="text-sm text-muted-foreground">Add language preference and emergency contact details from Profile.</p>
            </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground sm:flex">
              <Clock3 className="h-3.5 w-3.5" />
              Takes 1 minute
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
