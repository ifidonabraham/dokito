"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Edit, FileText, Paperclip, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type HealthRecordType =
  | "diagnosis"
  | "lab_result"
  | "prescription"
  | "visit_note"
  | "immunization"
  | "surgery"
  | "other";

type HealthRecord = {
  id: string;
  userId: string;
  type: HealthRecordType;
  title: string;
  description?: string | null;
  date: string;
  provider?: string | null;
  facility?: string | null;
  attachmentUrl?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  type: HealthRecordType;
  title: string;
  date: string;
  description: string;
  provider: string;
  facility: string;
  attachmentUrl: string;
};

const RECORD_TYPES: { value: HealthRecordType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "diagnosis", label: "Diagnosis" },
  { value: "lab_result", label: "Lab Result" },
  { value: "prescription", label: "Prescription" },
  { value: "visit_note", label: "Visit Note" },
  { value: "immunization", label: "Immunization" },
  { value: "surgery", label: "Surgery" },
  { value: "other", label: "Other" },
];

const emptyForm: FormState = {
  type: "visit_note",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  provider: "",
  facility: "",
  attachmentUrl: "",
};

const ATTACHMENT_BUCKET = "health-record-attachments";

export function RecordsClient() {
  const supabase = createClient();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedType, setSelectedType] = useState<HealthRecordType | "all">("all");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    if (selectedType === "all") return records;
    return records.filter((record) => record.type === selectedType);
  }, [records, selectedType]);

  useEffect(() => {
    loadRecords(selectedType);
  }, [selectedType]);

  async function loadRecords(type: HealthRecordType | "all" = "all") {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (type !== "all") params.set("type", type);

      const response = await fetch(`/api/health-records?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load health records");
      }

      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load health records");
    } finally {
      setIsLoading(false);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function startEdit(record: HealthRecord) {
    setEditingId(record.id);
    setForm({
      type: record.type,
      title: record.title,
      date: record.date,
      description: record.description || "",
      provider: record.provider || "",
      facility: record.facility || "",
      attachmentUrl: record.attachmentUrl || "",
    });
    setAttachmentFile(null);
    setIsFormOpen(true);
  }

  async function saveRecord(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      type: form.type,
      title: form.title,
      date: form.date,
      description: form.description,
      provider: form.provider,
      facility: form.facility,
      attachmentUrl: form.attachmentUrl,
      metadata: {},
    };

    try {
      if (attachmentFile) {
        payload.attachmentUrl = await uploadAttachment(attachmentFile);
      }

      const response = await fetch(editingId ? `/api/health-records/${editingId}` : "/api/health-records", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.error || "Could not save health record");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setAttachmentFile(null);
      await loadRecords(selectedType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save health record");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadAttachment(file: File) {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Sign in again before uploading a file");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Attachment must be 10MB or smaller");
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Attachment must be a PDF, JPG, PNG, or WebP file");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return path;
  }

  async function openAttachment(path: string) {
    if (!supabase) {
      setError("Supabase is not configured");
      return;
    }

    const { data, error } = await supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrl(path, 60);
    if (error) {
      setError("Could not open attachment");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteRecord(id: string) {
    const confirmed = window.confirm("Delete this health record?");
    if (!confirmed) return;

    setError(null);
    const response = await fetch(`/api/health-records/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete health record");
      return;
    }

    setRecords((current) => current.filter((record) => record.id !== id));
  }

  function handleAttachmentChange(file: File | undefined) {
    if (!file) {
      setAttachmentFile(null);
      return;
    }

    setError(null);
    setAttachmentFile(file);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Health Records</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Save and manage your own health history.
              </p>
            </div>
            <Button onClick={startCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </section>

        <section className="flex gap-2 overflow-x-auto pb-1" aria-label="Record filters">
          {RECORD_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.value)}
              className="shrink-0"
            >
              {type.label}
            </Button>
          ))}
        </section>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isFormOpen && (
          <Card>
            <CardContent className="p-5">
              <form onSubmit={saveRecord} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="record-title">Title</Label>
                    <Input
                      id="record-title"
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                      placeholder="Malaria test result"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="record-date">Date</Label>
                    <Input
                      id="record-date"
                      type="date"
                      value={form.date}
                      onChange={(event) => setForm({ ...form, date: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="record-type">Type</Label>
                    <select
                      id="record-type"
                      value={form.type}
                      onChange={(event) => setForm({ ...form, type: event.target.value as HealthRecordType })}
                      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {RECORD_TYPES.filter((type) => type.value !== "all").map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="record-provider">Provider</Label>
                    <Input
                      id="record-provider"
                      value={form.provider}
                      onChange={(event) => setForm({ ...form, provider: event.target.value })}
                      placeholder="Doctor or provider"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="record-facility">Facility</Label>
                  <Input
                    id="record-facility"
                    value={form.facility}
                    onChange={(event) => setForm({ ...form, facility: event.target.value })}
                    placeholder="Hospital, clinic, or lab"
                  />
                </div>

                <div>
                  <Label htmlFor="record-description">Notes</Label>
                  <Textarea
                    id="record-description"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Short notes about this record"
                  />
                </div>

                <div>
                  <Label htmlFor="record-attachment">Attachment</Label>
                  <Input
                    id="record-attachment"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(event) => handleAttachmentChange(event.target.files?.[0])}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload one PDF or image, up to 10MB.
                  </p>
                  {(attachmentFile || form.attachmentUrl) && (
                    <div className="mt-2 flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                      <Paperclip className="h-4 w-4" />
                      <span className="truncate">
                        {attachmentFile?.name || "Existing attachment saved"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : editingId ? "Save Changes" : "Save Record"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <section>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 rounded-md bg-muted" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-lg font-semibold">No records yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first diagnosis, lab result, prescription, or visit note.
                </p>
                <Button onClick={startCreate} className="mt-5">
                  Add Record
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                            {record.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">{record.date}</span>
                        </div>
                        <h2 className="font-semibold text-foreground">{record.title}</h2>
                        {record.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{record.description}</p>
                        )}
                        {(record.provider || record.facility) && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {[record.provider, record.facility].filter(Boolean).join(" - ")}
                          </p>
                        )}
                        {record.attachmentUrl && (
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2 h-auto p-0"
                            onClick={() => openAttachment(record.attachmentUrl!)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Open attachment
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(record)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteRecord(record.id)} className="text-destructive">
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
        </section>
      </div>
    </div>
  );
}
