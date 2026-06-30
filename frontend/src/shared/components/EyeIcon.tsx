// src/shared/components/EyeIcon.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * EyeIcon — Icono SVG para mostrar/ocultar contraseña
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza un ojo abierto (open=true) o cerrado (open=false)
 * usando paths SVG. Usado en formularios que requieren toggle
 * de visibilidad de contraseña.
 *
 * Capa: UI (shared component)
 * Dependencias: none (pure SVG)
 * Props: open, size?
 *
 * @module EyeIcon
 */
interface Props {
  open: boolean;
  size?: number;
}

export default function EyeIcon({ open, size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}