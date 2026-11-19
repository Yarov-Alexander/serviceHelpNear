export interface NextHelp {
  id: string;
  /** Готовая подпись: «Сегодня, 15:00» */
  startsAtLabel: string;
  title: string;
  performer: { name: string; role?: string; avatarUrl?: string };
  /** Диалог с исполнителем — откроется по кнопке «Написать» */
  conversationId?: string;
}
