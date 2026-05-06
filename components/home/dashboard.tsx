"use client";

import { 
  Heart, 
  Stethoscope, 
  MapPin, 
  Bell, 
  Pill,
  Activity,
  Calendar,
  ChevronRight,
  Droplet,
  Thermometer,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealthStore } from "@/stores/health-store";
import type { User } from "@/lib/types";

interface DashboardProps {
  user: User;
}

const quickActions = [
  {
    href: "/ask",
    icon: Stethoscope,
    label: "Ask Dokito AI",
    description: "Check your symptoms",
    color: "bg-primary",
  },
  {
    href: "/records",
    icon: Heart,
    label: "Health Records",
    description: "View your records",
    color: "bg-accent",
  },
  {
    href: "/facilities",
    icon: MapPin,
    label: "Find Facility",
    description: "Nearby healthcare",
    color: "bg-secondary",
  },
  {
    href: "/drugs",
    icon: Pill,
    label: "Drug Info",
    description: "Check medications",
    color: "bg-muted",
  },
];

export function Dashboard({ user }: DashboardProps) {
  const { vitals, medications, appointments } = useHealthStore();

  const latestVitals = vitals[0];
  const upcomingMedications = medications.filter((m) => m.isActive).slice(0, 3);
  const upcomingAppointments = appointments
    .filter((a) => new Date(a.dateTime) > new Date())
    .slice(0, 2);

  return (
    <div className="p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          How are you feeling today? Let&apos;s check on your health.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <div className={`mb-3 rounded-xl p-3 ${action.color} text-primary-foreground transition-transform group-hover:scale-110`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Health Overview */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Latest Vitals Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Vitals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestVitals ? (
              <div className="space-y-3">
                {latestVitals.bloodPressure && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Blood Pressure</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {latestVitals.bloodPressure.systolic}/{latestVitals.bloodPressure.diastolic}
                    </span>
                  </div>
                )}
                {latestVitals.heartRate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Heart Rate</span>
                    </div>
                    <span className="font-medium text-foreground">{latestVitals.heartRate} bpm</span>
                  </div>
                )}
                {latestVitals.bloodSugar && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">Blood Sugar</span>
                    </div>
                    <span className="font-medium text-foreground">{latestVitals.bloodSugar} mg/dL</span>
                  </div>
                )}
                {latestVitals.temperature && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-muted-foreground">Temperature</span>
                    </div>
                    <span className="font-medium text-foreground">{latestVitals.temperature}°C</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
                <Link href="/records">
                  <Button variant="link" size="sm" className="mt-2">
                    Add your first reading
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingMedications.length > 0 ? (
              <div className="space-y-3">
                {upcomingMedications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No active medications</p>
                <Link href="/records">
                  <Button variant="link" size="sm" className="mt-2">
                    Add medication
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.dateTime).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                <Link href="/appointments">
                  <Button variant="link" size="sm" className="mt-2">
                    Schedule appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ask Dokito AI CTA */}
      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary p-3">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Feeling unwell?</h3>
              <p className="text-sm text-muted-foreground">
                Describe your symptoms to Dokito AI and get instant health guidance.
              </p>
            </div>
          </div>
          <Link href="/ask">
            <Button className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Ask Dokito AI
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
