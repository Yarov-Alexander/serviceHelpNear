import { useId } from "react";
import { IconArrowRight, IconPlus } from "../../../shared/ui/Icons";
import { pluralize } from "../lib/pluralize";
import type { NextHelp } from "../model/types";
import { NextHelpCard } from "./NextHelpCard";
import "./AccountWelcome.scss";

interface AccountWelcomeProps {
  firstName: string;
  activeRequests: number;
  newResponses: number;

  nextHelp: NextHelp | null;
  photoUrl?: string;
  requestsHref?: string;
  canCreateRequest?: boolean;
  onCreateRequest: () => void;
}

export function AccountWelcome({
  firstName,
  activeRequests,
  newResponses,
  nextHelp,
  photoUrl,
  requestsHref = "#account-orders",
  canCreateRequest = true,
  onCreateRequest,
}: AccountWelcomeProps) {
  const titleId = useId();

  const requestsChip =
    activeRequests > 0
      ? `${activeRequests} ${pluralize(activeRequests, ["заявка", "заявки", "заявок"])} в работе`
      : "Нет заявок в работе";

  const lead =
    newResponses > 0
      ? "Соседи уже откликнулись на вашу заявку — посмотрите отклики или опубликуйте новую задачу, и мы найдём помощника рядом с вами."
      : "Опубликуйте задачу, и мы найдём помощника рядом с вами.";

  return (
    <section className="account-welcome" id="requests" aria-labelledby={titleId}>
      <div className="account-welcome__grid">
        <div className="account-welcome__field account-welcome__field--main">
          <div className="account-welcome__chips">
            <span className="account-welcome__chip">
              <i aria-hidden="true" />
              {requestsChip}
            </span>
            {newResponses > 0 && (
              <span className="account-welcome__chip account-welcome__chip--yellow">
                <i aria-hidden="true" />
                {newResponses}{" "}
                {pluralize(newResponses, ["новый отклик", "новых отклика", "новых откликов"])}
              </span>
            )}
          </div>

          <h1 className="account-welcome__title" id={titleId}>
            Рады видеть вас снова, {firstName}
          </h1>
          <p className="account-welcome__lead">{lead}</p>

          <div className="account-welcome__cta">
            {canCreateRequest && (
              <button
                type="button"
                className="account-welcome__btn"
                aria-haspopup="dialog"
                onClick={onCreateRequest}
              >
                <IconPlus />
                Создать заявку
              </button>
            )}
            <a className="account-welcome__link" href={requestsHref}>
              Смотреть мои заявки
              <IconArrowRight />
            </a>
          </div>
        </div>

        <figure className="account-welcome__field account-welcome__field--photo">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Люди помогают друг другу — волонтёры рядом"
              width={640}
              height={480}
              decoding="async"
            />
          )}
        </figure>

        <NextHelpCard
          nextHelp={nextHelp}
          onCreateRequest={onCreateRequest}
          canCreateRequest={canCreateRequest}
          className="account-welcome__field account-welcome__field--next"
        />
      </div>
    </section>
  );
}
