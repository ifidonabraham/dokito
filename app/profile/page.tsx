"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Bell,
  ChevronRight,
  Droplet,
  Heart,
  Languages,
  LogOut,
  Mail,
  Phone,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    language: "en",
  });

  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    healthTips: true,
    emergencyAlerts: true,
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
          .select("full_name, phone, blood_type, preferred_language, avatar_url")
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();

        setFormData({
          name: data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          phone: data?.phone || "",
          bloodType: data?.blood_type || "",
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
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <Card className="mx-4 max-w-md">
          <CardContent className="py-8 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">Not Signed In</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Sign in to access your profile and health settings
            </p>
            <Button onClick={() => router.push("/")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = formData.name || user.email?.split("@")[0] || "User";

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" value={user.email || ""} disabled className="bg-muted pl-9" />
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
                    className="pl-9"
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
                  className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground disabled:bg-muted"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
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
                  className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-foreground disabled:bg-muted"
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
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent"
              onClick={() => router.push("/records")}
            >
              <div className="flex items-center gap-3">
                <Droplet className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">Allergies</p>
                  <p className="text-sm text-muted-foreground">Manage allergies in Health Records</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Emergency Contacts</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["medicationReminders", "Medication Reminders", "Get notified when it is time to take your medication"],
              ["appointmentReminders", "Appointment Reminders", "Reminders for upcoming appointments"],
              ["healthTips", "Health Tips", "Weekly health tips and insights"],
              ["emergencyAlerts", "Emergency Alerts", "Critical health alerts and updates"],
            ].map(([key, label, description]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, [key]: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Privacy & Security</p>
                  <p className="text-sm text-muted-foreground">Your profile is protected by Supabase auth and row-level security</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">App Settings</p>
                  <p className="text-sm text-muted-foreground">Language and notification preferences</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
