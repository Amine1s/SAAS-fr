import React from 'react';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentView: 'dashboard' | 'code_sandbox';
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  userRole?: 'admin' | 'manager' | 'cashier';
  userName?: string;
}

export default function Header({
  currentView,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
  onLogout,
  userRole,
  userName
}: HeaderProps) {
  // شريط الرأس العلوي وتطبيق المظهر المتطور الداكن/الساطع
  return (
    <header 
      id="app-header"
      className={`py-3.5 px-6 flex items-center justify-between shadow-sm border-b transition-colors duration-500 ${
        darkMode 
          ? 'bg-[#051e16] border-emerald-950/40' 
          : 'bg-white border-emerald-100/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(true)}
          className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
            darkMode ? 'hover:bg-emerald-900/40 text-emerald-400' : 'hover:bg-slate-100 text-[#064E3B]'
          }`}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className={`text-base sm:text-lg font-extrabold transition-colors duration-500 ${
            darkMode ? 'text-emerald-300' : 'text-[#064E3B]'
          }`}>
            {currentView === 'dashboard' ? 'لوحة التحكم السحابية والتحليلات الأسبوعية' : 'بيئة المطور وصياغة الكود API'}
          </h2>
          <p className={`text-xs mt-0.5 transition-colors duration-500 ${
            darkMode ? 'text-emerald-400/60' : 'text-slate-500'
          }`}>نظام إدارة المخازن والفواتير السريع للمتاجر الصغيرة</p>
        </div>
      </div>

      {/* زر المظهر وحالة الاتصال بالسيرفر وزر تسجيل الخروج */}
      <div className="flex items-center gap-3">
        {/* معلومات المستخدم النشط */}
        {userName && (
          <div className="hidden sm:flex flex-col text-left border-l pl-3 border-emerald-550/15" dir="rtl">
            <span className={`text-xs font-bold leading-none ${darkMode ? 'text-white' : 'text-[#064E3B]'}`}>
              {userName}
            </span>
            <span className={`text-[9px] mt-1 font-semibold ${
              userRole === 'admin' 
                ? 'text-emerald-500' 
                : userRole === 'manager' 
                ? 'text-yellow-600 dark:text-amber-400' 
                : 'text-blue-600 dark:text-sky-400'
            }`}>
              {userRole === 'admin' ? '👑 مدير النظام' : userRole === 'manager' ? '📦 مدير مستودع' : '💳 كاشير / محاسب'}
            </span>
          </div>
        )}

        <motion.button
          id="theme-toggle-button-header"
          onClick={toggleDarkMode}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95, rotate: 15 }}
          className={`group p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all duration-300 ${
            darkMode 
              ? 'bg-[#0d362a] border-emerald-800 text-amber-400 hover:border-emerald-700 hover:bg-[#124a3a]' 
              : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100/80'
          }`}
          aria-label="تبديل مظهر النظام"
        >
          <motion.div
            animate={{ rotate: darkMode ? 360 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.div>
          <span className="hidden sm:inline text-xs font-bold font-sans">
            {darkMode ? 'الوضع الساطع ' : 'الوضع الداكن'}
          </span>
        </motion.button>

        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors duration-500 ${
          darkMode 
            ? 'text-emerald-300 bg-[#0d362a]/30 border-emerald-900/60' 
            : 'text-slate-500 bg-slate-100 border-slate-200'
        }`}>
          <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="hidden lg:inline font-medium text-[11px]">حالة السيرفر:</span>
          <span className={`font-mono font-bold text-[11px] ${darkMode ? 'text-emerald-400' : 'text-[#064E3B]'}`}>متصل</span>
        </div>

        {/* زر تسجيل الخروج */}
        <button
          id="logout-btn"
          onClick={onLogout}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            darkMode
              ? 'border-red-900/40 text-red-400 bg-red-950/25 hover:bg-red-950/60 hover:text-red-300'
              : 'border-red-100 text-red-650 bg-red-50/50 hover:bg-red-100/60'
          }`}
          title="تسجيل الخروج من ساس وب"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
