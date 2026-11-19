import { useCallback, useEffect, useRef, useState } from "react";
import { api, getWebSocketUrl, tokenStorage } from "@/shared/api";
import type { ChatMessage, ChatMessageDto } from "./types";

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
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let active = true;
    let socket: WebSocket | null = null;
    setLoading(true);
    setConnected(false);
    setError("");
    setMessages([]);

    const connect = async () => {
      try {
        const history = await api.get<ChatMessageDto[]>(
          `/chat/orders/${encodeURIComponent(orderId)}/messages`,
        );
        if (!active) return;
        setMessages(history.map((message) => mapMessage(message, currentUserId)));

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
      socketRef.current = null;
      socket?.close();
    };
  }, [currentUserId, onRead, orderId]);

  const sendMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Чат пока не подключён. Попробуйте отправить сообщение ещё раз.");
      return;
    }
    socket.send(JSON.stringify({ type: "message", text }));
    setError("");
  }, []);

  return { messages, loading, connected, error, sendMessage };
}
