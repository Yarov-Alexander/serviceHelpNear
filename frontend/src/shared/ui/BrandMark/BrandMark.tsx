import { cn } from "../../lib/cn";
import { IconHeartPlus } from "../Icons";
import "./BrandMark.scss";

interface BrandMarkProps {
  href?: string;
  /** light — для тёмного фона (подвал) */
  tone?: "dark" | "light";
  className?: string;
}

export function BrandMark({ href = "/", tone = "dark", className }: BrandMarkProps) {
  return (
    <a
      className={cn("brand-mark", `brand-mark--${tone}`, className)}
      href={href}
      aria-label="Помощь рядом — на главную"
    >
      <span className="brand-mark__icon" aria-hidden="true">
        <IconHeartPlus />
      </span>
      <span className="brand-mark__text">
        Помощь<span>рядом</span>
      </span>
    </a>
  );
}
