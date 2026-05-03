"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHealthStore } from "@/stores/health-store";

interface AddVitalsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddVitalsModal({ open, onClose }: AddVitalsModalProps) {
  const { addVitalRecord } = useHealthStore();
  
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    bloodSugar: "",
    temperature: "",
    weight: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addVitalRecord({
      bloodPressure: formData.systolic && formData.diastolic ? {
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
      } : undefined,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      notes: formData.notes || undefined,
    });

    setFormData({
      systolic: "",
      diastolic: "",
      heartRate: "",
      bloodSugar: "",
      temperature: "",
      weight: "",
      notes: "",
    });
    
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Add Vital Reading</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Blood Pressure */}
            <div>
              <Label className="text-foreground">Blood Pressure (mmHg)</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={formData.systolic}
                  onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                />
                <span className="flex items-center text-muted-foreground">/</span>
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={formData.diastolic}
                  onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <Label htmlFor="heartRate" className="text-foreground">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="e.g., 72"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Blood Sugar */}
            <div>
              <Label htmlFor="bloodSugar" className="text-foreground">Blood Sugar (mg/dL)</Label>
              <Input
                id="bloodSugar"
                type="number"
                step="0.1"
                placeholder="e.g., 100"
                value={formData.bloodSugar}
                onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Temperature */}
            <div>
              <Label htmlFor="temperature" className="text-foreground">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="e.g., 36.5"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Weight */}
            <div>
              <Label htmlFor="weight" className="text-foreground">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 70"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-foreground">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Reading
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
