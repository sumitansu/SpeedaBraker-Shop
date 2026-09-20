import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { loginAdminWithFirebase } from '../../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  currentAdminUser: string | null;
  onLoginSuccess: (username: string, role: string) => void;
  onLogout: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  currentAdminUser,
  onLoginSuccess,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setJustLoggedIn(false);
      if (!isLoggedIn) {
        setTimeout(() => emailInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAdminWithFirebase(cleanEmail, password);

      if (result.success && result.username) {
        setJustLoggedIn(true);
        onLoginSuccess(result.username, result.role || 'admin');
        setPassword('');
        setErrorMsg(null);
      } else {
        setErrorMsg(result.error || 'Authentication failed. Access denied.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setEmail('');
    setPassword('');
    setJustLoggedIn(false);
    setErrorMsg(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="admin-login-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              onClose();
            }
          }}
        >
          <motion.div
            id="admin-login-modal-card"
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    {t('modals.adminLogin.title', 'Admin Portal')}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {t('modals.adminLogin.subtitle', 'Authentication & store management')}
                  </p>
                </div>
              </div>
              <motion.button
                id="btn-close-admin-login-modal"
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
                title={t('common.close', 'Close')}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Active Logged-in or Just-Logged-in View: Shows Green Checkmark */}
              {isLoggedIn || justLoggedIn ? (
                <motion.div
                  id="admin-logged-in-status"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 flex flex-col items-center text-center space-y-3"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm"
                    >
                      <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                    </motion.div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                      ✓
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      {t('modals.adminLogin.authenticatedAdmin', 'Authenticated Admin')}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {t('modals.adminLogin.loggedInAs', 'Logged in as')}{' '}
                      <span className="text-emerald-700">{currentAdminUser || email || 'Admin'}</span>
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      {t(
                        'modals.adminLogin.verifiedFirestore',
                        'Signed in as administrator.'
                      )}
                    </p>
                  </div>

                  <div className="w-full pt-4 flex gap-2.5 justify-center">
                    <motion.button
                      id="btn-admin-logout"
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLogoutClick}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('modals.adminLogin.logOut', 'Log Out')}</span>
                    </motion.button>
                    <motion.button
                      id="btn-admin-close"
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onClose}
                      className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      {t('modals.adminLogin.done', 'Done')}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* Login Form */
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                  {/* Error Alert */}
                  {errorMsg && (
                    <motion.div
                      id="admin-login-error"
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{errorMsg}</div>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="admin-email-input"
                      className="block text-xs font-semibold text-neutral-700"
                    >
                      {t('modals.adminLogin.account', 'Admin Email')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="admin-email-input"
                        name="admin_email_field"
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('modals.adminLogin.emailPlaceholder', 'admin@example.com')}
                        autoComplete="email"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        data-lpignore="true"
                        data-form-type="other"
                        disabled={isLoading}
                        maxLength={96}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 focus:border-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Password Field with Smooth Show/Hide Transition */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="admin-password-input"
                      className="block text-xs font-semibold text-neutral-700"
                    >
                      {t('modals.adminLogin.password', 'Password')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="admin-password-input"
                        name="admin_pwd_field"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('modals.adminLogin.passwordPlaceholder', 'Enter admin password')}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        data-lpignore="true"
                        data-form-type="other"
                        disabled={isLoading}
                        maxLength={128}
                        className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 focus:border-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                      />
                      {/* Smooth Password Eye Toggle with rotation & scale morph */}
                      <motion.button
                        id="btn-toggle-admin-password"
                        type="button"
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {showPassword ? (
                            <motion.span
                              key="eye-off"
                              initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
                              animate={{ opacity: 1, rotate: 0, scale: 1 }}
                              exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="inline-flex items-center justify-center"
                            >
                              <EyeOff className="w-4 h-4 text-neutral-800" />
                            </motion.span>
                          ) : (
                            <motion.span
                              key="eye-on"
                              initial={{ opacity: 0, rotate: 35, scale: 0.7 }}
                              animate={{ opacity: 1, rotate: 0, scale: 1 }}
                              exit={{ opacity: 0, rotate: -35, scale: 0.7 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="inline-flex items-center justify-center"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    id="btn-submit-admin-login"
                    type="submit"
                    whileHover={
                      !isLoading && email.trim() && password
                        ? { scale: 1.02 }
                        : undefined
                    }
                    whileTap={
                      !isLoading && email.trim() && password
                        ? { scale: 0.98 }
                        : undefined
                    }
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-black active:bg-neutral-950 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('modals.adminLogin.verifying', 'Verifying Credentials...')}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{t('modals.adminLogin.loginBtn', 'Login as Admin')}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};




