
import { UserSettings, AppLanguage } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  reminderInterval: 60,
  startTime: "08:00",
  endTime: "22:00",
  notificationsEnabled: false,
  language: 'vi'
};

export const STORAGE_KEY = 'hydroflow_settings_v1';

export const LANGUAGES: { code: AppLanguage, name: string, flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
];

// Use Partial to fix missing properties error while allowing App.tsx to fallback to 'en'
export const TRANSLATIONS: Partial<Record<AppLanguage, any>> = {
  en: {
    reminders: "Reminders",
    active: "Active",
    off: "Off",
    blocked: "Blocked",
    activeHours: "Active Hours",
    start: "Start",
    end: "End",
    frequency: "Frequency",
    interval: "Interval",
    mins: "mins",
    save: "Save Schedule",
    applied: "Applied",
    notifTitle: "Settings Saved!",
    notifBody: "Your water reminders are now active.",
    remindTitle: "Time to drink water!",
    remindBody: "Drink a glass of water now to stay healthy.",
    adLabel: "Google AdSense Placement",
    nextReminder: "Next reminder in",
    testNotif: "Test Notification",
    testSuccess: "It works! You will see notifications like this.",
    outsideHours: "Outside active hours",
    howToFix: "How to enable?",
    fixInstruction: "Click the lock icon (🔒) on the address bar and enable 'Notifications'.",
    pwaTip: "PWA Tip: Install the app for better background notifications."
  },
  vi: {
    reminders: "Nhắc nhở",
    active: "Đang hoạt động",
    off: "Đang tắt",
    blocked: "Bị chặn",
    activeHours: "Thời gian hoạt động",
    start: "Bắt đầu",
    end: "Kết thúc",
    frequency: "Tần suất",
    interval: "Cách nhau",
    mins: "phút",
    save: "Lưu lịch nhắc nhở",
    applied: "Đã áp dụng",
    notifTitle: "Đã lưu cài đặt!",
    notifBody: "Lịch nhắc uống nước của bạn đã được kích hoạt.",
    remindTitle: "Đã đến lúc uống nước!",
    remindBody: "Uống một ly nước ngay để cơ thể luôn tràn đầy năng lượng.",
    adLabel: "Vị trí quảng cáo Google",
    nextReminder: "Nhắc nhở tiếp theo sau",
    testNotif: "Thử thông báo",
    testSuccess: "Tuyệt vời! Bạn sẽ nhận được thông báo như thế này.",
    outsideHours: "Ngoài giờ nhắc nhở",
    howToFix: "Cách bật lại?",
    fixInstruction: "Bấm vào biểu tượng ổ khóa (🔒) trên thanh địa chỉ, chọn 'Cài đặt trang web' và cho phép 'Thông báo'.",
    pwaTip: "Mẹo: Cài đặt ứng dụng để nhận thông báo ổn định hơn."
  }
  // Missing languages will fallback to English in App.tsx logic
};
