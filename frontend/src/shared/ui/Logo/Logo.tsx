import classNames from "classnames";
import "./Logo.scss";

type LogoProps = {
  variant?: "default" | "inverted";
};

export function Logo({ variant = "default" }: LogoProps) {
  return (
    <a
      className={classNames("logo", variant === "inverted" && "logo--inverted")}
      href="#top"
      aria-label="Помощь рядом — на главную"
    >
      <svg viewBox="0 0 42 36" aria-hidden="true">
        <path d="M7 19c4-6 8-8 12-4l3 3 3-3c4-4 8-2 11 4-3 7-8 12-14 14C15 31 10 26 7 19Z" />
        <path d="m4 14 7-7 8 8M38 14l-7-7-8 8" />
      </svg>
      <span>
        Помощь
        <br />
        рядом
      </span>
    </a>
  );
}
