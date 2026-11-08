import type { ButtonHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";
import "./Button.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={classNames("button", `button--${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
