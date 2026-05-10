"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const googleOn = googleEnabled;

  async function submitEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "sign-up") {
        await signUp.email({
          email: email.trim(),
          password,
          name: email.trim().split("@")[0] || "User",
        });
      } else {
        await signIn.email({
          email: email.trim(),
          password,
        });
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Sign-in failed";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="mx-auto max-w-md px-4 pb-20 pt-10 md:px-8 md:pt-16">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card/60 p-10 text-center shadow-xl backdrop-blur-xl">
          <h2 className="mb-2 text-2xl font-semibold">Welcome to Todo List</h2>

          {googleOn ? (
            <>
              <p className="mb-4 text-muted-foreground">
                Sign in with Google or use email below.
              </p>
              <Button
                variant="default"
                size="lg"
                className="w-full max-w-sm"
                onClick={async () => {
                  await signIn.social({
                    provider: "google",
                    callbackURL: "/",
                  });
                }}
              >
                Sign in with Google
              </Button>
              <div className="relative my-6 w-full max-w-sm">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    or email
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="mb-4 text-sm text-muted-foreground">
              Sign in with email and password.
            </p>
          )}

          <form
            onSubmit={submitEmailAuth}
            className="flex w-full max-w-sm flex-col gap-4 text-left"
          >
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-muted-foreground"
              >
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-muted-foreground"
              >
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                minLength={8}
                className="h-11 rounded-xl"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="h-11 rounded-xl"
              disabled={pending}
            >
              {mode === "sign-up" ? "Create account" : "Sign in"}
            </Button>
            <button
              type="button"
              className={cn(
                "text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
              )}
              onClick={() => {
                setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
                setError(null);
              }}
            >
              {mode === "sign-in"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>

          {!googleOn ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Optional: add Google OAuth to <code className="text-foreground">.env</code>{" "}
              for &quot;Sign in with Google&quot;.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
