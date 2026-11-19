import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../../shared/lib/modalStore";
import { useMediaQuery } from "../../../shared/lib/useMediaQuery";
import { Modal } from "../../../shared/ui/Modal";
import { useOrderChat } from "../model/useOrderChat";
import type { Conversation } from "../model/types";
import { ChatThread } from "./ChatThread";
import { ConversationList } from "./ConversationList";
import "./MessagesModal.scss";

interface MessagesModalProps {
  conversations: Conversation[];
  currentUserId: number;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

function lastMessageTime(conversation: Conversation): number {
  const last = conversation.messages[conversation.messages.length - 1];
  return last ? new Date(last.sentAt).getTime() : 0;
}

export function MessagesModal({
  conversations,
  currentUserId,
  loading,
  error,
  onRefresh,
}: MessagesModalProps) {
  const { isOpen, payload, close } = useModal("messages");

  useEffect(() => {
    if (isOpen) onRefresh();
  }, [isOpen, onRefresh]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Сообщения"
      description="Переписка участников по заказам"
      size="lg"
    >
      <MessagesDialog
        conversations={conversations}
        initialId={payload?.conversationId ?? null}
        currentUserId={currentUserId}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
      />
    </Modal>
  );
}

interface MessagesDialogProps extends MessagesModalProps {
  initialId: string | null;
}

// Монтируется только пока окно открыто — выбранный диалог сбрасывается при каждом открытии.
function MessagesDialog({
  conversations,
  initialId,
  currentUserId,
  loading,
  error,
  onRefresh,
}: MessagesDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 721px)");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => lastMessageTime(b) - lastMessageTime(a)),
    [conversations],
  );

  const validSelectedId = sorted.some((c) => c.id === selectedId) ? selectedId : null;
  // На десктопе сразу открываем верхний диалог, на мобильном сначала список
  const activeId = validSelectedId ?? (isDesktop ? (sorted[0]?.id ?? null) : null);
  const active = sorted.find((c) => c.id === activeId) ?? null;
  const chat = useOrderChat(active?.id ?? null, currentUserId, onRefresh);

  return (
    <div className="messages" data-view={validSelectedId ? "chat" : "list"}>
      <div className="messages__list">
        {error && sorted.length === 0 ? (
          <p className="messages__error" role="alert">{error}</p>
        ) : loading && sorted.length === 0 ? (
          <p className="messages__connection">Загружаем переписки…</p>
        ) : sorted.length === 0 ? (
          <p className="messages__connection">
            После того как исполнитель возьмёт заказ, здесь появится переписка.
          </p>
        ) : (
          <>
            {error && <p className="messages__error" role="alert">{error}</p>}
            <ConversationList
              conversations={sorted}
              activeId={activeId}
              onSelect={setSelectedId}
            />
          </>
        )}
      </div>

      {active ? (
        <ChatThread
          key={active.id}
          conversation={{ ...active, messages: chat.messages }}
          onBack={() => setSelectedId(null)}
          onSend={chat.sendMessage}
          loading={chat.loading}
          connected={chat.connected}
          error={chat.error}
          hasOlderMessages={chat.hasOlderMessages}
          loadingOlderMessages={chat.loadingOlderMessages}
          onLoadOlderMessages={() => void chat.loadOlderMessages()}
        />
      ) : (
        <div className="messages__chat messages__chat--empty">
          <p>Выберите диалог слева</p>
        </div>
      )}
    </div>
  );
}
