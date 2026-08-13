import type { CSSProperties, ReactNode } from "react";

type Texture =
  | "linen"
  | "stone"
  | "kraft"
  | "limestone"
  | "cuero-oscuro"
  | "yute-claro"
  | "yute-opaco"
  | "madera";
type OverlayColor =
  | "cuero-dark"
  | "cuero-light"
  | "piedra"
  | "hueso"
  | "blanco-roto"
  | "carbon";

const TEXTURE_FILES: Record<Texture, string> = {
  linen: "/textures/linen.jpg",
  stone: "/textures/stone.jpg",
  kraft: "/textures/kraft-paper.jpg",
  limestone: "/textures/limestone.jpg",
  "cuero-oscuro": "/textures/fondocuerooscuro.jpg",
  "yute-claro": "/textures/yuteclaro.jpg",
  "yute-opaco": "/textures/yuteopaco.jpg",
  madera: "/textures/madera.jpg",
};

const OVERLAY_HEX: Record<OverlayColor, string> = {
  "cuero-dark": "#6B4226",
  "cuero-light": "#8B5A2B",
  piedra: "#D8CFC0",
  hueso: "#E8E2D6",
  "blanco-roto": "#F5F1EA",
  carbon: "#1C1C1A",
};

const DEFAULT_OVERLAY: Record<Texture, OverlayColor> = {
  linen: "blanco-roto",
  stone: "piedra",
  kraft: "hueso",
  limestone: "hueso",
  "cuero-oscuro": "carbon",
  "yute-claro": "hueso",
  "yute-opaco": "hueso",
  madera: "carbon",
};

type Props = {
  id?: string;
  ariaLabel?: string;
  texture: Texture;
  overlay?: OverlayColor;
  overlayOpacity?: number;
  className?: string;
  children?: ReactNode;
};

export default function TexturedSection({
  id,
  ariaLabel,
  texture,
  overlay,
  overlayOpacity = 0.88,
  className = "",
  children,
}: Props) {
  const overlayColor = OVERLAY_HEX[overlay ?? DEFAULT_OVERLAY[texture]];

  const style: CSSProperties = {
    backgroundImage: `url(${TEXTURE_FILES[texture]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const overlayStyle: CSSProperties = {
    backgroundColor: overlayColor,
    opacity: Math.min(Math.max(overlayOpacity, 0), 1),
  };

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative isolate ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -z-10" style={overlayStyle} />
      {children}
    </section>
  );
}
