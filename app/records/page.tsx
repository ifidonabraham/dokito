import { createClient } from "@/lib/supabase/server";
import { RecordsClient } from "@/components/records/records-client";
import { RecordsSignInRequired } from "@/components/records/records-sign-in-required";

export default async function RecordsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <RecordsSignInRequired />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <RecordsSignInRequired />;
  }

  return <RecordsClient />;
}
