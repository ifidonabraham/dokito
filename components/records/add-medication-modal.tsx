"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHealthStore } from "@/stores/health-store";

interface AddMedicationModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddMedicationModal({ open, onClose }: AddMedicationModalProps) {
  const { addMedication } = useHealthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    times: ["08:00"],
    instructions: "",
  });

  const handleAddTime = () => {
    setFormData({
      ...formData,
      times: [...formData.times, "12:00"],
    });
  };

  const handleRemoveTime = (index: number) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index),
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dosage) return;

    addMedication({
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: formData.times,
      instructions: formData.instructions || undefined,
      startDate: new Date().toISOString(),
      isActive: true,
    });

    setFormData({
      name: "",
      dosage: "",
      frequency: "daily",
      times: ["08:00"],
      instructions: "",
    });
    
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Add Medication</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Medication Name */}
            <div>
              <Label htmlFor="name" className="text-foreground">Medication Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Paracetamol"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {/* Dosage */}
            <div>
              <Label htmlFor="dosage" className="text-foreground">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <Label htmlFor="frequency" className="text-foreground">Frequency</Label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="once">Once daily</option>
                <option value="twice">Twice daily</option>
                <option value="three_times">Three times daily</option>
                <option value="four_times">Four times daily</option>
                <option value="as_needed">As needed</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Times */}
            <div>
              <Label className="text-foreground">Reminder Times</Label>
              <div className="mt-1 space-y-2">
                {formData.times.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.times.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveTime(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTime}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Time
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="instructions" className="text-foreground">Instructions (optional)</Label>
              <Input
                id="instructions"
                placeholder="e.g., Take with food"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Medication
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
