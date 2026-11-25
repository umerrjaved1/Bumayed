import { env } from "@/lib/env";

/**
 * Minimal email sender. Without EMAIL_PROVIDER_API_KEY, messages are logged
 * in development so verification/reset flows remain testable locally.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  if (!env.EMAIL_PROVIDER_API_KEY) {
    console.info(
      `[email:dev] to=${input.to} subject=${input.subject}\n${input.text}`,
    );
    return;
  }

  // Provider-specific integration (Resend/SES) lands when credentials are supplied.
  // Until then, refuse rather than pretend to send.
  throw new Error(
    "EMAIL_PROVIDER_API_KEY is set but no provider adapter is configured yet",
  );
}

export function appBaseUrl(): string {
  return env.AUTH_URL ?? "http://localhost:3000";
}
