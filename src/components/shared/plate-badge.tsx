import { cn } from "@/lib/utils";
import type { PlateEmirate, PlateType } from "@/modules/listings/plates";

/** Real UAE plates print the emirate in Arabic and English, whatever the page language. */
const EMIRATE_NAMES: Record<PlateEmirate, { en: string; ar: string }> = {
  AUH: { en: "Abu Dhabi", ar: "أبوظبي" },
  DXB: { en: "Dubai", ar: "دبي" },
  SHJ: { en: "Sharjah", ar: "الشارقة" },
  AJM: { en: "Ajman", ar: "عجمان" },
  UAQ: { en: "Umm Al Quwain", ar: "أم القيوين" },
  RAK: { en: "Ras Al Khaimah", ar: "رأس الخيمة" },
  FUJ: { en: "Fujairah", ar: "الفجيرة" },
};

const SIZES = {
  sm: {
    box: "min-w-44 gap-0.5 rounded-md border-2 px-3 py-1.5",
    name: "text-[0.6rem]",
    main: "text-3xl gap-2.5",
  },
  lg: {
    box: "min-w-64 gap-1 rounded-xl border-[3px] px-6 py-3 sm:min-w-80",
    name: "text-xs sm:text-sm",
    main: "text-5xl gap-4 sm:text-6xl",
  },
} as const;

const TYPE_STYLE: Record<PlateType, string> = {
  private: "bg-white border-neutral-900",
  // Motorcycle plates are squarer on the road; a slightly warmer tone tells them apart here.
  motorcycle: "bg-amber-50 border-neutral-900",
  classic: "bg-stone-100 border-stone-700",
};

export function plateEmirateName(code: PlateEmirate, locale: "en" | "ar") {
  return EMIRATE_NAMES[code][locale];
}

/**
 * A UAE-style number plate. Always left-to-right inside (plates read the same
 * in both page languages); the label makes it readable to screen readers.
 */
export function PlateBadge({
  emirate,
  code,
  number,
  type = "private",
  size = "sm",
  label,
  className,
}: {
  emirate: PlateEmirate;
  code: string;
  number: string;
  type?: PlateType;
  size?: keyof typeof SIZES;
  /** Spoken name, e.g. "Dubai plate A 1234". */
  label: string;
  className?: string;
}) {
  const s = SIZES[size];
  const name = EMIRATE_NAMES[emirate];
  return (
    <div
      role="img"
      aria-label={label}
      dir="ltr"
      className={cn(
        "inline-flex flex-col items-stretch text-neutral-900 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] select-none",
        TYPE_STYLE[type],
        s.box,
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "flex items-center justify-between font-semibold tracking-wide",
          s.name,
        )}
      >
        <span>{name.en}</span>
        <span lang="ar" dir="rtl">
          {name.ar}
        </span>
      </div>
      <div
        aria-hidden
        className={cn(
          "flex items-baseline justify-center font-heading leading-none font-extrabold tabular-nums",
          s.main,
        )}
      >
        <span>{code}</span>
        <span>{number}</span>
      </div>
    </div>
  );
}
