"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// SELECT CON ETIQUETAS (BASE UI)
// Base UI muestra el valor crudo por defecto; este componente
// resuelve la ETIQUETA de la opción seleccionada y mantiene el
// estado controlado (null cuando no hay selección).
// ============================================================

export type LabeledOption = { label: string; value: string | number };

export function LabeledSelect({
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar...",
  className,
  disabled,
}: {
  /** Valor actual; null/""/undefined = sin selección (controlado con null). */
  value?: string | number | null;
  onValueChange?: (value: string) => void;
  options: LabeledOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const labels = React.useMemo(
    () =>
      Object.fromEntries(options.map((o) => [String(o.value), o.label])) as Record<
        string,
        string
      >,
    [options],
  );

  const isEmpty = value == null || value === "";

  return (
    <Select
      value={isEmpty ? null : String(value)}
      onValueChange={(v) => onValueChange?.(String(v))}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {(selected: unknown) =>
            selected != null && selected !== ""
              ? (labels[String(selected)] ?? String(selected))
              : null
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">Sin opciones</div>
        )}
        {options.map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
