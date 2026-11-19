import { useCallback, useEffect, useRef, useState } from "react";
import { api, getWebSocketUrl, tokenStorage } from "@/shared/api";
import type { ChatMessage, ChatMessageDto } from "./types";

const CHAT_PAGE_SIZE = 50;

function mapMessage(message: ChatMessageDto, currentUserId: number): ChatMessage {
  return {
    id: String(message.id),
    author: message.sender_id === currentUserId ? "me" : "them",
    text: message.text,
    sentAt: message.created_at,
  };
}

interface SocketEvent {
  type: "ready" | "message" | "error";
  message?: ChatMessageDto | string;
}

export function useOrderChat(
  orderId: string | null,
  currentUserId: number,
  onRead: () => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeOrderIdRef.current = orderId;
    if (!orderId) return;

    let active = true;
    let socket: WebSocket | null = null;
    setLoading(true);
    setConnected(false);
    setError("");
    setMessages([]);
    setHasOlderMessages(false);
    setLoadingOlderMessages(false);

    const connect = async () => {
      try {
        const history = await api.get<ChatMessageDto[]>(
          `/chat/orders/${encodeURIComponent(orderId)}/messages?limit=${CHAT_PAGE_SIZE}`,
        );
        if (!active) return;
        setMessages(history.map((message) => mapMessage(message, currentUserId)));
        setHasOlderMessages(history.length === CHAT_PAGE_SIZE);

        await api.post(`/chat/orders/${encodeURIComponent(orderId)}/read`);
        if (!active) return;
        onRead();

        const accessToken = tokenStorage.get();
        if (!accessToken) throw new Error("Сессия истекла. Войдите в аккаунт ещё раз.");

        socket = new WebSocket(
          getWebSocketUrl(`/chat/orders/${encodeURIComponent(orderId)}/ws`),
        );
        socketRef.current = socket;
        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: "auth", access_token: accessToken }));
          if (active) setLoading(false);
        };
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(String(event.data)) as SocketEvent;
            if (data.type === "ready") {
              if (active) setConnected(true);
              return;
            }
            if (data.type === "error") {
              if (active) {
                setError(
                  typeof data.message === "string" ? data.message : "Ошибка WebSocket-чата.",
                );
              }
              return;
            }
            if (data.type !== "message" || typeof data.message !== "object" || !data.message) {
              throw new Error("Сервер прислал неизвестное событие чата.");
            }

            const message = mapMessage(data.message, currentUserId);
            if (active) {
              setMessages((current) =>
                current.some((item) => item.id === message.id) ? current : [...current, message],
              );
            }
            if (message.author === "them") {
              void api
                .post(`/chat/orders/${encodeURIComponent(orderId)}/read`)
                .then(onRead)
                .catch((requestError: unknown) => {
                  if (active) {
                    setError(
                      requestError instanceof Error
                        ? requestError.message
                        : "Не удалось отметить сообщения прочитанными.",
                    );
                  }
                });
            }
          } catch (eventError) {
            if (active) {
              setError(
                eventError instanceof Error
                  ? eventError.message
                  : "Не удалось обработать сообщение чата.",
              );
            }
          }
        };
        socket.onerror = () => {
          if (active) setError("Не удалось подключиться к чату.");
        };
        socket.onclose = (event) => {
          if (!active) return;
          setConnected(false);
          if (event.code === 4401) {
            setError("Сессия истекла. Обновите страницу и войдите снова.");
          } else if (event.code === 4403) {
            setError("У вас больше нет доступа к этому чату.");
          } else if (event.code !== 1000) {
            setError("Соединение с чатом закрыто. Попробуйте открыть переписку снова.");
          }
        };
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Не удалось открыть переписку.",
          );
          setLoading(false);
        }
      }
    };

    void connect();
    return () => {
      active = false;
      if (activeOrderIdRef.current === orderId) activeOrderIdRef.current = null;
      socketRef.current = null;
      socket?.close();
    };
  }, [currentUserId, onRead, orderId]);

  const loadOlderMessages = useCallback(async () => {
    const firstMessage = messages[0];
    if (!orderId || !firstMessage || !hasOlderMessages || loadingOlderMessages) return;
    setLoadingOlderMessages(true);
    try {
      const older = await api.get<ChatMessageDto[]>(
        `/chat/orders/${encodeURIComponent(orderId)}/messages?limit=${CHAT_PAGE_SIZE}&before_id=${encodeURIComponent(firstMessage.id)}`,
      );
      if (activeOrderIdRef.current !== orderId) return;
      setMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id));
        const olderMessages = older
          .map((message) => mapMessage(message, currentUserId))
          .filter((message) => !existingIds.has(message.id));
        return [...olderMessages, ...current];
      });
      setHasOlderMessages(older.length === CHAT_PAGE_SIZE);
    } catch (requestError) {
      if (activeOrderIdRef.current !== orderId) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить предыдущие сообщения.",
      );
    } finally {
      if (activeOrderIdRef.current === orderId) setLoadingOlderMessages(false);
    }
  }, [currentUserId, hasOlderMessages, loadingOlderMessages, messages, orderId]);

  const sendMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Чат пока не подключён. Попробуйте отправить сообщение ещё раз.");
      return;
    }
    socket.send(JSON.stringify({ type: "message", text }));
    setError("");
  }, []);

  return {
    messages,
    loading,
    connected,
    error,
    sendMessage,
    hasOlderMessages,
    loadingOlderMessages,
    loadOlderMessages,
  };
}
