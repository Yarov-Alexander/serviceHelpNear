import { cn } from "../../../shared/lib/cn";
import { Avatar } from "../../../shared/ui/Avatar";
import { formatListTime } from "../lib/formatTime";
import type { Conversation } from "../model/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversationId: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="messages__empty">
        <p className="messages__empty-title">Сообщений пока нет</p>
        <p className="messages__empty-text">
          Когда исполнитель ответит на вашу заявку, диалог появится здесь.
        </p>
      </div>
    );
  }

  return (
    <ul className="messages__items">
      {conversations.map((conversation) => {
        const last = conversation.messages[conversation.messages.length - 1];
        const isActive = conversation.id === activeId;

        return (
          <li key={conversation.id}>
            <button
              type="button"
              className={cn("messages__item", isActive && "is-active")}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(conversation.id)}
            >
              <Avatar
                name={conversation.participant.name}
                src={conversation.participant.avatarUrl}
                size="md"
                decorative
              />
              <span className="messages__item-body">
                <span className="messages__item-top">
                  <span className="messages__item-name">{conversation.participant.name}</span>
                  {last && (
                    <time className="messages__item-time" dateTime={last.sentAt}>
                      {formatListTime(last.sentAt)}
                    </time>
                  )}
                </span>
                <span className="messages__item-topic">{conversation.topic}</span>
                <span className="messages__item-preview">
                  {last ? (last.author === "me" ? `Вы: ${last.text}` : last.text) : "Нет сообщений"}
                </span>
              </span>
              {conversation.unread > 0 && (
                <span
                  className="messages__item-unread"
                  aria-label={`непрочитанных: ${conversation.unread}`}
                >
                  {conversation.unread}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
