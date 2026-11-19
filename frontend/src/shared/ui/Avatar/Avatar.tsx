import { useState } from "react";
import { cn } from "../../lib/cn";
import "./Avatar.scss";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  /** Если рядом уже есть имя текстом, аватар скрывается от скринридеров. */
  decorative?: boolean;
  className?: string;
}

const SIZE_PX: Record<AvatarSize, number> = { sm: 34, md: 44, lg: 56, xl: 88 };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, src, size = "md", decorative = false, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const classes = cn("avatar", `avatar--${size}`, className);
  const px = SIZE_PX[size];

  if (src && !failed) {
    return (
      <img
        className={classes}
        src={src}
        alt={decorative ? "" : name}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={classes}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
    >
      {getInitials(name)}
    </span>
  );
}
