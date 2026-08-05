import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, LogIn, Eye, EyeOff, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (session: { username: string; name: string; role: 'admin' | 'manager' | 'cashier' }) => void;
  darkMode: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, darkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // تتبع هجمات التخمين والحد من المحاولات
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('login_failed_attempts');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => {
    try {
      const lockUntil = localStorage.getItem('login_lockout_until');
      if (lockUntil) {
        const remaining = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // التنبيه المنبثق التلقائي الناعم (2 ثانية)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'red' | 'yellow' | 'green' } | null>(null);

  const showToast = (text: string, type: 'red' | 'yellow' | 'green' = 'red') => {
    setToastMessage({ text, type });
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2000); // 2 ثانية بالضبط مع ظهور سلس
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // عداد الحظر التنازلي الحقيقي لمنع الهجمات
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('login_lockout_until');
            localStorage.removeItem('login_failed_attempts');
            setFailedAttempts(0);
            showToast('تم فك حظر المحاولات، يمكنك تسجيل الدخول الآن.', 'green');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق من حالة حظر المحاولات
    if (lockoutSeconds > 0) {
      const msg = `النظام مقتفل لحماية اللوحة من الهجمات. انتظر ${lockoutSeconds} ثانية.`;
      setError(msg);
      showToast(msg, 'red');
      return;
    }

    setIsLoading(true);

    // محاكاة تأخير بسيط لتجربة مستخدم ممتازة
    setTimeout(() => {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      if ((u === 'saas app' && p === 'start1@5') || (u === 'admin' && p === 'admin@123')) {
        // نجاح تسجيل الدخول - إعادة تعيين عداد المحاولات الخاطئة
        localStorage.removeItem('login_failed_attempts');
        localStorage.removeItem('login_lockout_until');
        setFailedAttempts(0);

        const session = { username: 'admin', name: 'أمين محمد', role: 'admin' as const };
        localStorage.setItem('saas_app_logged_in', 'true');
        localStorage.setItem('saas_user_role', 'admin');
        localStorage.setItem('saas_user_name', 'أمين محمد (مدير النظام)');
        onLoginSuccess(session);
      } else if (u === 'manager' && p === 'manager@123') {
        localStorage.removeItem('login_failed_attempts');
        localStorage.removeItem('login_lockout_until');
        setFailedAttempts(0);

        const session = { username: 'manager', name: 'خالد أحمد', role: 'manager' as const };
        localStorage.setItem('saas_app_logged_in', 'true');
        localStorage.setItem('saas_user_role', 'manager');
        localStorage.setItem('saas_user_name', 'خالد أحمد (مدير المستودع)');
        onLoginSuccess(session);
      } else if (u === 'cashier' && p === 'cashier@123') {
        localStorage.removeItem('login_failed_attempts');
        localStorage.removeItem('login_lockout_until');
        setFailedAttempts(0);

        const session = { username: 'cashier', name: 'فاطمة علي', role: 'cashier' as const };
        localStorage.setItem('saas_app_logged_in', 'true');
        localStorage.setItem('saas_user_role', 'cashier');
        localStorage.setItem('saas_user_name', 'فاطمة علي (أمين الصندوق)');
        onLoginSuccess(session);
      } else {
        // فشل الدخول - زيادة عداد المحاولات الخاطئة والتحقق من الهجوم
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        localStorage.setItem('login_failed_attempts', String(nextAttempts));

        if (nextAttempts >= 4) {
          // تفعيل حظر هجمات التخمين المباشر لمدة 60 ثانية
          const lockTime = 60;
          const until = Date.now() + lockTime * 1000;
          localStorage.setItem('login_lockout_until', String(until));
          setLockoutSeconds(lockTime);

          const lockMsg = '🚨 تم تفعيل نظام الحماية الذكية! حظر المحاولات لمدة 60 ثانية بسبب تكرار كلمة المرور الخاطئة.';
          setError(lockMsg);
          showToast(lockMsg, 'red');
        } else {
          const remaining = 4 - nextAttempts;
          const errMsg = `اسم المستخدم أو كلمة المرور غير صحيحة. باقي لديك ${remaining} محاولات قبل حظر الدخول.`;
          setError(errMsg);
          showToast(errMsg, 'yellow');
        }
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className={`login-page-container min-h-screen flex items-center justify-center p-3.5 sm:p-4 transition-all duration-500 font-sans relative ${
      darkMode 
        ? 'bg-[#031510] text-emerald-100' 
        : 'bg-gradient-to-tr from-[#E6F4EA] via-[#F4FBF7] to-[#FFFFFF] text-slate-800'
    }`} dir="rtl">

      {/* التنبيه المنبثق الناعم والعصري */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-3 font-sans pointer-events-none"
          >
            <div className={`py-2 px-4 rounded-full shadow-lg border backdrop-blur-xl flex items-center gap-2.5 pointer-events-auto transition-all ${
              toastMessage.type === 'green' 
                ? 'bg-slate-900/90 dark:bg-emerald-950/90 border-emerald-500/35 text-emerald-100 shadow-emerald-950/30' 
                : toastMessage.type === 'yellow'
                ? 'bg-slate-900/90 dark:bg-amber-950/90 border-amber-500/35 text-amber-100 shadow-amber-950/30'
                : 'bg-slate-900/90 dark:bg-rose-950/90 border-rose-500/35 text-rose-100 shadow-rose-950/30'
            }`}>
              {toastMessage.type === 'green' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : toastMessage.type === 'yellow' ? (
                <Info className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap">{toastMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* طبقات الخلفية الجمالية الدائرية */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`login-card w-full max-w-md border rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md transition-colors duration-500 mx-3 my-4 ${
          darkMode 
            ? 'bg-[#05231b]/95 border-emerald-900/60 shadow-black/80' 
            : 'bg-white/90 border-emerald-100/90 shadow-slate-200'
        }`}
      >
        {/* شريط زينة جمالي علوي */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* ترويسة النموذج */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mb-2">
            <ShieldCheck className="h-8 w-8 text-emerald-500 dark:text-emerald-400" id="login-icon" />
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-[#064E3B]'}`}>
            مرحباً بك مجدداً
          </h2>
          <p className={`text-xs ${darkMode ? 'text-emerald-400/60' : 'text-slate-500'}`}>
            الرجاء تسجيل الدخول للوصول إلى نظام إدارة المتاجر السحابية
          </p>
        </div>

        {/* مؤشر حظر المحاولات وإجراءات الأمان */}
        {lockoutSeconds > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-200 text-xs text-center font-bold flex flex-col items-center gap-2 shadow-lg"
          >
            <div className="flex items-center gap-2 text-rose-400 text-sm">
              <ShieldAlert className="h-5 w-5 animate-bounce" />
              <span>نظام الأمان: محظور مؤقتاً لحماية اللوحة</span>
            </div>
            <div className="font-mono text-base font-extrabold text-amber-300 bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30">
              يرجى الانتظار {lockoutSeconds} ثانية
            </div>
          </motion.div>
        )}

        {/* رسائل التنبيه والخطأ */}
        {error && lockoutSeconds === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold ${darkMode ? 'text-emerald-300' : 'text-[#064E3B]'}`}>
              اسم المستخدم
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <User className={`h-4 w-4 ${darkMode ? 'text-emerald-500/60' : 'text-slate-400'}`} />
              </span>
              <input 
                id="username-input"
                type="text"
                required
                disabled={lockoutSeconds > 0}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="saas app"
                className={`w-full pr-10 pl-4 py-3 text-xs sm:text-sm rounded-xl border outline-none font-sans font-medium transition-all ${
                  lockoutSeconds > 0 ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''
                } ${
                  darkMode 
                    ? 'bg-[#031510] border-emerald-900/60 text-white placeholder-emerald-900/70 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={`block text-xs font-bold ${darkMode ? 'text-emerald-300' : 'text-[#064E3B]'}`}>
                كلمة السر
              </label>
              <div className={`text-[10px] select-none font-bold font-sans ${darkMode ? 'text-emerald-400/50' : 'text-slate-400'}`}>
                تلميح: start1@5
              </div>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <Lock className={`h-4 w-4 ${darkMode ? 'text-emerald-500/60' : 'text-slate-400'}`} />
              </span>
              <input 
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={lockoutSeconds > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pr-10 pl-11 py-3 text-xs sm:text-sm rounded-xl border outline-none font-sans font-medium transition-all ${
                  lockoutSeconds > 0 ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''
                } ${
                  darkMode 
                    ? 'bg-[#031510] border-emerald-900/60 text-white placeholder-emerald-900/70 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading || lockoutSeconds > 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
              isLoading || lockoutSeconds > 0
                ? 'bg-slate-700/60 cursor-not-allowed opacity-60' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : lockoutSeconds > 0 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>المحاولات محظورة ({lockoutSeconds}ث)</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>دخول آمن للمشغل</span>
              </>
            )}
          </button>
        </form>

        {/* بطاقة توضيح حسابات الصلاحيات للتجربة السهلة */}
        <div className={`mt-6 p-4 rounded-xl border text-xs space-y-2.5 transition-colors duration-500 ${
          darkMode 
            ? 'bg-[#031510]/50 border-emerald-950 text-emerald-300' 
            : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
        }`}>
          <div className="font-bold flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>بيانات المرور لتجربة نظام الصلاحيات (RBAC):</span>
          </div>
          
          <div className="space-y-2 font-sans text-[11px] divide-y divide-emerald-550/10">
            <button 
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={() => { setUsername('admin'); setPassword('admin@123'); }}
              className="w-full text-right block pt-1.5 hover:opacity-85 disabled:opacity-40"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-500 dark:text-emerald-400">👑 أدمن (مدير النظام)</span>
                <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-500 font-mono">نقرة للتعبئة</span>
              </div>
              <span className="text-slate-500 dark:text-emerald-500/60 font-mono">مستخدم: admin | كلمة سر: admin@123</span>
            </button>

            <button 
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={() => { setUsername('manager'); setPassword('manager@123'); }}
              className="w-full text-right block pt-1.5 hover:opacity-85 disabled:opacity-40"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-600 dark:text-amber-400">📦 مدير مستودع (المخازن)</span>
                <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-500 font-mono">نقرة للتعبئة</span>
              </div>
              <span className="text-slate-500 dark:text-emerald-500/60 font-mono">مستخدم: manager | كلمة سر: manager@123</span>
            </button>

            <button 
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={() => { setUsername('cashier'); setPassword('cashier@123'); }}
              className="w-full text-right block pt-1.5 hover:opacity-85 disabled:opacity-40"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-600 dark:text-sky-400">💳 كاشير / محاسب (مبيعات)</span>
                <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-500 font-mono">نقرة للتعبئة</span>
              </div>
              <span className="text-slate-500 dark:text-emerald-500/60 font-mono">مستخدم: cashier | كلمة سر: cashier@123</span>
            </button>
          </div>
        </div>

        {/* ذيل السجل كإشارة أمان معتمدة */}
        <div className="mt-8 pt-4 border-t border-dashed border-emerald-900/30 dark:border-emerald-800/20 text-center">
          <p className={`text-[10px] font-sans flex items-center justify-center gap-1.5 ${darkMode ? 'text-emerald-500/40' : 'text-slate-400'}`}>
            <span>نظام SaaS السحابي المحمي ضد الاختراق</span>
            <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
            <span>Rate-Limited & SSL Secured</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
