
export type AppLanguage = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar' | 'pt';

export interface UserSettings {
  reminderInterval: number;
  startTime: string;
  endTime: string;
  notificationsEnabled: boolean;
  language: AppLanguage;
}

export interface WaterLog {
  timestamp: number;
  amount: number;
}

export interface HydrationState {
  settings: UserSettings;
  logs: WaterLog[];
}
