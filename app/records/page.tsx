import { createClient } from "@/lib/supabase/server";
import { RecordsClient } from "@/components/records/records-client";
import { RecordsSignInRequired } from "@/components/records/records-sign-in-required";

export default async function RecordsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <RecordsSignInRequired />;
  }

  let user = null;

  try {
    const response = await supabase.auth.getUser();
    user = response.data.user;
  } catch (error) {
    console.error("Failed to load Supabase user on records page:", error);
    return <RecordsSignInRequired />;
  }

  if (!user) {
    return <RecordsSignInRequired />;
  }

  return <RecordsClient />;
}
