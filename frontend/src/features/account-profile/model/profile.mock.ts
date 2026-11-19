import type { ProfileData, ProfileStats } from "./types";

// Демо-данные. Замените данными пользователя из userStore / API.
export const profileMock: ProfileData = {
  name: "Анна Ковалёва",
  email: "anna@example.com",
  phone: "+7 900 000-00-00",
  district: "Центральный район",
  avatarUrl:
    "https://static.tildacdn.ink/tila6461-3661-4561-a434-326332393364/photo-1544725176-7c4.jpg",
};

export const profileStatsMock: ProfileStats = {
  requestsCreated: 12,
  helpReceived: 9,
  rating: 4.9,
};
