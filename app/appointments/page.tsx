"use client";

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Appointments are not available yet</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Appointment booking needs a confirmed backend table and API before it can be safely used.
            </p>
            <Button asChild className="mt-6">
              <Link href="/facilities">
                <MapPin className="mr-2 h-4 w-4" />
                Find a Facility
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
