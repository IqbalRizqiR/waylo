"use client";

import {useCallback} from "react";
import {Input} from "@/components/ui/input";

const formatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatDisplay(raw: string): string {
  if (!raw) return "";
  const n = Number(raw);
  if (Number.isNaN(n)) return "";
  return formatter.format(n);
}

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export type CurrencyFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  error?: string | null;
  labelClassName?: string;
};

export function CurrencyField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  labelClassName = "text-sm font-medium text-primary",
}: CurrencyFieldProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(stripNonDigits(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-primary">
          Rp
        </span>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          className="pl-12"
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
