"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Clock, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Appointment = {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  facility?: string | null;
  provider?: string | null;
  reason?: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

const emptyForm = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  time: "",
  facility: "",
  provider: "",
  reason: "",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load appointments");
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load appointments");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveAppointment(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Add a short appointment title.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errors?.join(", ") || data.error || "Could not save appointment");
      setForm(emptyForm);
      setIsFormOpen(false);
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save appointment");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(id: string, status: Appointment["status"]) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) await loadAppointments();
  }

  async function deleteAppointment(id: string) {
    const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (response.ok) setAppointments((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
              <p className="mt-1 text-sm text-muted-foreground">Save clinic visits, follow-ups, lab appointments, and reminders.</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </div>
        </section>

        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {isFormOpen && (
          <Card>
            <CardContent className="p-5">
              <form onSubmit={saveAppointment} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="appointment-title">Title</Label>
                    <Input id="appointment-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Follow-up with doctor" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="appointment-date">Date</Label>
                      <Input id="appointment-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="appointment-time">Time</Label>
                      <Input id="appointment-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="appointment-facility">Facility</Label>
                    <Input id="appointment-facility" value={form.facility} onChange={(e) => setForm({ ...form, facility: e.target.value })} placeholder="Hospital, clinic, or lab" />
                  </div>
                  <div>
                    <Label htmlFor="appointment-provider">Provider</Label>
                    <Input id="appointment-provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Doctor, nurse, or department" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appointment-reason">Reason</Label>
                  <Textarea id="appointment-reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why are you going?" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Appointment"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="h-28 rounded-lg bg-muted" />
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-semibold">No appointments yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Add your next clinic, lab, or follow-up visit.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{appointment.date}</span>
                        {appointment.time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{appointment.time}</span>}
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{appointment.status}</span>
                      </div>
                      <h2 className="mt-2 font-semibold text-foreground">{appointment.title}</h2>
                      {appointment.facility && <p className="mt-1 text-sm text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />{appointment.facility}</p>}
                      {appointment.reason && <p className="mt-2 text-sm text-muted-foreground">{appointment.reason}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateStatus(appointment.id, "completed")}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Done
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteAppointment(appointment.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
