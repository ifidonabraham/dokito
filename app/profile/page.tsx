"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Droplet, 
  Languages, 
  Bell, 
  Shield,
  LogOut,
  ChevronRight,
  Settings,
  Heart,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pcm", label: "Nigerian Pidgin" },
  { code: "yo", label: "Yoruba" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bloodType: user?.bloodType || "",
    language: user?.language || "en",
  });

  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    healthTips: true,
    emergencyAlerts: true,
  });

  const handleSave = () => {
    if (user) {
      updateUser({
        name: formData.name,
        phone: formData.phone,
        bloodType: formData.bloodType,
        language: formData.language as "en" | "pcm" | "yo" | "ig" | "ha",
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
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
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 XXX XXX XXXX"
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bloodType" className="text-foreground">Blood Type</Label>
                <select
                  id="bloodType"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground disabled:bg-muted"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="language" className="text-foreground">Preferred Language</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                disabled={!isEditing}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground disabled:bg-muted"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>

            {isEditing && (
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Droplet className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">Allergies</p>
                  <p className="text-sm text-muted-foreground">
                    {user.allergies.length > 0 ? `${user.allergies.length} recorded` : "None recorded"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Emergency Contacts</p>
                  <p className="text-sm text-muted-foreground">
                    {user.emergencyContacts.length > 0 
                      ? `${user.emergencyContacts.length} contacts` 
                      : "Add emergency contacts"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Medication Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified when it&apos;s time to take your medication</p>
              </div>
              <Switch
                checked={notifications.medicationReminders}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, medicationReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Appointment Reminders</p>
                <p className="text-sm text-muted-foreground">Reminders for upcoming appointments</p>
              </div>
              <Switch
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, appointmentReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Health Tips</p>
                <p className="text-sm text-muted-foreground">Weekly health tips and insights</p>
              </div>
              <Switch
                checked={notifications.healthTips}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, healthTips: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Emergency Alerts</p>
                <p className="text-sm text-muted-foreground">Critical health alerts and updates</p>
              </div>
              <Switch
                checked={notifications.emergencyAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, emergencyAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <Card>
          <CardContent className="py-4">
            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Privacy & Security</p>
                  <p className="text-sm text-muted-foreground">Manage your data and privacy settings</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">App Settings</p>
                  <p className="text-sm text-muted-foreground">Theme, language, and other preferences</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
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
