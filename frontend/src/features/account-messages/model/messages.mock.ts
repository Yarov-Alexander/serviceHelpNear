import type { Conversation } from "./types";

// Демо-данные. Замените данными с API.
export const conversationsMock: Conversation[] = [
  {
    id: "conv-igor",
    participant: {
      name: "Игорь С.",
      role: "исполнитель",
      avatarUrl:
        "https://static.tildacdn.ink/tila3466-3363-4064-b235-336366383266/photo-1564564244660-.jpg",
    },
    topic: "Помощь с переездом",
    unread: 1,
    messages: [
      {
        id: "m1",
        author: "them",
        text: "Здравствуйте, Анна! Увидел вашу заявку на переезд. Сегодня в 15:00 смогу подъехать.",
        sentAt: "2026-11-13T09:12:00",
      },
      {
        id: "m2",
        author: "me",
        text: "Добрый день! Отлично, подходит. Нужно разобрать шкаф и кровать.",
        sentAt: "2026-11-13T09:20:00",
      },
      {
        id: "m3",
        author: "them",
        text: "Понял, инструменты возьму с собой. Напишу, когда буду у подъезда.",
        sentAt: "2026-11-13T09:24:00",
      },
    ],
  },
  {
    id: "conv-maria",
    participant: { name: "Мария П.", role: "исполнитель" },
    topic: "Уборка после ремонта",
    unread: 2,
    messages: [
      {
        id: "m1",
        author: "me",
        text: "Здравствуйте! Сможете убрать двухкомнатную квартиру после ремонта?",
        sentAt: "2026-11-12T18:02:00",
      },
      {
        id: "m2",
        author: "them",
        text: "Да, смогу в субботу утром. Своя химия и инвентарь у меня есть.",
        sentAt: "2026-11-12T18:30:00",
      },
      {
        id: "m3",
        author: "them",
        text: "Подскажите, пожалуйста, этаж и есть ли лифт?",
        sentAt: "2026-11-12T18:31:00",
      },
    ],
  },
  {
    id: "conv-oleg",
    participant: { name: "Олег Н.", role: "исполнитель" },
    topic: "Вынести старую мебель",
    unread: 0,
    messages: [
      {
        id: "m1",
        author: "them",
        text: "Всё вынесли, спасибо за заказ! Буду рад, если оставите отзыв.",
        sentAt: "2026-11-09T14:10:00",
      },
      {
        id: "m2",
        author: "me",
        text: "Спасибо вам, всё быстро и аккуратно!",
        sentAt: "2026-11-09T14:25:00",
      },
    ],
  },
];
