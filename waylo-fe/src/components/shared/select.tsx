export type SelectOption = {
  value: string;
  label: string;
};

export function Select({
  id,
  value,
  onChange,
  options,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={
        className ??
        "h-14 w-full rounded-[var(--radius-input)] border border-primary bg-surface px-5 text-base text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      }
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
