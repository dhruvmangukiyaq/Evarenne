import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "../../lib/a11y";

/* ---------------- Field wrapper ---------------- */

interface FieldWrapperProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: (ids: { describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

function FieldWrapper({ id, label, hint, error, required, children }: FieldWrapperProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label !== undefined && (
        <label htmlFor={id} className="font-sans text-sm font-medium text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-wine">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      )}
      {children({ describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs text-danger">
          <span aria-hidden="true" className="mt-px leading-none">
            ⚠
          </span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/* ---------------- Input ---------------- */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  inputClassName?: string;
}

const controlBase =
  "w-full bg-white text-ink placeholder:text-ink-faint border transition-colors duration-150 " +
  "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-wine";

const controlState = (invalid: boolean, disabled?: boolean) =>
  invalid
    ? "border-danger bg-danger-soft/40 focus:outline-danger"
    : "border-ivory-dim hover:border-ink-faint focus:border-wine focus:ring-1 focus:ring-wine/30" +
      (disabled ? " bg-ivory-deep text-ink-faint" : "");

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, id, className = "", inputClassName = "", disabled, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldWrapper id={inputId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`${controlBase} h-11 px-3.5 text-sm ${controlState(invalid, disabled)} ${inputClassName} ${className}`}
          {...rest}
        />
      )}
    </FieldWrapper>
  );
});

/* ---------------- Textarea ---------------- */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, id, className = "", disabled, rows = 5, ...rest },
  ref,
) {
  const generatedId = useId();
  const areaId = id ?? generatedId;

  return (
    <FieldWrapper id={areaId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={areaId}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`${controlBase} px-3.5 py-2.5 text-sm leading-relaxed ${controlState(invalid, disabled)} ${className}`}
          {...rest}
        />
      )}
    </FieldWrapper>
  );
});

/* ---------------- Select ---------------- */

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    required,
    id,
    className = "",
    options,
    placeholder,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldWrapper id={selectId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={`${controlBase} h-11 appearance-none pr-10 pl-3.5 text-sm ${controlState(invalid, disabled)} ${className}`}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft"
          >
            ▾
          </span>
        </div>
      )}
    </FieldWrapper>
  );
});

/* ---------------- Checkbox ---------------- */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  hint?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, id, className = "", disabled, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        aria-describedby={hintId}
        className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-wine"
        {...rest}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={inputId} className="cursor-pointer text-sm text-ink">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-xs text-ink-soft">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
});

/* ---------------- Radio group ---------------- */

export interface RadioOption {
  value: string;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  legend: ReactNode;
  name: string;
  value: string | null;
  onChange: (value: string) => void;
  options: readonly RadioOption[];
  error?: ReactNode;
  className?: string;
}

export function RadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
  error,
  className = "",
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset
      aria-describedby={errorId}
      aria-invalid={error ? true : undefined}
      className={`flex flex-col gap-2.5 ${className}`}
    >
      <legend className="mb-1 font-sans text-sm font-medium text-ink">{legend}</legend>
      {options.map((option) => {
        const optionId = `${groupId}-${option.value}`;
        const isSelected = value === option.value;
        return (
          <div
            key={option.value}
            className={
              isSelected
                ? "flex items-start gap-3 border border-wine bg-wine/[0.04] p-3"
                : "flex items-start gap-3 border border-ivory-dim p-3 transition-colors hover:border-ink-faint"
            }
          >
            <input
              id={optionId}
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-wine"
            />
            <div className="flex flex-col gap-0.5">
              <label htmlFor={optionId} className="cursor-pointer text-sm font-medium text-ink">
                {option.label}
              </label>
              {option.hint && <p className="text-xs text-ink-soft">{option.hint}</p>}
            </div>
          </div>
        );
      })}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
