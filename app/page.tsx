import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "@/components/home/home-client";

export default async function HomePage() {
  const supabase = await createClient();
  if (!supabase) {
    return <HomeClient user={null} />;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    return <HomeClient user={user} />;
  } catch (error) {
    console.error("Failed to load Supabase user on home page:", error);
    return <HomeClient user={null} />;
  }
}
