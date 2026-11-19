import { useId } from "react";
import { cn } from "../../../shared/lib/cn";
import { openModal } from "../../../shared/lib/modalStore";
import { Avatar } from "../../../shared/ui/Avatar";
import { IconArrowRight, IconCalendar, IconPlus } from "../../../shared/ui/Icons";
import type { NextHelp } from "../model/types";
import "./NextHelpCard.scss";

interface NextHelpCardProps {
  nextHelp: NextHelp | null;
  onCreateRequest: () => void;
  canCreateRequest?: boolean;
  className?: string;
}

export function NextHelpCard({
  nextHelp,
  onCreateRequest,
  canCreateRequest = true,
  className,
}: NextHelpCardProps) {
  const labelId = useId();

  if (!nextHelp) {
    return (
      <section
        className={cn("next-help", "next-help--empty", className)}
        id="schedule"
        aria-labelledby={labelId}
      >
        <p className="next-help__label" id={labelId}>
          Ближайшая помощь
        </p>
        <span className="next-help__empty-icon" aria-hidden="true">
          <IconCalendar />
        </span>
        <p className="next-help__time next-help__time--empty">Пока ничего не запланировано</p>
        <p className="next-help__what">
          Когда исполнитель подтвердит заявку, здесь появятся время и кнопка для связи.
        </p>
        {canCreateRequest && (
          <button
            type="button"
            className="next-help__action"
            aria-haspopup="dialog"
            onClick={onCreateRequest}
          >
            <IconPlus />
            Создать заявку
          </button>
        )}
      </section>
    );
  }

  return (
    <section className={cn("next-help", className)} id="schedule" aria-labelledby={labelId}>
      <p className="next-help__label" id={labelId}>
        Ближайшая помощь
      </p>
      <p className="next-help__time">{nextHelp.startsAtLabel}</p>
      <p className="next-help__what">{nextHelp.title}</p>
      <div className="next-help__who">
        <Avatar
          name={nextHelp.performer.name}
          src={nextHelp.performer.avatarUrl}
          size="sm"
          decorative
          className="next-help__avatar"
        />
        <p>
          <b>{nextHelp.performer.name}</b>
          {nextHelp.performer.role && <span> · {nextHelp.performer.role}</span>}
        </p>
      </div>
      <button
          type="button"
          className="next-help__action"
          aria-haspopup="dialog"
          onClick={() => openModal("messages", { conversationId: nextHelp.conversationId })}
        >
          Написать
          <IconArrowRight />
        </button>
    </section>
  );
}
