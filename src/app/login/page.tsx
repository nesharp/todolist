"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="mx-auto max-w-md px-4 pb-20 pt-10 md:px-8 md:pt-16">
        <div className="flex flex-col items-center justify-center p-10 text-center bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Todo List</h2>
          <p className="text-muted-foreground mb-6">Please sign in with Google to start managing your tasks.</p>
          <Button
            variant="default"
            size="lg"
            onClick={async () => {
              await signIn.social({ provider: "google", callbackURL: "/" });
            }}
          >
            Sign In with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
