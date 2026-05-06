"use client";

import { 
  Heart, 
  Shield, 
  Stethoscope, 
  MapPin, 
  Bell, 
  Pill,
  MessageSquare,
  Clock,
  Languages,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { DokitoLogo } from "@/components/brand/dokito-logo";

const features = [
  {
    icon: Stethoscope,
    title: "Dokito AI Symptom Checker",
    description: "Describe your symptoms in any Nigerian language and get instant health guidance.",
  },
  {
    icon: Heart,
    title: "Personal Health Records",
    description: "Securely store your vitals, medications, allergies, and medical history.",
  },
  {
    icon: MapPin,
    title: "Find Healthcare Facilities",
    description: "Locate nearby hospitals, pharmacies, and clinics with real-time navigation.",
  },
  {
    icon: Pill,
    title: "Drug Information",
    description: "Verify medications with NAFDAC and check for drug interactions.",
  },
  {
    icon: Bell,
    title: "Medication Reminders",
    description: "Never miss a dose with smart medication and appointment reminders.",
  },
  {
    icon: Shield,
    title: "Emergency Response",
    description: "One-tap emergency access with voice assistance and live navigation.",
  },
];

const stats = [
  { value: "24/7", label: "AI Availability" },
  { value: "5+", label: "Languages Supported" },
  { value: "10K+", label: "Facilities Listed" },
  { value: "100%", label: "Free to Use" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Nigeria&apos;s First AI Health Platform
              </div>
              
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl xl:text-6xl">
                Your Health, <br />
                <span className="text-primary">Simplified</span>
              </h1>
              
              <p className="mb-8 max-w-lg text-pretty text-lg text-muted-foreground lg:text-xl">
                Meet Dokito AI - your personal health assistant. Check symptoms, 
                find facilities, track medications, and access emergency help in 
                English, Pidgin, Yoruba, Igbo, or Hausa.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <div className="w-full max-w-xs">
                  <GoogleAuthButton />
                </div>
                <Button variant="outline" size="lg" className="w-full max-w-xs gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Try Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>24/7 Available</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Preview */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
                {/* Mock Chat Interface */}
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Dokito AI</p>
                    <p className="text-xs text-muted-foreground">Always here to help</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* User Message */}
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3">
                    <p className="text-sm text-primary-foreground">
                      I dey feel headache and fever since yesterday
                    </p>
                  </div>

                  {/* AI Response */}
                  <div className="mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <p className="text-sm text-foreground">
                      I understand you&apos;re experiencing headache and fever. Let me ask a few questions to better understand your symptoms. 
                      How severe is the headache on a scale of 1-10?
                    </p>
                  </div>

                  {/* Typing Indicator */}
                  <div className="mr-auto flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>

                {/* Language Indicator */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Supports: English, Pidgin, Yoruba, Igbo, Hausa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold text-foreground lg:text-4xl">
              Everything You Need for Better Health
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              DOKITO brings together AI-powered health guidance, medical records,
              facility finding, and emergency response in one simple platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-primary-foreground lg:text-4xl">
            Start Your Health Journey Today
          </h2>
          <p className="mb-8 text-pretty text-primary-foreground/80">
            Join Nigerians using DOKITO for simpler healthcare support.
            It&apos;s free, secure, and available 24/7.
          </p>
          <div className="mx-auto max-w-xs">
            <GoogleAuthButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <DokitoLogo className="text-base" />
            </div>
            <p className="text-sm text-muted-foreground">
              2026 DOKITO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
