import ForgotPasswordPage from "../forgot-password/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Enterprise LMS Portal",
  description: "Reset and restore your account credentials securely.",
};

export default function ResetPasswordPage() {
  return <ForgotPasswordPage />;
}
