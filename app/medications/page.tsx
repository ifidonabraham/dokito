"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Pill, Plus, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  instructions?: string | null;
  reminderTimes: string[];
  isActive: boolean;
};

type MedicationLog = {
  id: string;
  medicationName?: string;
  dosage?: string;
  scheduledTime: string;
  status: "pending" | "taken" | "missed" | "skipped";
};

const emptyForm = {
  name: "",
  dosage: "",
  frequency: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  instructions: "",
  reminderTimes: "08:00",
};

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dueLogs = useMemo(
    () => logs.filter((log) => log.status === "pending").slice(0, 8),
    [logs]
  );

  useEffect(() => {
    loadMedications();
  }, []);

  async function loadMedications() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/medications");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load prescriptions");
      setMedications(data.medications || []);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load prescriptions");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveMedication(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reminderTimes: form.reminderTimes.split(",").map((time) => time.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errors?.join(", ") || data.error || "Could not save prescription");
      setForm(emptyForm);
      setIsFormOpen(false);
      await loadMedications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save prescription");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateLog(id: string, status: MedicationLog["status"]) {
    const response = await fetch(`/api/medication-logs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) await loadMedications();
  }

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Prescription Tracker</h1>
              <p className="mt-1 text-sm text-muted-foreground">Save prescriptions and track when each medicine is due.</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Prescription
            </Button>
          </div>
        </section>

        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {isFormOpen && (
          <Card>
            <CardContent className="p-5">
              <form onSubmit={saveMedication} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="med-name">Medicine name</Label>
                    <Input id="med-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Amoxicillin" />
                  </div>
                  <div>
                    <Label htmlFor="med-dosage">Dosage written on prescription</Label>
                    <Input id="med-dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="500mg" />
                  </div>
                  <div>
                    <Label htmlFor="med-frequency">How often?</Label>
                    <Input id="med-frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="Twice daily" />
                  </div>
                  <div>
                    <Label htmlFor="med-times">Reminder times</Label>
                    <Input id="med-times" value={form.reminderTimes} onChange={(e) => setForm({ ...form, reminderTimes: e.target.value })} placeholder="08:00, 20:00" />
                    <p className="mt-1 text-xs text-muted-foreground">Use 24-hour time. Separate multiple times with commas.</p>
                  </div>
                  <div>
                    <Label htmlFor="med-start">Start date</Label>
                    <Input id="med-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="med-end">End date</Label>
                    <Input id="med-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="med-instructions">Instructions</Label>
                  <Textarea id="med-instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Example: Take after food. Do not stop early." />
                </div>
                <div className="rounded-md border bg-amber-500/10 p-3 text-sm text-amber-700">
                  This tracker follows the prescription you enter. It does not prescribe medicine or change your dose.
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Prescription"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><Clock className="h-5 w-5 text-primary" />Due soon</h2>
              {isLoading ? (
                <div className="h-20 rounded-md bg-muted" />
              ) : dueLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No medicine due in the next few days.</p>
              ) : (
                <div className="space-y-3">
                  {dueLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border p-3">
                      <p className="font-medium text-foreground">{log.medicationName}</p>
                      <p className="text-sm text-muted-foreground">{log.dosage} - {new Date(log.scheduledTime).toLocaleString()}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => updateLog(log.id, "taken")}><CheckCircle2 className="mr-2 h-4 w-4" />Taken</Button>
                        <Button size="sm" variant="outline" onClick={() => updateLog(log.id, "skipped")}><SkipForward className="mr-2 h-4 w-4" />Skip</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><Pill className="h-5 w-5 text-primary" />Saved prescriptions</h2>
              {medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No prescriptions saved yet.</p>
              ) : (
                <div className="space-y-3">
                  {medications.map((medication) => (
                    <div key={medication.id} className="rounded-lg border p-3">
                      <p className="font-semibold text-foreground">{medication.name}</p>
                      <p className="text-sm text-muted-foreground">{medication.dosage} - {medication.frequency}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Times: {medication.reminderTimes.join(", ") || "None"}</p>
                      {medication.instructions && <p className="mt-2 text-sm text-muted-foreground">{medication.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
