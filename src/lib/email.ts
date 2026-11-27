import { env } from "@/lib/env";

/**
 * True once both EMAIL_PROVIDER_API_KEY and EMAIL_FROM are set. Until then
 * no message can leave the server, so flows that depend on an emailed link
 * (verification, password reset) must not trap people.
 */
export function isEmailDeliveryConfigured(): boolean {
  return Boolean(env.EMAIL_PROVIDER_API_KEY && env.EMAIL_FROM);
}

/**
 * Sends an email through Resend (https://resend.com), the provider this
 * project is set up for. Returns true when the provider accepted the
 * message. Without credentials the message is logged for local testing and
 * false is returned. A rejected send throws, so callers can tell the user.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!isEmailDeliveryConfigured()) {
    console.info(
      `[email:dev] to=${input.to} subject=${input.subject}\n${input.text}`,
    );
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Email provider rejected the message (${res.status}) ${detail}`.trim());
  }
  return true;
}

export function appBaseUrl(): string {
  return env.AUTH_URL ?? "http://localhost:3000";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Simple branded email with one big button; works in every mail app. */
export function actionEmailHtml(input: {
  dir: "ltr" | "rtl";
  /** Brand name in the email's language. */
  brand: string;
  heading: string;
  body: string;
  buttonLabel: string;
  link: string;
  footnote: string;
}): string {
  const link = escapeHtml(input.link);
  return `<!doctype html><html dir="${input.dir}"><body style="margin:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f1b2d">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:20px;font-weight:800;color:#12294d">${escapeHtml(input.brand)}</td></tr>
<tr><td style="padding-top:20px;font-size:22px;font-weight:700">${escapeHtml(input.heading)}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#44516a">${escapeHtml(input.body)}</td></tr>
<tr><td style="padding:24px 0"><a href="${link}" style="display:inline-block;background:#f0a830;color:#1b2740;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:12px">${escapeHtml(input.buttonLabel)}</a></td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#7a8499">${escapeHtml(input.footnote)}<br><span style="word-break:break-all">${link}</span></td></tr>
</table></td></tr></table></body></html>`;
}
