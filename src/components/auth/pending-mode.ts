/**
 * Which "next step" screen to show after sign-up or a blocked sign-in.
 * Lives outside the client component so server pages can use it too.
 */
export type PendingMode =
  | "email_sent"
  | "email_failed"
  | "login_blocked"
  | "email_unavailable"
  | "phone_only";

const MODES: PendingMode[] = [
  "email_sent",
  "email_failed",
  "login_blocked",
  "email_unavailable",
  "phone_only",
];

export const parsePendingMode = (v: string | undefined): PendingMode =>
  MODES.includes(v as PendingMode) ? (v as PendingMode) : "email_sent";
