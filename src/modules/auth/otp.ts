import { env } from "@/lib/env";

/**
 * OTP scaffold — feature-flagged OFF (owner decision: leave SMS/OTP for now).
 * Schema (`OtpCode`) already exists. Do not call sendOtp unless the flag is on.
 */
export function isOtpEnabled(): boolean {
  return env.FEATURE_OTP_ENABLED === true;
}

export async function sendOtp(phone: string): Promise<{ ok: false; reason: string }> {
  void phone;
  if (!isOtpEnabled()) {
    return { ok: false, reason: "OTP_DISABLED" };
  }
  // Provider integration lands when the client enables SMS/OTP.
  return { ok: false, reason: "OTP_PROVIDER_NOT_CONFIGURED" };
}
