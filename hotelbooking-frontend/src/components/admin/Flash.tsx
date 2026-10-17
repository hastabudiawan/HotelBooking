export function Flash({ saved, deleted }: { saved?: string; deleted?: string }) {
  if (!saved && !deleted) return null;

  return (
    <p role="status" className="mb-6 rounded-md bg-emerald-100 px-4 py-3 text-sm text-emerald-900">
      {saved ? "Changes saved." : "Deleted."}
    </p>
  );
}