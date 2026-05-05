"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  Heart,
  FileText,
  MapPin,
  AlertTriangle,
  MessageCircle,
  Plus,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    description: "Get urgent help now",
    emergency: true,
    color: "bg-red-600 text-white",
  },
  {
    icon: FileText,
    label: "Add Record",
    description: "Save a health event",
    href: "/records",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: MessageCircle,
    label: "Ask Dokita",
    description: "Describe symptoms",
    href: "/ask",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    label: "Find Facility",
    description: "Hospitals nearby",
    href: "/facilities",
    color: "bg-green-500/10 text-green-600",
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">AKILI Health</p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">
                {user ? `Welcome back, ${firstName}` : "Your health support starts here"}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Keep your records, ask Dokita for health information, and find care nearby.
              </p>
            </div>
            {!user && (
              <Button onClick={handleGoogleSignIn} className="w-full sm:w-auto">
                Sign in with Google
              </Button>
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const card = (
              <Card className={cn("h-full transition-shadow hover:shadow-md", action.emergency && "border-red-600")}>
                <CardContent className="p-4">
                  <div className={cn("mb-3 inline-flex rounded-md p-2", action.color)}>
                    <Icon className="h-5 w-5" />
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
              <Link key={action.label} href={action.href || "/"}>
                {card}
              </Link>
            );
          })}
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Health Summary</h2>
                <p className="text-sm text-muted-foreground">Your latest saved records</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/records">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Link>
              </Button>
            </div>

            {isRecordsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 rounded-md bg-muted" />
                ))}
              </div>
            ) : recordsError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                We could not load your health summary. Try again.
              </p>
            ) : records.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Add your first health record</p>
                <p className="mt-1 text-sm text-muted-foreground">Save diagnoses, lab results, prescriptions, or visit notes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <Link key={record.id} href={`/records?id=${record.id}`} className="block rounded-md border p-3 hover:bg-accent">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm capitalize text-muted-foreground">{record.type.replace("_", " ")}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Nearby Emergency Care</h2>
              <p className="text-sm text-muted-foreground">Available from the facility API</p>
            </div>
            {facilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Emergency numbers remain available: 112 and 199.</p>
            ) : (
              <div className="space-y-3">
                {facilities.map((facility) => (
                  <div key={facility.id} className="rounded-md border p-3">
                    <p className="font-medium">{facility.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{facility.address}</p>
                    {facility.phone && (
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link href={`tel:${facility.phone}`}>Call facility</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <UserCircle className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">Keep your profile simple</h2>
              <p className="text-sm text-muted-foreground">Add language preference and emergency contact details from Profile.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
