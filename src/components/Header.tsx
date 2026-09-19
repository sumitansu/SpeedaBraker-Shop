import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, ArrowLeft, Download, Check, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  showBillCanvas?: boolean;
  showAdminCanvas?: boolean;
  onBackToConfig?: () => void;
  onDownloadInvoice?: () => void;
  invoiceNumber?: string;
  onResetClick: () => void;
  onImportClick: () => void;
  onLoginClick?: () => void;
  onOpenAdminCanvas?: () => void;
  isLoggedIn?: boolean;
  currentAdminUser?: string | null;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  showBillCanvas = false,
  showAdminCanvas = false,
  onBackToConfig,
  onDownloadInvoice,
  invoiceNumber = '',
  onResetClick,
  onImportClick,
  onLoginClick,
  onOpenAdminCanvas,
  isLoggedIn = false,
  currentAdminUser = null,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const preventClickRef = useRef(false);

  // Reset / Import hold timer refs
  const [isResetPressing, setIsResetPressing] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isResetLongPressRef = useRef(false);
  const preventResetClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const triggerCopy = () => {
    if (invoiceNumber && navigator.clipboard) {
      navigator.clipboard.writeText(invoiceNumber).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = invoiceNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    }
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2200);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isLongPressRef.current = false;
    preventClickRef.current = false;
    setIsPressing(true);

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      preventClickRef.current = true;
      setIsPressing(false);
      triggerCopy();
    }, 500);
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerCancel = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isLongPressRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (preventClickRef.current) {
      e.preventDefault();
      preventClickRef.current = false;
      return;
    }
    onDownloadInvoice?.();
  };

  const handleResetPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isResetLongPressRef.current = false;
    preventResetClickRef.current = false;
    setIsResetPressing(true);

    resetTimerRef.current = setTimeout(() => {
      isResetLongPressRef.current = true;
      preventResetClickRef.current = true;
      setIsResetPressing(false);
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      onImportClick();
    }, 500);
  };

  const handleResetPointerUp = () => {
    setIsResetPressing(false);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const handleResetPointerCancel = () => {
    setIsResetPressing(false);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    isResetLongPressRef.current = false;
  };

  const handleResetClick = (e: React.MouseEvent) => {
    if (preventResetClickRef.current) {
      e.preventDefault();
      preventResetClickRef.current = false;
      return;
    }
    onResetClick();
  };

  return (
    <header
      id="app-header"
      className="h-14 sm:h-15 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/90 flex items-center shadow-2xs z-30 shrink-0 print:hidden select-none"
    >
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 flex items-center justify-between min-w-0">
        <div id="header-brand" className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 mr-2">
          <motion.h1
            whileHover={{ scale: 1.01 }}
            className="text-sm xs:text-base sm:text-lg md:text-xl font-black tracking-tight text-neutral-900 truncate font-mono cursor-default"
          >
            {t('app.title', "Speedabraker's Shop")}
          </motion.h1>
          {showBillCanvas && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden sm:inline-flex text-[11px] sm:text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200 shrink-0"
            >
              {t('header.viewBill', 'Invoice')}
            </motion.span>
          )}
          {showAdminCanvas && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden sm:inline-flex text-[11px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0"
            >
              {t('header.adminPortal', 'Admin Panel')}
            </motion.span>
          )}
        </div>

        <div id="header-actions-container" className="relative flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
          {showAdminCanvas ? (
            <motion.button
              id="btn-header-back-config-from-admin"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBackToConfig}
              className="flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-lg sm:rounded-xl transition-colors border border-neutral-300 cursor-pointer whitespace-nowrap shadow-2xs"
              title={t('bill.backToConfig', 'Back to Configuration')}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              <span className="hidden sm:inline">{t('bill.backToConfig', 'Back to Config')}</span>
              <span className="sm:hidden">{t('steps.previous', 'Back')}</span>
            </motion.button>
          ) : showBillCanvas ? (
            <>
              <motion.button
                id="btn-header-back-config"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onBackToConfig}
                className="flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-lg sm:rounded-xl transition-colors border border-neutral-300 cursor-pointer whitespace-nowrap shadow-2xs"
                title={t('bill.backToConfig', 'Back to Configuration')}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                <span className="hidden sm:inline">{t('bill.backToConfig', 'Back to Config')}</span>
                <span className="sm:hidden">{t('steps.previous', 'Back')}</span>
              </motion.button>

              <motion.button
                id="btn-header-download-invoice"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerCancel}
                onPointerCancel={handlePointerCancel}
                onClick={handleClick}
                className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none ${
                  copied
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/40'
                    : isPressing
                    ? 'bg-neutral-800 text-neutral-200 scale-98 ring-2 ring-neutral-400/50'
                    : 'bg-neutral-900 hover:bg-black text-white'
                }`}
                title={t('topGrid.copyCode', 'Click to download .sbs invoice, hold to copy Invoice ID')}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="text-[11px] sm:text-xs">{t('topGrid.copied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden xs:inline">{t('bill.exportSBS', 'Download Invoice')}</span>
                    <span className="xs:hidden">{t('bill.export', 'Invoice')}</span>
                  </>
                )}
              </motion.button>
            </>
          ) : (
            <motion.button
              id="btn-reset"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onPointerDown={handleResetPointerDown}
              onPointerUp={handleResetPointerUp}
              onPointerLeave={handleResetPointerCancel}
              onPointerCancel={handleResetPointerCancel}
              onClick={handleResetClick}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all border border-neutral-300 cursor-pointer whitespace-nowrap shadow-2xs select-none ${
                isResetPressing
                  ? 'bg-neutral-200 text-neutral-900 ring-2 ring-neutral-400/40 scale-98'
                  : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300'
              }`}
              title={t('header.resetTooltip', 'Click to reset, hold to import configuration')}
            >
              <RotateCcw
                className={`w-3.5 h-3.5 text-neutral-600 shrink-0 transition-transform duration-200 ${
                  isResetPressing ? '-rotate-90 text-neutral-900' : ''
                }`}
              />
              <span>{t('header.reset', 'Reset')}</span>
            </motion.button>
          )}

          {!showBillCanvas && (
            isLoggedIn ? (
              <motion.button
                id="btn-login"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenAdminCanvas || onLoginClick}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-colors border cursor-pointer whitespace-nowrap shadow-2xs ${
                  showAdminCanvas
                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border-emerald-300 hover:border-emerald-400'
                }`}
                title={`Admin: ${currentAdminUser || 'Admin'}`}
              >
                <Check className={`w-3.5 h-3.5 stroke-[2.5] shrink-0 ${showAdminCanvas ? 'text-white' : 'text-emerald-600'}`} />
                <span className="truncate max-w-[70px] xs:max-w-[90px] sm:max-w-[120px]">{currentAdminUser || t('header.adminPortal', 'Admin')}</span>
              </motion.button>
            ) : (
              <motion.button
                id="btn-login"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onLoginClick}
                className="flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-800 hover:text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 rounded-lg sm:rounded-xl transition-colors border border-neutral-300 hover:border-neutral-400 cursor-pointer whitespace-nowrap shadow-2xs"
                title={t('header.adminLogin', 'Admin Login')}
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                <span>{t('header.adminLogin', 'Login')}</span>
              </motion.button>
            )
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';


