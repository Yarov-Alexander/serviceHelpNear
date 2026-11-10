import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import classNames from "classnames";
import "./Section.scss";

type SectionProps<T extends ElementType = "section"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Section<T extends ElementType = "section">({
  as,
  children,
  className,
  containerClassName,
  ...props
}: SectionProps<T>) {
  const Tag = as ?? "section";

  return (
    <Tag className={classNames("layout-section", className)} {...props}>
      <div className={classNames("layout-section__container", containerClassName)}>{children}</div>
    </Tag>
  );
}
