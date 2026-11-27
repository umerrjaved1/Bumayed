"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 0 = too short … 4 = strong. Simple on purpose: length first, then variety. */
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (pw.length < 8) return 0;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score) as 1 | 2 | 3 | 4;
}

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-success",
  "bg-success",
];

/** Password input with a show/hide eye and (optionally) a live strength meter. */
export function PasswordField({
  id,
  name,
  value,
  onChange,
  autoComplete,
  required = true,
  minLength,
  invalid,
  showStrength = false,
  describedBy,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  invalid?: boolean;
  showStrength?: boolean;
  describedBy?: string;
}) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);
  const score = passwordStrength(value);

  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={128}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          dir="ltr"
          className="pe-11 text-start"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          className="absolute end-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground active:scale-90"
        >
          {visible ? (
            <EyeOff className="size-[1.1rem]" aria-hidden />
          ) : (
            <Eye className="size-[1.1rem]" aria-hidden />
          )}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  i <= score ? BAR_COLORS[score] : "bg-foreground/10",
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("strengthLabel")}: {t(`strength${score}` as "strength0")}
          </p>
        </div>
      )}
    </div>
  );
}
