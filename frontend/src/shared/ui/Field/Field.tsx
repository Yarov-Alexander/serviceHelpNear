import type { InputHTMLAttributes } from "react";
import { useId } from 'react'
import classNames from "classnames";
import "./Field.scss";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
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
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={classNames("field", className)}>
      <label className={classNames("field__label", labelClassName)} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
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
