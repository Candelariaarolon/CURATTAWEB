import { Resend } from "resend";
import { render } from "@react-email/render";
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
  // Renderizamos el HTML nosotros mismos (en vez de pasarle `react` a Resend):
  // el SDK de Resend resuelve @react-email/render con un import dinámico que
  // el bundler de Next.js empaqueta mal, y termina tirando "t is not a function".
  const html = await render(VerifyEmail({ verifyUrl }));
  const { error } = await getClient().emails.send({
    from: process.env.EMAIL_FROM ?? "Curatta <onboarding@resend.dev>",
    to: email,
    subject: "Confirmá tu cuenta de Curatta",
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${getAppUrl()}/restablecer-contrasena?token=${token}`;
  const html = await render(ResetPasswordEmail({ resetUrl }));
  const { error } = await getClient().emails.send({
    from: process.env.EMAIL_FROM ?? "Curatta <onboarding@resend.dev>",
    to: email,
    subject: "Restablecé tu contraseña de Curatta",
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
