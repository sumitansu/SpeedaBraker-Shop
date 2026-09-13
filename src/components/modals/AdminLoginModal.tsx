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
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  verifyAdminCredentials,
  checkLockoutStatus,
  sanitizeAndValidateAccount,
} from '../../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  currentAdminUser: string | null;
  onLoginSuccess: (username: string, role: string) => void;
  onLogout: () => void;
}

const TERMINAL_TYPING_MESSAGES = [
  'Initializing encrypted authentication gateway...',
  'Security check: Firestore admin privileges required.',
  'Enter administrator credentials to proceed...',
  'All access attempts are logged and monitored.',
];

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  currentAdminUser,
  onLoginSuccess,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);

  // Typewriter Terminal Animation State
  const [typedText, setTypedText] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const accountInputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect loop when modal is open and user is not yet logged in
  useEffect(() => {
    if (!isOpen || isLoggedIn || justLoggedIn) return;

    let timer: ReturnType<typeof setTimeout>;
    const currentFullText = TERMINAL_TYPING_MESSAGES[msgIndex % TERMINAL_TYPING_MESSAGES.length];

    if (!isDeleting) {
      if (typedText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setTypedText(currentFullText.slice(0, typedText.length + 1));
        }, 35);
      } else {
        // Pause at end of sentence before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => {
          setTypedText(currentFullText.slice(0, typedText.length - 1));
        }, 18);
      } else {
        setIsDeleting(false);
        setMsgIndex((prev) => (prev + 1) % TERMINAL_TYPING_MESSAGES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [isOpen, isLoggedIn, justLoggedIn, typedText, isDeleting, msgIndex]);

  // Focus input and check initial lockout on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setJustLoggedIn(false);
      setTypedText('');
      setIsDeleting(false);
      setMsgIndex(0);

      const status = checkLockoutStatus();
      if (status.isLocked) {
        setLockoutCountdown(status.remainingSeconds);
      } else {
        setLockoutCountdown(0);
        if (!isLoggedIn) {
          setTimeout(() => accountInputRef.current?.focus(), 100);
        }
      }
    }
  }, [isOpen, isLoggedIn]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || lockoutCountdown > 0) return;

    setErrorMsg(null);

    // Client-side quick injection check
    const validation = sanitizeAndValidateAccount(account);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid account name format.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyAdminCredentials(account, password);

      if (result.success && result.username) {
        setJustLoggedIn(true);
        onLoginSuccess(result.username, result.role || 'admin');
        setPassword('');
        setErrorMsg(null);
      } else {
        setErrorMsg(result.error || 'Authentication failed. Access denied.');
        if (result.lockoutSeconds && result.lockoutSeconds > 0) {
          setLockoutCountdown(result.lockoutSeconds);
        }
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
    setAccount('');
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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              onClose();
            }
          }}
        >
          <motion.div
            id="admin-login-modal-card"
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">{t('modals.adminLogin.title', 'Admin Authentication')}</h2>
                  <p className="text-xs text-neutral-500">{t('modals.adminLogin.subtitle', 'Secure Firestore access gateway')}</p>
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
              {/* Typewriter Terminal Animation Bar (Active when not logged in) */}
              {!isLoggedIn && !justLoggedIn && (
                <motion.div
                  id="admin-typing-terminal-banner"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono text-xs shadow-inner flex items-center gap-2 min-h-[36px]"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-500 font-bold select-none">&gt;</span>
                  <div className="flex-1 truncate tracking-tight text-[11px] sm:text-xs">
                    <span>{typedText}</span>
                    <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
                  </div>
                </motion.div>
              )}

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
                      {t('modals.adminLogin.loggedInAs', 'Logged in as')} <span className="text-emerald-700">{currentAdminUser || account || 'Admin'}</span>
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      {t('modals.adminLogin.verifiedFirestore', 'Administrator credentials verified against Firebase Firestore database.')}
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
                  {/* Error or Lockout Alert */}
                  {errorMsg && (
                    <motion.div
                      id="admin-login-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{errorMsg}</div>
                    </motion.div>
                  )}

                  {lockoutCountdown > 0 && (
                    <motion.div
                      id="admin-login-lockout-banner"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-800 font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        {t('modals.adminLogin.rateLimit', 'Rate Limit Lock: Try again in')} <span className="font-bold text-amber-900">{lockoutCountdown}s</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Account / Username Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="admin-account-input"
                      className="block text-xs font-semibold text-neutral-700"
                    >
                      {t('modals.adminLogin.account', 'Account / Username')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="admin-account-input"
                        name="admin_acc_field"
                        ref={accountInputRef}
                        type="text"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        placeholder={t('modals.adminLogin.accountPlaceholder', 'Enter account username')}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        data-lpignore="true"
                        data-form-type="other"
                        disabled={isLoading || lockoutCountdown > 0}
                        maxLength={32}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="admin-password-input"
                      className="block text-xs font-semibold text-neutral-700"
                    >
                      {t('modals.adminLogin.password', 'Password')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
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
                        disabled={isLoading || lockoutCountdown > 0}
                        maxLength={128}
                        className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <button
                        id="btn-toggle-admin-password"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    id="btn-submit-admin-login"
                    type="submit"
                    whileHover={!isLoading && lockoutCountdown === 0 && account.trim() && password ? { scale: 1.02 } : undefined}
                    whileTap={!isLoading && lockoutCountdown === 0 && account.trim() && password ? { scale: 0.98 } : undefined}
                    disabled={isLoading || lockoutCountdown > 0 || !account.trim() || !password}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
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


