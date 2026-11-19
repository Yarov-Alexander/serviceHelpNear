export interface ConversationParticipant {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  author: "me" | "them";
  text: string;
  /** ISO-строка */
  sentAt: string;
}

export interface Conversation {
  id: string;
  participant: ConversationParticipant;
  /** Тема заявки, по которой идёт диалог */
  topic: string;
  unread: number;
  messages: ChatMessage[];
}

export interface ChatMessageDto {
  id: number;
  order_id: number;
  sender_id: number;
  text: string;
  created_at: string;
}

export interface ConversationDto {
  order_id: number;
  topic: string;
  participant_name: string;
  unread_count: number;
  last_message: ChatMessageDto | null;
}
