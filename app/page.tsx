import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "@/components/home/home-client";

export default async function HomePage() {
  const supabase = await createClient();
  if (!supabase) {
    return <HomeClient user={null} />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  return <HomeClient user={user} />;
}
