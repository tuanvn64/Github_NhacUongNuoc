
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import { UserSettings } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY, LANGUAGES, TRANSLATIONS } from './constants';
import { Bell, Timer, Save, X, PlayCircle, Lock, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const lastNotifiedTimeRef = useRef<number>(0);

  // Load settings từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed.settings }));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Lắng nghe sự kiện cài đặt PWA
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // Cập nhật trạng thái quyền liên tục
  useEffect(() => {
    if (!('Notification' in window)) return;
    const interval = setInterval(() => {
      if (Notification.permission !== permissionStatus) {
        setPermissionStatus(Notification.permission);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [permissionStatus]);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['en'];

  // HÀM GỬI THÔNG BÁO TỐI ƯU
  const triggerNotification = useCallback(async (title: string, body: string) => {
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted') {
      const p = await Notification.requestPermission();
      setPermissionStatus(p);
      if (p !== 'granted') return;
    }

    const icon = "https://cdn-icons-png.flaticon.com/512/3105/3105807.png";

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          await registration.showNotification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [200, 100, 200],
            tag: 'water-reminder',
            renotify: true,
            requireInteraction: true,
          } as any);
        }
      } catch (e) {
        new Notification(title, { body, icon });
      }
    } else {
      new Notification(title, { body, icon });
    }
  }, []);

  // BỘ ĐẾM NGƯỢC (MM:SS)
  useEffect(() => {
    if (!settings.notificationsEnabled || permissionStatus !== 'granted') {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const nowTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      const [sh, sm] = settings.startTime.split(':').map(Number);
      const [eh, em] = settings.endTime.split(':').map(Number);
      const startSecs = sh * 3600 + sm * 60;
      const endSecs = eh * 3600 + em * 60;

      if (nowTotalSeconds >= startSecs && nowTotalSeconds <= endSecs) {
        const intervalSecs = settings.reminderInterval * 60;
        const elapsedSinceStart = nowTotalSeconds - startSecs;
        const secondsToNext = intervalSecs - (elapsedSinceStart % intervalSecs);
        
        const m = Math.floor(secondsToNext / 60);
        const s = secondsToNext % 60;
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

        if (elapsedSinceStart % intervalSecs === 0 && lastNotifiedTimeRef.current !== Math.floor(nowTotalSeconds/60)) {
          triggerNotification(t.remindTitle, t.remindBody);
          lastNotifiedTimeRef.current = Math.floor(nowTotalSeconds/60);
        }
      } else {
        setTimeLeft(null);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [settings.notificationsEnabled, settings.startTime, settings.endTime, settings.reminderInterval, t, permissionStatus, triggerNotification]);

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
    setHasUnsavedChanges(false);
    if (settings.notificationsEnabled) {
      triggerNotification(t.notifTitle, t.notifBody);
    }
  };

  const currentFlag = LANGUAGES.find(l => l.code === settings.language)?.flag;

  return (
    <Layout 
      onLanguageClick={() => setIsLangModalOpen(true)}
      currentFlag={currentFlag}
    >
      <div className="flex flex-col h-full space-y-5 pb-6 overflow-y-auto no-scrollbar">
        
        {/* PWA Install Promo */}
        {deferredPrompt && (
          <div className="bg-blue-600 p-4 rounded-3xl shadow-lg flex items-center justify-between text-white animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <Smartphone size={24} />
              <div>
                <p className="text-xs font-bold">Cài đặt HydroFlow</p>
                <p className="text-[10px] opacity-80">Thông báo ổn định hơn</p>
              </div>
            </div>
            <button onClick={installPWA} className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black">CÀI ĐẶT</button>
          </div>
        )}

        {/* Status Area */}
        <div className="flex gap-4 items-stretch">
          <div className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4 min-h-[90px]">
            <div className={`w-3 h-3 rounded-full shrink-0 ${settings.notificationsEnabled && timeLeft ? 'bg-green-500 animate-pulse' : (permissionStatus === 'denied' ? 'bg-red-500' : 'bg-slate-300')}`}></div>
            <div className="flex flex-col justify-center overflow-hidden">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider truncate">
                {permissionStatus === 'denied' ? t.blocked : (settings.notificationsEnabled ? t.nextReminder : t.reminders)}
              </p>
              <p className="text-xl font-black text-slate-700 leading-none font-mono tracking-tight mt-1 uppercase">
                {permissionStatus === 'denied' ? 'BỊ CHẶN' : (settings.notificationsEnabled 
                  ? (timeLeft || t.outsideHours)
                  : t.off)}
              </p>
            </div>
          </div>
          
          {/* NÚT THỬ THÔNG BÁO */}
          <button 
            onClick={() => triggerNotification(t.remindTitle, t.testSuccess)}
            className="px-4 py-4 bg-white rounded-[24px] shadow-md border border-slate-50 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-blue-600 min-w-[120px] shrink-0"
          >
            <PlayCircle size={32} strokeWidth={2} />
            <span className="text-[10px] font-black uppercase tracking-tight text-center leading-none">THỬ THÔNG BÁO</span>
          </button>
        </div>

        {/* Hướng dẫn sửa lỗi */}
        {permissionStatus === 'denied' && (
          <div className="bg-red-50 border border-red-100 p-5 rounded-[28px] flex items-start gap-4">
            <Lock size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-red-800 font-bold uppercase tracking-tight leading-none mb-2">Cách bật lại?</p>
              <p className="text-[10px] text-red-700 leading-relaxed font-medium">
                Bấm vào <span className="font-bold">biểu tượng ổ khóa (🔒)</span> hoặc <span className="font-bold">3 chấm</span> ở góc trình duyệt → Cài đặt → Thông báo → Cho phép.
              </p>
            </div>
          </div>
        )}

        {/* NHẮC NHỞ Switch Box */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${settings.notificationsEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">NHẮC NHỞ</h3>
              <p className="text-xs text-slate-400 font-medium lowercase leading-none">{settings.notificationsEnabled ? t.active : t.off}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              if (permissionStatus === 'denied') return;
              if (Notification.permission === 'default') {
                const p = await Notification.requestPermission();
                setPermissionStatus(p);
                if (p === 'granted') setSettings(s => ({...s, notificationsEnabled: true}));
              } else {
                setSettings(s => ({...s, notificationsEnabled: !s.notificationsEnabled}));
              }
              setHasUnsavedChanges(true);
            }}
            className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 ${settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Time Inputs - Đã giảm font size và bỏ overflow-hidden */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">BẮT ĐẦU</label>
            <input type="time" value={settings.startTime} onChange={(e) => { setSettings(s => ({...s, startTime: e.target.value})); setHasUnsavedChanges(true); }} className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-700 focus:ring-0 leading-none" />
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">KẾT THÚC</label>
            <input type="time" value={settings.endTime} onChange={(e) => { setSettings(s => ({...s, endTime: e.target.value})); setHasUnsavedChanges(true); }} className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-700 focus:ring-0 leading-none" />
          </div>
        </div>

        {/* Frequency Slider - Cho phép từ 1 phút */}
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-blue-500" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TẦN SUẤT</h4>
            </div>
            <span className="text-xl font-black text-blue-600">{settings.reminderInterval} <span className="text-xs font-normal text-slate-400 lowercase">{t.mins}</span></span>
          </div>
          <input type="range" min="1" max="180" step="1" value={settings.reminderInterval} onChange={(e) => { setSettings(s => ({...s, reminderInterval: parseInt(e.target.value)})); setHasUnsavedChanges(true); }} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>

        {/* Save Button */}
        <div className="pt-4 mt-auto">
          <button 
            onClick={saveSettings}
            disabled={!hasUnsavedChanges}
            className={`w-full py-5 rounded-[28px] font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 relative ${
              hasUnsavedChanges 
              ? 'bg-blue-600 text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.5)]' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Save size={20} />
            <span className="uppercase tracking-tight">Lưu lịch nhắc nhở</span>
          </button>
        </div>

      </div>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-t-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">Ngôn ngữ</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto py-4 px-2 no-scrollbar">
              {LANGUAGES.map((lang) => (
                <button 
                  key={lang.code} 
                  onClick={() => { setSettings(s => ({...s, language: lang.code})); setHasUnsavedChanges(true); setIsLangModalOpen(false); }} 
                  className={`w-full px-6 py-4 flex items-center gap-4 rounded-2xl mb-1 transition-colors ${settings.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-bold">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
