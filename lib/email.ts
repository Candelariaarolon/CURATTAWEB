import { Resend } from "resend";
import VerifyEmail from "@/emails/VerifyEmail";
import ResetPasswordEmail from "@/emails/ResetPassword";

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Falta la variable de entorno RESEND_API_KEY");
  return new Resend(apiKey);
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${getAppUrl()}/api/auth/verify?token=${token}`;
  const { error } = await getClient().emails.send({
    from: process.env.EMAIL_FROM ?? "Curatta <onboarding@resend.dev>",
    to: email,
    subject: "Confirmá tu cuenta de Curatta",
    react: VerifyEmail({ verifyUrl }),
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${getAppUrl()}/restablecer-contrasena?token=${token}`;
  const { error } = await getClient().emails.send({
    from: process.env.EMAIL_FROM ?? "Curatta <onboarding@resend.dev>",
    to: email,
    subject: "Restablecé tu contraseña de Curatta",
    react: ResetPasswordEmail({ resetUrl }),
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
