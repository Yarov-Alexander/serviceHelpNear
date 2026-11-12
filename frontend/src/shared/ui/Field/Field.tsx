import type { InputHTMLAttributes } from "react";
import classNames from "classnames";
import "./Field.scss";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
};

export function Field({
  id,
  label,
  error,
  className,
  labelClassName,
  inputClassName,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: FieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className={classNames("field", className)}>
      <label className={classNames("field__label", labelClassName)} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={classNames("field__input", inputClassName)}
        {...inputProps}
        aria-invalid={error ? true : inputProps["aria-invalid"]}
        aria-describedby={[ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined}
      />
      {error && (
        <span id={errorId} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}
