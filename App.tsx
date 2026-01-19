
import React from 'react';
import TestComponent from './components/TestComponent';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', color: 'darkblue' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>HydroFlow Test</h1>
      <p>If you see this with blue background, the app is working!</p>
      <TestComponent />
    </div>
  );
};
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600">HydroFlow Test</h1>
      <p>If you see this, the app is working!</p>
    </div>
  );
};

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
          // renotify: true giúp điện thoại rung/chuông lại ngay cả khi thông báo cũ chưa bị tắt
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

  // Logic bộ đếm và thông báo mới
  useEffect(() => {
    if (!settings.notificationsEnabled || permissionStatus !== 'granted') {
      setTimeLeft(null);
      lastIntervalIndexRef.current = -1; // Reset khi tắt
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const nowTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      const [sh, sm] = settings.startTime.split(':').map(Number);
      const [eh, em] = settings.endTime.split(':').map(Number);
      const startSecs = sh * 3600 + sm * 60;
      const endSecs = eh * 3600 + em * 60;

      // Trong khoảng thời gian hoạt động
      if (nowTotalSeconds >= startSecs && nowTotalSeconds <= endSecs) {
        const intervalSecs = Math.max(1, settings.reminderInterval) * 60;
        const elapsedSinceStart = nowTotalSeconds - startSecs;
        
        // Tính xem hiện tại đang ở chu kỳ thứ mấy (0, 1, 2...)
        const currentIntervalIndex = Math.floor(elapsedSinceStart / intervalSecs);
        const secondsInCurrentInterval = elapsedSinceStart % intervalSecs;
        const secondsToNext = intervalSecs - secondsInCurrentInterval;
        
        const m = Math.floor(secondsToNext / 60);
        const s = secondsToNext % 60;
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

        // KIỂM TRA BẮN THÔNG BÁO:
        // Nếu đây là lần đầu chạy, gán index hiện tại để không bắn ngay lập tức khi vừa mở app
        if (lastIntervalIndexRef.current === -1) {
          lastIntervalIndexRef.current = currentIntervalIndex;
        } 
        // Nếu index hiện tại lớn hơn index đã bắn gần nhất -> Đã bước sang chu kỳ mới
        else if (currentIntervalIndex > lastIntervalIndexRef.current) {
          triggerNotification(t.remindTitle, t.remindBody);
          lastIntervalIndexRef.current = currentIntervalIndex;
        }
      } else {
        setTimeLeft(null);
        lastIntervalIndexRef.current = -1;
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [settings.notificationsEnabled, settings.startTime, settings.endTime, settings.reminderInterval, t, permissionStatus, triggerNotification]);

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
    setHasUnsavedChanges(false);
    // Khi nhấn lưu, reset index để bắt đầu tính chu kỳ mới từ thời điểm này
    lastIntervalIndexRef.current = -1; 
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
                <p className="text-xs font-bold">{t.install} HydroFlow</p>
                <p className="text-[10px] opacity-80">{t.installDesc}</p>
              </div>
            </div>
            <button onClick={installPWA} className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{t.install}</button>
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
                {permissionStatus === 'denied' ? t.blocked : (settings.notificationsEnabled 
                  ? (timeLeft || t.outsideHours)
                  : t.off)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => triggerNotification(t.remindTitle, t.testSuccess)}
            className="px-4 py-4 bg-white rounded-[24px] shadow-md border border-slate-50 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-blue-600 min-w-[120px] shrink-0"
          >
            <PlayCircle size={32} strokeWidth={2} />
            <span className="text-[10px] font-black uppercase tracking-tight text-center leading-none">{t.testNotif}</span>
          </button>
        </div>

        {/* Permission Guide */}
        {permissionStatus === 'denied' && (
          <div className="bg-red-50 border border-red-100 p-5 rounded-[28px] flex items-start gap-4">
            <Lock size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-red-800 font-bold uppercase tracking-tight leading-none mb-2">{t.howToFix}</p>
              <p className="text-[10px] text-red-700 leading-relaxed font-medium">
                {t.fixInstruction}
              </p>
            </div>
          </div>
        )}

        {/* Main Switch */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${settings.notificationsEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{t.reminders}</h3>
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

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 uppercase">{t.start}</label>
            <input type="time" value={settings.startTime} onChange={(e) => { setSettings(s => ({...s, startTime: e.target.value})); setHasUnsavedChanges(true); }} className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-700 focus:ring-0 leading-none" />
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 uppercase">{t.end}</label>
            <input type="time" value={settings.endTime} onChange={(e) => { setSettings(s => ({...s, endTime: e.target.value})); setHasUnsavedChanges(true); }} className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-700 focus:ring-0 leading-none" />
          </div>
        </div>

        {/* Frequency Slider */}
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-blue-500" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest uppercase">{t.frequency}</h4>
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
            <span className="uppercase tracking-tight">{t.save}</span>
          </button>
        </div>

      </div>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-t-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">LANGUAGE / NGÔN NGỮ</h2>
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
