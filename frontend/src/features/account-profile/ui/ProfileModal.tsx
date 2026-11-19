import { useState, type FormEvent } from "react";
import { cn } from "../../../shared/lib/cn";
import { useModal } from "../../../shared/lib/modalStore";
import { Avatar } from "../../../shared/ui/Avatar";
import { IconCheck } from "../../../shared/ui/Icons";
import { Modal } from "../../../shared/ui/Modal";
import type { ProfileData, ProfileStats, ProfileTab } from "../model/types";
import {
  validatePassword,
  validateProfile,
  type PasswordErrors,
  type ProfileErrors,
} from "../model/validation";
import { FormInput } from "./FormInput";
import "./ProfileModal.scss";

interface ProfileModalProps {
  profile: ProfileData;
  stats?: ProfileStats;
  /** Верните промис — кнопка будет блокироваться на время сохранения. Ошибка → бросьте исключение. */
  onSave?: (data: ProfileData) => void | Promise<void>;
  onChangePassword?: (currentPassword: string, newPassword: string) => void | Promise<void>;
}

type Status = "idle" | "saving" | "saved" | "error";

export function ProfileModal({ profile, stats, onSave, onChangePassword }: ProfileModalProps) {
  const { isOpen, payload, close } = useModal("profile");

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Мой профиль"
      description="Контакты и безопасность вашего аккаунта"
    >
      <ProfileDialog
        profile={profile}
        stats={stats}
        initialTab={payload?.tab ?? "info"}
        onSave={onSave}
        onChangePassword={onChangePassword}
      />
    </Modal>
  );
}

interface ProfileDialogProps extends ProfileModalProps {
  initialTab: ProfileTab;
}

function ProfileDialog({
  profile,
  stats,
  initialTab,
  onSave,
  onChangePassword,
}: ProfileDialogProps) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);

  return (
    <div className="profile">
      <div className="profile__card">
        <Avatar name={profile.name} src={profile.avatarUrl} size="xl" />
        <div className="profile__who">
          <p className="profile__name">{profile.name}</p>
          <p className="profile__email">{profile.email}</p>
        </div>
      </div>

      {stats && (
        <dl className="profile__stats">
          <div>
            <dt>Заявок создано</dt>
            <dd>{stats.requestsCreated}</dd>
          </div>
          <div>
            <dt>Получено помощи</dt>
            <dd>{stats.helpReceived}</dd>
          </div>
          <div>
            <dt>Рейтинг</dt>
            <dd>{stats.rating === null ? "—" : stats.rating.toLocaleString("ru-RU")}</dd>
          </div>
        </dl>
      )}

      <div className="profile__tabs" role="group" aria-label="Раздел профиля">
        <button
          type="button"
          className={cn("profile__tab", tab === "info" && "is-active")}
          aria-pressed={tab === "info"}
          onClick={() => setTab("info")}
        >
          Данные
        </button>
        <button
          type="button"
          className={cn("profile__tab", tab === "security" && "is-active")}
          aria-pressed={tab === "security"}
          onClick={() => setTab("security")}
        >
          Безопасность
        </button>
      </div>

      {tab === "info" ? (
        <InfoForm profile={profile} onSave={onSave} />
      ) : (
        <PasswordForm onChangePassword={onChangePassword} />
      )}
    </div>
  );
}

/* ---------------- данные ---------------- */

function InfoForm({ profile, onSave }: Pick<ProfileModalProps, "profile" | "onSave">) {
  const [baseline, setBaseline] = useState<ProfileData>(profile);
  const [form, setForm] = useState<ProfileData>(profile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDirty =
    form.name !== baseline.name ||
    form.email !== baseline.email ||
    form.phone !== baseline.phone ||
    form.district !== baseline.district;

  const update = (field: keyof ProfileData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus("idle");
    setErrorMessage(null);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!onSave) {
      setErrorMessage("Сохранение профиля пока не подключено.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    try {
      await onSave({ ...form, name: form.name.trim(), email: form.email.trim() });
      setBaseline(form);
      setStatus("saved");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось сохранить профиль.");
      setStatus("error");
    }
  };

  return (
    <form className="profile__form" onSubmit={handleSubmit} noValidate>
      <FormInput
        label="Имя и фамилия"
        autoComplete="name"
        value={form.name}
        error={errors.name}
        onChange={(e) => update("name")(e.target.value)}
      />
      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        error={errors.email}
        onChange={(e) => update("email")(e.target.value)}
      />
      <FormInput
        label="Телефон"
        type="tel"
        autoComplete="tel"
        value={form.phone}
        error={errors.phone}
        hint="Исполнитель увидит номер только после подтверждения заявки"
        onChange={(e) => update("phone")(e.target.value)}
      />
      <FormInput
        label="Район"
        value={form.district}
        hint="По нему мы подбираем помощников рядом с вами"
        onChange={(e) => update("district")(e.target.value)}
      />

      <FormFooter
        status={status}
        dirty={isDirty}
        savedText="Изменения сохранены"
        idleLabel="Сохранить изменения"
        errorMessage={errorMessage}
      />
    </form>
  );
}

/* ---------------- безопасность ---------------- */

function PasswordForm({ onChangePassword }: Pick<ProfileModalProps, "onChangePassword">) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const touch =
    <T,>(setter: (v: T) => void, field: keyof PasswordErrors) =>
    (value: T) => {
      setter(value);
      setStatus("idle");
      setErrorMessage(null);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validatePassword(current, next, repeat);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!onChangePassword) {
      setErrorMessage("Смена пароля пока не подключена.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    try {
      await onChangePassword(current, next);
      setCurrent("");
      setNext("");
      setRepeat("");
      setStatus("saved");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось сменить пароль.");
      setStatus("error");
    }
  };

  return (
    <form className="profile__form" onSubmit={handleSubmit} noValidate>
      <FormInput
        label="Текущий пароль"
        type="password"
        autoComplete="current-password"
        value={current}
        error={errors.current}
        onChange={(e) => touch(setCurrent, "current")(e.target.value)}
      />
      <FormInput
        label="Новый пароль"
        type="password"
        autoComplete="new-password"
        value={next}
        error={errors.next}
        hint="Не меньше 8 символов"
        onChange={(e) => touch(setNext, "next")(e.target.value)}
      />
      <FormInput
        label="Повторите новый пароль"
        type="password"
        autoComplete="new-password"
        value={repeat}
        error={errors.repeat}
        onChange={(e) => touch(setRepeat, "repeat")(e.target.value)}
      />

      <FormFooter
        status={status}
        dirty={current !== "" || next !== "" || repeat !== ""}
        savedText="Пароль изменён"
        idleLabel="Сменить пароль"
        errorMessage={errorMessage}
      />
    </form>
  );
}

/* ---------------- общий низ формы ---------------- */

interface FormFooterProps {
  status: Status;
  dirty: boolean;
  savedText: string;
  idleLabel: string;
  errorMessage: string | null;
}

function FormFooter({ status, dirty, savedText, idleLabel, errorMessage }: FormFooterProps) {
  return (
    <div className="profile__footer">
      <button type="submit" className="profile__submit" disabled={status === "saving" || !dirty}>
        {status === "saving" ? "Сохраняем…" : idleLabel}
      </button>
      <p className="profile__status" role="status" aria-live="polite">
        {status === "saved" && (
          <span className="profile__status-ok">
            <IconCheck />
            {savedText}
          </span>
        )}
        {status === "error" && (
          <span className="profile__status-error">
            {errorMessage ?? "Не удалось сохранить. Попробуйте ещё раз."}
          </span>
        )}
      </p>
    </div>
  );
}
