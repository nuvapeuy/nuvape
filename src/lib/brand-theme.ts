import type { CSSProperties } from "react";

// Tema por marca: cada marca puede tener su color de acento (Brand.color, "#rrggbb").
// Los componentes de producto usan var(--brand-accent), que por defecto es el violeta de NUVAPE.

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function brandAccentStyle(color: string | null | undefined): CSSProperties | undefined {
  return isHexColor(color) ? ({ "--brand-accent": color } as CSSProperties) : undefined;
}
