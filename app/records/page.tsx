import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RecordsClient } from "@/components/records/records-client";

export default async function RecordsPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/?signin=true");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?signin=true");
  }

  // Fetch user's health data
  const [vitalsRes, medicationsRes, allergiesRes, conditionsRes] = await Promise.all([
    supabase.from("vitals").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(20),
    supabase.from("medications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("allergies").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("health_conditions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <RecordsClient
      user={user}
      initialVitals={vitalsRes.data || []}
      initialMedications={medicationsRes.data || []}
      initialAllergies={allergiesRes.data || []}
      initialConditions={conditionsRes.data || []}
    />
  );
}
