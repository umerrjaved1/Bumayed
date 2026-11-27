"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, TriangleAlert } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";
import { savePending } from "@/components/auth/pending-store";
import { PhoneField } from "@/components/auth/phone-field";
import {
  GCC_COUNTRIES,
  gccByDial,
  isValidPhone,
  normalizePhoneInput,
} from "@/modules/auth/phone";
import { cn } from "@/lib/utils";

type Field =
  | "displayName"
  | "businessName"
  | "contact"
  | "email"
  | "phone"
  | "password"
  | "terms";
type Stage = "idle" | "creating" | "signingIn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function RegisterForm({
  initialType = "individual",
  defaultDial = "971",
}: {
  /** "dealer" when arriving from "Explore dealer packages" (?type=dealer). */
  initialType?: "individual" | "dealer";
  /** Country code pre-selected from where the visitor is (for example "966"). */
  defaultDial?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [accountType, setAccountType] = useState<"individual" | "dealer">(
    initialType,
  );
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dial, setDial] = useState(defaultDial);
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const pending = stage !== "idle";

  function clear(field: Field) {
    setErrors((e) => {
      if (!e[field] && !(field === "email" || field === "phone") ) return e;
      const next = { ...e, [field]: undefined };
      if (field === "email" || field === "phone") next.contact = undefined;
      return next;
    });
    setFormError(null);
  }

  /** Checks everything up front, so the person sees every problem at once. */
  function validate() {
    const found: Partial<Record<Field, string>> = {};
    const phoneE164 = normalizePhoneInput(phone, dial);
    if (displayName.trim().length < 2) found.displayName = t("errName");
    if (accountType === "dealer" && businessName.trim().length < 2) {
      found.businessName = t("errBusiness");
    }
    if (!email.trim() && !phone.trim()) found.contact = t("errContact");
    if (email.trim() && !EMAIL_RE.test(email.trim())) found.email = t("errEmail");
    if (phone.trim() && !isValidPhone(phoneE164)) {
      found.phone = t("errPhone", {
        example: (gccByDial(dial) ?? GCC_COUNTRIES[0]!).example,
      });
    }
    if (password.length < 8) found.password = t("errPassword");
    if (!terms) found.terms = t("errTerms");
    return found;
  }

  function focusFirst(found: Partial<Record<Field, string>>) {
    const order: Field[] = [
      "displayName",
      "businessName",
      "contact",
      "email",
      "phone",
      "password",
      "terms",
    ];
    const first = order.find((f) => found[f]);
    if (!first) return;
    const id = first === "contact" ? "phone" : first === "terms" ? "acceptTerms" : first;
    const el = formRef.current?.querySelector<HTMLElement>(`#${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError(t("fixFields"));
      focusFirst(found);
      return;
    }

    const phoneE164 = normalizePhoneInput(phone, dial);
    const emailTrim = email.trim();
    setStage("creating");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          accountType,
          email: emailTrim,
          phone: phoneE164,
          password,
          locale,
          businessName: accountType === "dealer" ? businessName.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error?.message ?? t("errors.generic"));
        setStage("idle");
        return;
      }

      const mode = data.verification as string | undefined;
      // Keep the address out of the URL; the next screen reads it from the tab.
      savePending({ email: emailTrim || undefined, identifier: emailTrim || phoneE164 });

      if (mode === "email_sent" || mode === "email_failed") {
        // A link must be opened before signing in: go straight to "check your inbox".
        router.replace(`/auth/verify-pending?mode=${mode}`);
        return;
      }

      // Account is already active: sign them in so the next screen can move them forward.
      setStage("signingIn");
      const login = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: emailTrim || phoneE164, password }),
      }).catch(() => null);
      if (login?.ok) {
        router.replace(`/auth/verify-pending?mode=${mode ?? "phone_only"}`);
        router.refresh();
      } else {
        // Most likely these details were already registered: send them to sign in.
        router.replace("/auth/login?registered=1");
      }
    } catch {
      setFormError(t("errors.generic"));
      setStage("idle");
    }
  }

  const invalid = (f: Field) => !!errors[f] || undefined;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <div
        role="group"
        aria-label={t("accountType")}
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
      >
        {(["individual", "dealer"] as const).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={accountType === type}
            onClick={() => setAccountType(type)}
            className={cn(
              "h-10 rounded-lg text-sm font-semibold transition-all duration-300",
              accountType === type
                ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/5"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(type)}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        {accountType === "dealer" ? t("dealerHint") : t("individualHint")}
      </p>

      <div className="space-y-2">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input
          id="displayName"
          name="displayName"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            clear("displayName");
          }}
          autoComplete="name"
          aria-invalid={invalid("displayName")}
          aria-describedby="displayName-error"
        />
        <FieldError id="displayName-error" message={errors.displayName} />
      </div>

      {accountType === "dealer" && (
        <div className="space-y-2">
          <Label htmlFor="businessName">{t("businessName")}</Label>
          <Input
            id="businessName"
            name="businessName"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              clear("businessName");
            }}
            autoComplete="organization"
            aria-invalid={invalid("businessName")}
            aria-describedby="businessName-error"
          />
          <FieldError id="businessName-error" message={errors.businessName} />
        </div>
      )}

      <fieldset className="space-y-4 rounded-2xl border p-4">
        <legend className="px-1 text-sm font-semibold">
          {t("mobileLabel")} / {t("emailLabel")}
        </legend>
        <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("contactHint")}
        </p>
        <FieldError id="contact-error" message={errors.contact} />
        <PhoneField
          id="phone"
          label={t("mobileLabel")}
          dial={dial}
          onDialChange={(d) => {
            setDial(d);
            clear("phone");
          }}
          value={phone}
          onValueChange={(v) => {
            setPhone(v);
            clear("phone");
          }}
          invalid={!!errors.phone || !!errors.contact}
          error={errors.phone}
          helpText={t("phoneHelp")}
          describedBy="phone-hint phone-error"
        />
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            dir="ltr"
            autoComplete="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear("email");
            }}
            aria-invalid={invalid("email") || invalid("contact")}
            aria-describedby="email-error"
            className="text-start"
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <PasswordField
          id="password"
          name="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            clear("password");
          }}
          autoComplete="new-password"
          invalid={!!errors.password}
          showStrength
          describedBy="password-hint password-error"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          {t("passwordHint")}
        </p>
        <FieldError id="password-error" message={errors.password} />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2.5">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={terms}
            onChange={(e) => {
              setTerms(e.target.checked);
              clear("terms");
            }}
            aria-invalid={invalid("terms")}
            className="mt-0.5 size-5 shrink-0 accent-primary"
          />
          <Label
            htmlFor="acceptTerms"
            className="text-sm leading-snug font-normal"
          >
            <span>
              {t.rich("acceptTerms", {
                terms: (chunks) => (
                  <Link
                    href="/terms"
                    className="font-medium text-primary underline"
                  >
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link
                    href="/privacy"
                    className="font-medium text-primary underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </Label>
        </div>
        <FieldError id="terms-error" message={errors.terms} />
      </div>

      {/* Errors sit right above the button, where the eye already is */}
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{formError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        className="h-12 w-full rounded-xl text-base font-semibold"
        disabled={pending}
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {stage === "signingIn"
          ? t("signingYouIn")
          : stage === "creating"
            ? t("creating")
            : t("createAccount")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/auth/login" className="font-semibold text-primary">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
