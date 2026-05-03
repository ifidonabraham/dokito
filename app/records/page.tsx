"use client";

import { useState } from "react";
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
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHealthStore } from "@/stores/health-store";
import { AddVitalsModal } from "@/components/records/add-vitals-modal";
import { AddMedicationModal } from "@/components/records/add-medication-modal";
import { AddAllergyModal } from "@/components/records/add-allergy-modal";

export default function RecordsPage() {
  const [showAddVitals, setShowAddVitals] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  
  const { vitals, medications, allergies } = useHealthStore();

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health Records</h1>
          <p className="text-muted-foreground">Track and manage your health data</p>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="vitals" className="gap-2">
            <Activity className="h-4 w-4" />
            Vitals
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-2">
            <Pill className="h-4 w-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="allergies" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Allergies
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
                <h3 className="mb-2 font-semibold text-foreground">No vitals recorded</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Start tracking your blood pressure, heart rate, and more.
                </p>
                <Button onClick={() => setShowAddVitals(true)}>
                  Add Your First Reading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vitals.map((vital) => (
                <Card key={vital.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(vital.recordedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(vital.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vital.bloodPressure && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-destructive" />
                          <span className="text-sm text-muted-foreground">Blood Pressure</span>
                        </div>
                        <span className="font-medium text-foreground">
                          {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg
                        </span>
                      </div>
                    )}
                    {vital.heartRate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Heart Rate</span>
                        </div>
                        <span className="font-medium text-foreground">{vital.heartRate} bpm</span>
                      </div>
                    )}
                    {vital.bloodSugar && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">Blood Sugar</span>
                        </div>
                        <span className="font-medium text-foreground">{vital.bloodSugar} mg/dL</span>
                      </div>
                    )}
                    {vital.temperature && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-muted-foreground">Temperature</span>
                        </div>
                        <span className="font-medium text-foreground">{vital.temperature}°C</span>
                      </div>
                    )}
                    {vital.weight && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Weight</span>
                        </div>
                        <span className="font-medium text-foreground">{vital.weight} kg</span>
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
                <h3 className="mb-2 font-semibold text-foreground">No medications added</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Add your medications to get reminders and track your schedule.
                </p>
                <Button onClick={() => setShowAddMedication(true)}>
                  Add Your First Medication
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {medications.map((med) => (
                <Card key={med.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 ${med.isActive ? "bg-primary/10" : "bg-muted"}`}>
                          <Pill className={`h-5 w-5 ${med.isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{med.name}</h3>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          <p className="text-xs text-muted-foreground">
                            {med.frequency} {med.times.length > 0 && `at ${med.times.join(", ")}`}
                          </p>
                          {med.instructions && (
                            <p className="mt-1 text-xs text-muted-foreground">{med.instructions}</p>
                          )}
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        med.isActive 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {med.isActive ? "Active" : "Inactive"}
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
                <h3 className="mb-2 font-semibold text-foreground">No allergies recorded</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Record your allergies to help healthcare providers give you safe care.
                </p>
                <Button onClick={() => setShowAddAllergy(true)}>
                  Add Your First Allergy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allergies.map((allergy) => (
                <Card key={allergy.id}>
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
                        <h3 className="font-semibold text-foreground">{allergy.allergen}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{allergy.type}</p>
                        <p className="text-xs text-muted-foreground">{allergy.reaction}</p>
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

      {/* Modals */}
      <AddVitalsModal open={showAddVitals} onClose={() => setShowAddVitals(false)} />
      <AddMedicationModal open={showAddMedication} onClose={() => setShowAddMedication(false)} />
      <AddAllergyModal open={showAddAllergy} onClose={() => setShowAddAllergy(false)} />
    </div>
  );
}
