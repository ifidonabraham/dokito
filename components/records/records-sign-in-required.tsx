"use client";

import Link from "next/link";
import { FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function RecordsSignInRequired() {
  const supabase = createClient();

  async function handleSignIn() {
    if (!supabase) return;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-28 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in to view Health Records</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Health Records are private and protected. Sign in so DOKITO can show only your own records.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={handleSignIn}>Sign in with Google</Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
