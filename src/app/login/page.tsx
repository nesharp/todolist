import { LoginForm } from "./login-form";
import { isGoogleAuthConfigured } from "@/lib/auth";

export default function LoginPage() {
  const googleEnabled = isGoogleAuthConfigured();
  return <LoginForm googleEnabled={googleEnabled} />;
}
