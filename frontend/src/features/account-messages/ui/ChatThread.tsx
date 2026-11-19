import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../../shared/lib/cn";
import { Avatar } from "../../../shared/ui/Avatar";
import { IconArrowLeft, IconSend } from "../../../shared/ui/Icons";
import { formatTime } from "../lib/formatTime";
import type { Conversation } from "../model/types";

interface ChatThreadProps {
  conversation: Conversation;
  onBack: () => void;
  onSend: (text: string) => void;
  loading: boolean;
  connected: boolean;
  error: string;
  hasOlderMessages: boolean;
  loadingOlderMessages: boolean;
  onLoadOlderMessages: () => void;
}

export function ChatThread({
  conversation,
  onBack,
  onSend,
  loading,
  connected,
  error,
  hasOlderMessages,
  loadingOlderMessages,
  onLoadOlderMessages,
}: ChatThreadProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { participant, messages } = conversation;

  const newestMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [newestMessageId]);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || !connected) return;
    onSend(text);
    setDraft("");
    requestAnimationFrame(resize);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section className="messages__chat" aria-label={`Диалог с ${participant.name}`}>
      <header className="messages__chat-header">
        <button
          type="button"
          className="messages__back"
          onClick={onBack}
          aria-label="К списку диалогов"
        >
          <IconArrowLeft />
        </button>
        <Avatar name={participant.name} src={participant.avatarUrl} size="md" decorative />
        <div className="messages__chat-who">
          <p className="messages__chat-name">
            {participant.name} <span>· {participant.role}</span>
          </p>
          <p className="messages__chat-topic">{conversation.topic}</p>
        </div>
      </header>

      <div className="messages__log" role="log" aria-live="polite">
        {loading && <p className="messages__connection">Загружаем переписку…</p>}
        {!loading && !connected && !error && (
          <p className="messages__connection">Подключаемся к чату…</p>
        )}
        {error && <p className="messages__error" role="alert">{error}</p>}
        {hasOlderMessages && (
          <button
            type="button"
            className="messages__load-older"
            onClick={onLoadOlderMessages}
            disabled={loadingOlderMessages}
          >
            {loadingOlderMessages ? "Загружаем…" : "Загрузить предыдущие сообщения"}
          </button>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("messages__bubble", `messages__bubble--${message.author}`)}
          >
            <p>{message.text}</p>
            <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="messages__composer">
        <label className="messages__composer-label" htmlFor={`draft-${conversation.id}`}>
          Сообщение для {participant.name}
        </label>
        <textarea
          id={`draft-${conversation.id}`}
          ref={textareaRef}
          className="messages__input"
          rows={1}
          placeholder="Напишите сообщение"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="button"
          className="messages__send"
          onClick={submit}
          disabled={draft.trim().length === 0 || !connected || loading}
          aria-label="Отправить сообщение"
        >
          <IconSend />
        </button>
      </div>
    </section>
  );
}
