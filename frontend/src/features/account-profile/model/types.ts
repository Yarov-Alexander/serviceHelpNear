export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  /** Район, в котором ищется помощь */
  district: string;
  avatarUrl?: string;
}

export interface ProfileStats {
  requestsCreated: number;
  helpReceived: number;
  rating: number | null;
}

export type ProfileTab = "info" | "security";
