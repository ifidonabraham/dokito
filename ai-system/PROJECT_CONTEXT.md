# PROJECT_CONTEXT.md

## 1. Project Name

AKILI Health — AI-Powered Unified Healthcare Platform for Nigeria

---

## 2. Core Vision

Build a scalable digital health platform that:

* Gives users control over their personal health records
* Provides AI-assisted symptom understanding (NOT diagnosis)
* Connects users to real healthcare services (hospitals, pharmacies, doctors)
* Improves healthcare access, safety, and decision-making in Nigeria

This is NOT a replacement for doctors.
This is a **triage + education + access platform**.

---

## 3. Core Principles (NON-NEGOTIABLE)

### Safety First

* Never diagnose with certainty
* Never prescribe medication/dosage
* Always recommend professional care when needed
* Emergency detection must override AI responses

### Simplicity

* The UI must be usable by low-literacy users
* Actions must be obvious and minimal

### Nigerian Context

* Must support:

  * English
  * Nigerian Pidgin
  * Yoruba
  * Igbo
  * Hausa
* Must reflect Nigerian healthcare realities (PHCs, general hospitals, etc.)

---

## 4. System Architecture (High Level)

### MODULE 1 — Personal Health Records

* User-owned health data
* Vitals, medications, allergies, history

### MODULE 2 — DÓKÍTÀ AI (Symptom Checker)

* Symptom intake
* AI reasoning (educational)
* Safety engine (rule-based, runs first)

### MODULE 3 — Drug Information & Verification

* Drug search
* NAFDAC verification
* Drug interaction checking

### MODULE 4 — Facility Finder

* Find nearby hospitals, pharmacies
* Emergency navigation (Google Maps integration)

### MODULE 5 — Emergency Voice Assistant

* Voice-guided emergency support
* Real-time navigation + calming guidance

### MODULE 6 — Medication Reminders & Chronic Tracking

* Reminders (SMS/app)
* Chronic disease monitoring

---

## 5. Technology Stack

Frontend:

* Next.js 15
* TypeScript
* Tailwind CSS
* Zustand

Backend:

* Next.js API routes OR FastAPI

Database:

* PostgreSQL (main)
* PostGIS (for maps)

AI:

* LLM (Claude / OpenAI)
* Rule-based safety engine (critical layer)
* RAG for context-aware responses (later)

Integrations:

* Google Maps API
* Google Auth
* SMS (Termii)

---

## 6. AI Architecture (Critical)

### Layer 1 — Safety Engine (Highest Priority)

* Detect emergency symptoms
* If triggered → bypass LLM completely
* Return:

  * Emergency message
  * Call number
  * Google Maps hospital link

### Layer 2 — AI Reasoning (LLM)

* Educational only
* Provides:

  * Possible explanations
  * Triage advice
  * Next steps

### Layer 3 — Context Engine

* Patient history (from Module 1)
* Location
* Local disease patterns

---

## 7. Current Development Stage

PHASE 1 (ACTIVE BUILD):

* Health Records (Module 1)
* Symptom Checker (Module 2)
* Basic Facility Finder (Module 4)

NOT building yet:

* Full AI training pipelines
* Advanced ML models
* Government integrations

---

## 8. Coding Rules (VERY IMPORTANT)

* Do NOT generate entire project at once
* Work ONLY on the current task
* Do NOT modify unrelated files
* Always produce minimal working code
* Prefer clarity over complexity
* All APIs must be RESTful
* All data must be user-owned and secure

---

## 9. Output Rules for LLM

When asked to build:

1. Focus ONLY on the requested task
2. Do NOT redesign the whole system
3. Do NOT add features outside scope
4. Return only relevant files
5. Keep explanations short

---

## 10. Example Task Format

Every task will follow:

TASK:
Build [specific feature]

SCOPE:

* What to include
* What NOT to include

FILES:

* Files to modify

SUCCESS:

* What defines completion

---

## 11. Long-Term Vision (DO NOT BUILD NOW)

* AI-assisted chronic disease management
* Population health intelligence
* Real-time outbreak detection
* Nationwide healthcare data layer

---

END OF CONTEXT

