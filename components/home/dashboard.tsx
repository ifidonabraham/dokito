"use client";

import Link from "next/link";
import { FileText, MapPin, MessageCircle, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHealthStore } from "@/stores/health-store";
import type { User } from "@/lib/types";

interface DashboardProps {
  user: User;
}

const quickActions = [
  { href: "/ask", icon: MessageCircle, label: "Ask Dokito AI", description: "Health information, not diagnosis" },
  { href: "/records", icon: FileText, label: "Health Records", description: "Save and view records" },
  { href: "/facilities", icon: MapPin, label: "Find Facility", description: "Nearby care options" },
  { href: "/medications", icon: Pill, label: "Prescription Tracker", description: "Track medicines due" },
];

export function Dashboard({ user }: DashboardProps) {
  const { vitals, medications } = useHealthStore();
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Continue your health workflow from records, facilities, emergency help, or Dokito AI.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="h-full transition-all hover:border-primary hover:shadow-md">
              <CardContent className="p-4">
                <action.icon className="mb-3 h-6 w-6 text-primary" />
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Health snapshot</h2>
            <p className="text-sm text-muted-foreground">
              {vitals.length} vital readings and {medications.filter((medication) => medication.isActive).length} active medicines saved locally.
            </p>
          </div>
          <Button asChild>
            <Link href="/records">Open Records</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
