"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Heart,
  Activity,
  Pill,
  AlertCircle,
  Plus,
  Calendar,
  TrendingUp,
  Droplet,
  Thermometer,
  Scale,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Vital {
  id: string;
  user_id: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  blood_sugar: number | null;
  temperature: number | null;
  weight_kg: number | null;
  oxygen_saturation: number | null;
  notes: string | null;
  recorded_at: string;
}

interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  reminder_times: string[] | null;
  instructions: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface Allergy {
  id: string;
  user_id: string;
  allergen: string;
  severity: string;
  reaction: string | null;
}

interface Condition {
  id: string;
  user_id: string;
  name: string;
  diagnosed_date: string | null;
  status: string;
  notes: string | null;
}

interface RecordsClientProps {
  user: User;
  initialVitals: Vital[];
  initialMedications: Medication[];
  initialAllergies: Allergy[];
  initialConditions: Condition[];
}

export function RecordsClient({
  user,
  initialVitals,
  initialMedications,
  initialAllergies,
  initialConditions,
}: RecordsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [vitals, setVitals] = useState<Vital[]>(initialVitals);
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies);
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  const [showAddVitals, setShowAddVitals] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vitals form state
  const [vitalForm, setVitalForm] = useState({
    systolic_bp: "",
    diastolic_bp: "",
    heart_rate: "",
    blood_sugar: "",
    temperature: "",
    weight: "",
    oxygen_saturation: "",
    notes: "",
  });

  // Medication form state
  const [medForm, setMedForm] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    instructions: "",
  });

  // Allergy form state
  const [allergyForm, setAllergyForm] = useState({
    allergen: "",
    allergy_type: "medication",
    severity: "mild",
    reaction: "",
  });

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("vitals")
      .insert({
        user_id: user.id,
        blood_pressure_systolic: vitalForm.systolic_bp ? parseInt(vitalForm.systolic_bp) : null,
        blood_pressure_diastolic: vitalForm.diastolic_bp ? parseInt(vitalForm.diastolic_bp) : null,
        heart_rate: vitalForm.heart_rate ? parseInt(vitalForm.heart_rate) : null,
        blood_sugar: vitalForm.blood_sugar ? parseFloat(vitalForm.blood_sugar) : null,
        temperature: vitalForm.temperature ? parseFloat(vitalForm.temperature) : null,
        weight_kg: vitalForm.weight ? parseFloat(vitalForm.weight) : null,
        oxygen_saturation: vitalForm.oxygen_saturation ? parseInt(vitalForm.oxygen_saturation) : null,
        notes: vitalForm.notes || null,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setVitals([data, ...vitals]);
      setVitalForm({
        systolic_bp: "",
        diastolic_bp: "",
        heart_rate: "",
        blood_sugar: "",
        temperature: "",
        weight: "",
        oxygen_saturation: "",
        notes: "",
      });
      setShowAddVitals(false);
    }

    setIsSubmitting(false);
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("medications")
      .insert({
        user_id: user.id,
        name: medForm.name,
        dosage: medForm.dosage,
        frequency: medForm.frequency,
        reminder_times: [],
        start_date: new Date().toISOString().slice(0, 10),
        instructions: medForm.instructions || null,
        is_active: true,
      })
      .select()
      .single();

    if (!error && data) {
      setMedications([data, ...medications]);
      setMedForm({ name: "", dosage: "", frequency: "daily", instructions: "" });
      setShowAddMedication(false);
    }

    setIsSubmitting(false);
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("allergies")
      .insert({
        user_id: user.id,
        allergen: allergyForm.allergen,
        severity: allergyForm.severity,
        reaction: allergyForm.reaction || null,
      })
      .select()
      .single();

    if (!error && data) {
      setAllergies([data, ...allergies]);
      setAllergyForm({ allergen: "", allergy_type: "medication", severity: "mild", reaction: "" });
      setShowAddAllergy(false);
    }

    setIsSubmitting(false);
  };

  const handleDeleteVital = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from("vitals").delete().eq("id", id);
    if (!error) {
      setVitals(vitals.filter((v) => v.id !== id));
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (!error) {
      setMedications(medications.filter((m) => m.id !== id));
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from("allergies").delete().eq("id", id);
    if (!error) {
      setAllergies(allergies.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Health Records</h1>
        <p className="text-muted-foreground">Track and manage your health data</p>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="vitals" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Medications</span>
          </TabsTrigger>
          <TabsTrigger value="allergies" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Allergies</span>
          </TabsTrigger>
        </TabsList>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddVitals(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Reading
            </Button>
          </div>

          {vitals.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">No vitals recorded</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Start tracking your blood pressure, heart rate, and more.
                </p>
                <Button onClick={() => setShowAddVitals(true)}>
                  Add Your First Reading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vitals.map((vital) => (
                <Card key={vital.id} className="group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDeleteVital(vital.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(vital.recorded_at).toLocaleDateString()}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(vital.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vital.blood_pressure_systolic && vital.blood_pressure_diastolic && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Heart className="h-4 w-4 text-destructive" />
                          Blood Pressure
                        </span>
                        <span className="font-medium">{vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg</span>
                      </div>
                    )}
                    {vital.heart_rate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Heart Rate
                        </span>
                        <span className="font-medium">{vital.heart_rate} bpm</span>
                      </div>
                    )}
                    {vital.blood_sugar && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Droplet className="h-4 w-4 text-amber-500" />
                          Blood Sugar
                        </span>
                        <span className="font-medium">{vital.blood_sugar} mg/dL</span>
                      </div>
                    )}
                    {vital.temperature && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          Temperature
                        </span>
                        <span className="font-medium">{vital.temperature}°C</span>
                      </div>
                    )}
                    {vital.weight_kg && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Scale className="h-4 w-4 text-blue-500" />
                          Weight
                        </span>
                        <span className="font-medium">{vital.weight_kg} kg</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddMedication(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </div>

          {medications.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <Pill className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">No medications added</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Add your medications to track your schedule.
                </p>
                <Button onClick={() => setShowAddMedication(true)}>
                  Add Your First Medication
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {medications.map((med) => (
                <Card key={med.id} className="group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDeleteMedication(med.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${med.is_active ? "bg-primary/10" : "bg-muted"}`}>
                        <Pill className={`h-5 w-5 ${med.is_active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        <p className="text-xs text-muted-foreground capitalize">{med.frequency}</p>
                        {med.instructions && (
                          <p className="mt-1 text-xs text-muted-foreground truncate">{med.instructions}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                        med.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {med.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddAllergy(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Allergy
            </Button>
          </div>

          {allergies.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">No allergies recorded</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Record your allergies to help healthcare providers.
                </p>
                <Button onClick={() => setShowAddAllergy(true)}>
                  Add Your First Allergy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allergies.map((allergy) => (
                <Card key={allergy.id} className="group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDeleteAllergy(allergy.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        allergy.severity === "severe"
                          ? "bg-destructive/10"
                          : allergy.severity === "moderate"
                          ? "bg-amber-500/10"
                          : "bg-muted"
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          allergy.severity === "severe"
                            ? "text-destructive"
                            : allergy.severity === "moderate"
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{allergy.allergen}</h3>
                        <p className="text-sm text-muted-foreground">Allergy</p>
                        {allergy.reaction && (
                          <p className="text-xs text-muted-foreground">{allergy.reaction}</p>
                        )}
                        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs capitalize ${
                          allergy.severity === "severe"
                            ? "bg-destructive/10 text-destructive"
                            : allergy.severity === "moderate"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {allergy.severity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Vitals Modal */}
      <Dialog open={showAddVitals} onOpenChange={setShowAddVitals}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Vital Signs</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVitals} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="systolic">Systolic BP</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={vitalForm.systolic_bp}
                  onChange={(e) => setVitalForm({ ...vitalForm, systolic_bp: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="diastolic">Diastolic BP</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={vitalForm.diastolic_bp}
                  onChange={(e) => setVitalForm({ ...vitalForm, diastolic_bp: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                placeholder="72"
                value={vitalForm.heart_rate}
                onChange={(e) => setVitalForm({ ...vitalForm, heart_rate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="blood_sugar">Blood Sugar (mg/dL)</Label>
              <Input
                id="blood_sugar"
                type="number"
                step="0.1"
                placeholder="100"
                value={vitalForm.blood_sugar}
                onChange={(e) => setVitalForm({ ...vitalForm, blood_sugar: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={vitalForm.temperature}
                onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70"
                value={vitalForm.weight}
                onChange={(e) => setVitalForm({ ...vitalForm, weight: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={vitalForm.notes}
                onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Vitals"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Medication Modal */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMedication} className="space-y-4">
            <div>
              <Label htmlFor="med_name">Medication Name</Label>
              <Input
                id="med_name"
                placeholder="e.g., Paracetamol"
                value={medForm.name}
                onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg"
                value={medForm.dosage}
                onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={medForm.frequency} onValueChange={(v) => setMedForm({ ...medForm, frequency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once Daily</SelectItem>
                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                  <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                placeholder="e.g., Take with food"
                value={medForm.instructions}
                onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Medication"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Allergy Modal */}
      <Dialog open={showAddAllergy} onOpenChange={setShowAddAllergy}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAllergy} className="space-y-4">
            <div>
              <Label htmlFor="allergen">Allergen</Label>
              <Input
                id="allergen"
                placeholder="e.g., Penicillin"
                value={allergyForm.allergen}
                onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="allergy_type">Type</Label>
              <Select value={allergyForm.allergy_type} onValueChange={(v) => setAllergyForm({ ...allergyForm, allergy_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={allergyForm.severity} onValueChange={(v) => setAllergyForm({ ...allergyForm, severity: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reaction">Reaction (optional)</Label>
              <Textarea
                id="reaction"
                placeholder="Describe the reaction..."
                value={allergyForm.reaction}
                onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Allergy"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
