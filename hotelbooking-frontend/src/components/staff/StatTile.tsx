export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-brand-soft p-5 text-center">
      <p className="text-3xl font-bold text-brand-dark">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}