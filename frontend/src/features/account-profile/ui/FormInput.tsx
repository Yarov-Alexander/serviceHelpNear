import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../../../shared/lib/cn";
import "./FormInput.scss";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormInput({ label, error, hint, id, className, ...rest }: FormInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = error || hint ? `${inputId}-message` : undefined;

  return (
    <div className={cn("form-input", error && "has-error", className)}>
      <label className="form-input__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="form-input__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        {...rest}
      />
      {error ? (
        <p className="form-input__message form-input__message--error" id={messageId} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="form-input__message" id={messageId}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
