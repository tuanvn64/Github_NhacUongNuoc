
import React from 'react';
import { Droplets, Languages as LangIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLanguageClick?: () => void;
  currentFlag?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onLanguageClick, currentFlag }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 bg-white sticky top-0 z-20 flex justify-between items-center border-b border-slate-100">
        <div className="w-10"></div> {/* Spacer */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-200">
            <Droplets size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            HydroFlow
          </h1>
        </div>
        <button 
          onClick={onLanguageClick}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-500 relative"
        >
          <LangIcon size={20} />
          {currentFlag && <span className="absolute -top-1 -right-1 text-[10px]">{currentFlag}</span>}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-4 justify-between overflow-hidden">
        {children}
      </main>
      
      <footer className="pb-4 pt-2 text-center">
        <p className="text-[9px] text-slate-300 uppercase tracking-widest font-bold">Stay Hydrated • Stay Healthy</p>
      </footer>
    </div>
  );
};

export default Layout;
