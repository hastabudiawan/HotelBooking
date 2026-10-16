import { cn } from "@/lib/utils";

export const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:outline-2 focus:outline-brand/30";

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  hint?: string;
};

export function Field({ label, hint, id, className, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={hintId}
        className={cn(fieldClass, className)}
        {...props}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}