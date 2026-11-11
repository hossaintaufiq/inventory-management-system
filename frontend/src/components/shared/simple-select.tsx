"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

/** Thin wrapper over the Base UI select for the common value/options case. */
export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  size,
  id,
  invalid,
  disabled,
}: {
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "default";
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  return (
    <Select
      items={options}
      value={value ?? null}
      onValueChange={(v) => v != null && onValueChange(v as string)}
      disabled={disabled}
    >
      <SelectTrigger id={id} size={size} aria-invalid={invalid || undefined} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
