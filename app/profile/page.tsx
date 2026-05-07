"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  ChevronRight,
  Droplet,
  Heart,
  Languages,
  LogOut,
  Mail,
  Phone,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pcm", label: "Nigerian Pidgin" },
  { code: "yo", label: "Yoruba" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
];

interface ProfileRow {
  full_name: string | null;
  phone: string | null;
  blood_type: string | null;
  genotype: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodType: "",
    genotype: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    language: "en",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, blood_type, genotype, emergency_contact_name, emergency_contact_phone, preferred_language, avatar_url")
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();

        setFormData({
          name: data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          phone: data?.phone || "",
          bloodType: data?.blood_type || "",
          genotype: data?.genotype || "",
          emergencyContactName: data?.emergency_contact_name || "",
          emergencyContactPhone: data?.emergency_contact_phone || "",
          language: data?.preferred_language || "en",
        });
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!supabase || !user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: formData.name || null,
      phone: formData.phone || null,
      blood_type: formData.bloodType || null,
      genotype: formData.genotype || null,
      emergency_contact_name: formData.emergencyContactName || null,
      emergency_contact_phone: formData.emergencyContactPhone || null,
      preferred_language: formData.language,
      updated_at: new Date().toISOString(),
    });

    await supabase.auth.updateUser({
      data: { full_name: formData.name || null },
    });

    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[linear-gradient(180deg,rgba(16,185,129,0.08),transparent_280px)] p-4 lg:p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <Skeleton className="h-28 rounded-2xl" />
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-[linear-gradient(180deg,rgba(14,165,233,0.08),transparent_300px)] px-4">
        <Card className="max-w-md rounded-2xl shadow-sm">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Not Signed In</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Sign in to access your profile and health settings
            </p>
            <Button onClick={() => router.push("/")} className="rounded-xl">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = formData.name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[linear-gradient(180deg,rgba(16,185,129,0.08),transparent_300px)] p-4 pb-28 lg:p-6 lg:pb-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure profile
                </p>
                <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="rounded-xl">
                {isEditing ? "Cancel" : "Edit"}
              </Button>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="rounded-xl bg-primary/10 p-2 text-primary">
                <User className="h-4 w-4" />
              </span>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" value={user.email || ""} disabled className="rounded-xl bg-muted pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 XXX XXX XXXX"
                    disabled={!isEditing}
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <select
                  id="bloodType"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground disabled:bg-muted"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="genotype">Genotype</Label>
                <select
                  id="genotype"
                  value={formData.genotype}
                  onChange={(e) => setFormData({ ...formData, genotype: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground disabled:bg-muted"
                >
                  <option value="">Select genotype</option>
                  {["AA", "AS", "SS", "AC", "SC"].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <div className="relative mt-1">
                <Languages className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-foreground disabled:bg-muted"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isEditing && (
              <Button onClick={handleSave} className="w-full rounded-xl">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-950 dark:text-red-200">
                <Users className="h-4 w-4" />
              </span>
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Who should we call?"
                disabled={!isEditing}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+234 XXX XXX XXXX"
                disabled={!isEditing}
                className="mt-1 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
          </div>

          <div className="space-y-5">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                <Heart className="h-4 w-4" />
              </span>
              Health Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="flex w-full items-center justify-between rounded-xl border bg-white p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 dark:bg-background"
              onClick={() => router.push("/records")}
            >
              <div className="flex items-center gap-3">
                <Droplet className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">Health Records</p>
                  <p className="text-sm text-muted-foreground">Manage diagnoses, lab results, prescriptions, and visit notes</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="py-4">
            <div className="flex w-full items-center justify-between rounded-xl p-3 text-left">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Shield className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Privacy & Security</p>
                  <p className="text-sm text-muted-foreground">Your profile is protected by Supabase auth and row-level security</p>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between rounded-xl p-3 text-left">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-muted p-2 text-muted-foreground">
                  <Settings className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">Medication reminders and chronic tracking</p>
                  <p className="text-sm text-muted-foreground">Coming later when backend support is available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full gap-2 rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
