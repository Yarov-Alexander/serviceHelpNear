import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/api";
import type { ChatMessage, ChatMessageDto, Conversation, ConversationDto } from "./types";

function mapMessage(message: ChatMessageDto, currentUserId: number): ChatMessage {
  return {
    id: String(message.id),
    author: message.sender_id === currentUserId ? "me" : "them",
    text: message.text,
    sentAt: message.created_at,
  };
}

export function useConversations(currentUserId: number | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (currentUserId === null) {
      setConversations([]);
      setError("");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    api
      .get<ConversationDto[]>("/chat/conversations")
      .then((items) => {
        if (!active) return;
        setConversations(
          items.map((item) => ({
            id: String(item.order_id),
            participant: { name: item.participant_name, role: "участник заявки" },
            topic: item.topic,
            unread: item.unread_count,
            messages: item.last_message
              ? [mapMessage(item.last_message, currentUserId)]
              : [],
          })),
        );
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить переписки.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUserId, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);
  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

  return { conversations, unreadTotal, loading, error, refresh };
}
