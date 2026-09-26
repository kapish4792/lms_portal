import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Enterprise LMS Portal",
  description: "Sign in to access your courses, certifications, and enterprise learning dashboard.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
