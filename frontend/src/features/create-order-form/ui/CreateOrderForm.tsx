import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { useReducedMotion } from "../../../shared/lib";
import { taskPlaceholders } from "../model/placeholders.mock";
import "./CreateOrderForm.scss";

type FormValues = {
  task: string;
  price: string;
  city: string;
};

type CreateOrderFormProps = {
  onSubmit: (values: FormValues) => void;
};

export function CreateOrderForm({ onSubmit }: CreateOrderFormProps) {
  const reducedMotion = useReducedMotion();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [values, setValues] = useState<FormValues>({ task: "", price: "", city: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % taskPlaceholders.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.task.trim()) nextErrors.task = "Опишите задачу хотя бы парой слов";
    if (!values.city.trim()) nextErrors.city = "Укажите город";
    if (!values.price || Number(values.price) <= 0)
      nextErrors.price = "Цена должна быть больше нуля";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <form className="create-order-form" onSubmit={submit} noValidate>
      <div className="create-order-form__field">
        <label htmlFor="task">Что нужно сделать?</label>
        <input
          id="task"
          value={values.task}
          onChange={(event) => update("task", event.target.value)}
          placeholder={taskPlaceholders[reducedMotion ? 0 : placeholderIndex]}
          aria-invalid={Boolean(errors.task)}
          aria-describedby={errors.task ? "task-error" : undefined}
        />
        {errors.task && (
          <span id="task-error" className="create-order-form__error">
            {errors.task}
          </span>
        )}
      </div>

      <div className="create-order-form__row">
        <div className="create-order-form__field">
          <label htmlFor="price">Сколько готовы заплатить</label>
          <div className="create-order-form__price-input">
            <input
              id="price"
              type="number"
              min="1"
              inputMode="numeric"
              value={values.price}
              onChange={(event) => update("price", event.target.value)}
              placeholder="1500"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "price-error" : undefined}
            />
            <span aria-hidden="true">₽</span>
          </div>
          {errors.price && (
            <span id="price-error" className="create-order-form__error">
              {errors.price}
            </span>
          )}
        </div>

        <div className="create-order-form__field">
          <label htmlFor="city">Город</label>
          <input
            id="city"
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
            placeholder="Ваш город"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "city-error" : undefined}
          />
          {errors.city && (
            <span id="city-error" className="create-order-form__error">
              {errors.city}
            </span>
          )}
        </div>
      </div>

      <Button type="submit" className="create-order-form__submit">
        Создать заказ
      </Button>
    </form>
  );
}
