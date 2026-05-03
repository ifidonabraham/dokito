"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHealthStore } from "@/stores/health-store";

interface AddAllergyModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddAllergyModal({ open, onClose }: AddAllergyModalProps) {
  const { addAllergy } = useHealthStore();
  
  const [formData, setFormData] = useState({
    allergen: "",
    type: "drug",
    reaction: "",
    severity: "mild",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.allergen || !formData.reaction) return;

    addAllergy({
      allergen: formData.allergen,
      type: formData.type as "drug" | "food" | "environmental" | "other",
      reaction: formData.reaction,
      severity: formData.severity as "mild" | "moderate" | "severe",
    });

    setFormData({
      allergen: "",
      type: "drug",
      reaction: "",
      severity: "mild",
    });
    
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Add Allergy</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Allergen */}
            <div>
              <Label htmlFor="allergen" className="text-foreground">Allergen *</Label>
              <Input
                id="allergen"
                placeholder="e.g., Penicillin, Peanuts"
                value={formData.allergen}
                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type" className="text-foreground">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="drug">Drug/Medication</option>
                <option value="food">Food</option>
                <option value="environmental">Environmental</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Reaction */}
            <div>
              <Label htmlFor="reaction" className="text-foreground">Reaction *</Label>
              <Input
                id="reaction"
                placeholder="e.g., Rash, Difficulty breathing"
                value={formData.reaction}
                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {/* Severity */}
            <div>
              <Label htmlFor="severity" className="text-foreground">Severity</Label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe (Anaphylaxis risk)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Allergy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
