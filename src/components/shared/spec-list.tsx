/** Spec tiles — labels/values resolved by the caller (server). */
export function SpecList({ specs }: { specs: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      {specs.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-muted/60 px-3.5 py-3 ring-1 ring-foreground/[0.04] transition-colors hover:bg-muted"
        >
          <dt className="text-xs text-muted-foreground">{s.label}</dt>
          <dd className="mt-0.5 truncate font-heading text-[0.95rem] font-semibold tabular-nums">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
