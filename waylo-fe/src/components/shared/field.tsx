import {Input} from "@/components/ui/input";

export type FieldProps = React.ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string | null;
};

// Label + input + error message. Used by every form so spacing and a11y
// wiring (aria-invalid / aria-describedby) are defined once.
export function Field({
  id,
  label,
  error,
  labelClassName = "text-sm font-medium text-primary",
  ...props
}: FieldProps & {labelClassName?: string}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
