/** Presentational spec rows — labels/values resolved by the caller (server). */
export function SpecList({ specs }: { specs: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
      {specs.map((s) => (
        <div
          key={s.label}
          className="flex items-baseline justify-between gap-4 border-b border-dashed pb-2"
        >
          <dt className="text-sm text-muted-foreground">{s.label}</dt>
          <dd className="text-sm font-medium tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
