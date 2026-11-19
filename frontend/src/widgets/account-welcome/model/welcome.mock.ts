import type { NextHelp } from "./types";

// Демо-данные. Замените данными с API; для проверки пустого состояния передайте null.
export const welcomePhotoMock =
  "https://static.tildacdn.ink/tila6331-3538-4237-b231-376363306633/photo-1599059813005-.jpg";

export const nextHelpMock: NextHelp = {
  id: "help-1",
  startsAtLabel: "Сегодня, 15:00",
  title: "Помощь с переездом: сбор и разбор мебели",
  performer: {
    name: "Игорь С.",
    role: "исполнитель",
    avatarUrl:
      "https://static.tildacdn.ink/tila3466-3363-4064-b235-336366383266/photo-1564564244660-.jpg",
  },
  conversationId: "conv-igor",
};
