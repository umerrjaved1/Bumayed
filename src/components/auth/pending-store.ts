/**
 * Remembers which email or number the verification screen is about, for this
 * browser tab only. It stays out of the URL (so it is not left in history or
 * server logs). Storage can be blocked, so every access is guarded.
 */
const KEY = "bumayed:pending-verification";

export type PendingVerification = {
  /** Email address, when the person signed up or signed in with one. */
  email?: string;
  /** Whatever they typed to sign in (email or mobile), used to request a new link. */
  identifier?: string;
};

export function savePending(value: PendingVerification) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage blocked: the screen falls back to generic wording */
  }
}

export function readPending(): PendingVerification {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingVerification) : {};
  } catch {
    return {};
  }
}

export function clearPending() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** a***@gmail.com */
export function maskEmail(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) return email;
  const shown = name.slice(0, Math.min(2, Math.max(1, name.length - 1)));
  return `${shown}${"*".repeat(Math.max(2, name.length - shown.length))}@${domain}`;
}

/** Link that opens the person's inbox directly when we recognise the provider. */
export function inboxLink(email: string | undefined): string {
  const domain = email?.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return "https://mail.google.com/mail/u/0/#inbox";
  }
  if (/^(outlook|hotmail|live|msn)\./.test(domain)) {
    return "https://outlook.live.com/mail/0/inbox";
  }
  if (/^yahoo\./.test(domain) || domain === "ymail.com") {
    return "https://mail.yahoo.com/";
  }
  if (domain === "icloud.com" || domain === "me.com") {
    return "https://www.icloud.com/mail";
  }
  return "mailto:";
}
