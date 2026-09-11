import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, ArrowLeft, Download, Check, Upload } from 'lucide-react';

interface HeaderProps {
  showBillCanvas?: boolean;
  onBackToConfig?: () => void;
  onDownloadInvoice?: () => void;
  invoiceNumber?: string;
  onResetClick: () => void;
  onImportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBillCanvas = false,
  onBackToConfig,
  onDownloadInvoice,
  invoiceNumber = '',
  onResetClick,
  onImportClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const preventClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerCopy = () => {
    if (invoiceNumber && navigator.clipboard) {
      navigator.clipboard.writeText(invoiceNumber).catch(() => {
        // Fallback for older browsers
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
    if (e.button !== 0) return; // Only primary mouse/touch button
    isLongPressRef.current = false;
    preventClickRef.current = false;
    setIsPressing(true);

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      preventClickRef.current = true;
      setIsPressing(false);
      triggerCopy();
    }, 500); // 500ms hold threshold
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPressRef.current) {
      // Normal click -> trigger download
      onDownloadInvoice?.();
    }
    isLongPressRef.current = false;
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
    // Prevent default click if a long press already consumed the action
    if (preventClickRef.current) {
      e.preventDefault();
      preventClickRef.current = false;
    }
  };

  return (
    <header
      id="app-header"
      className="h-14 px-3 sm:px-6 bg-white border-b border-neutral-200 flex items-center justify-between shadow-xs z-10 shrink-0 print:hidden select-none"
    >
      <div id="header-brand" className="flex items-center space-x-2 min-w-0">
        <h1 className="text-base sm:text-xl font-bold tracking-tight text-neutral-900 truncate">
          Speedabraker's Shop
        </h1>
        {showBillCanvas && (
          <span className="hidden xs:inline text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
            Invoice
          </span>
        )}
      </div>

      <div id="header-actions-container" className="relative flex items-center gap-1.5 sm:gap-2 shrink-0">
        {showBillCanvas ? (
          <>
            <button
              id="btn-header-back-config"
              type="button"
              onClick={onBackToConfig}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-lg transition-colors border border-neutral-300 cursor-pointer whitespace-nowrap"
              title="Back to Configuration"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              <span className="hidden sm:inline">Back to Config</span>
              <span className="sm:hidden">Back</span>
            </button>

            <button
              id="btn-header-download-invoice"
              type="button"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerCancel}
              onPointerCancel={handlePointerCancel}
              onClick={handleClick}
              className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none active:scale-98 ${
                copied
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/40'
                  : isPressing
                  ? 'bg-neutral-800 text-neutral-200 scale-98 ring-2 ring-neutral-400/50'
                  : 'bg-neutral-900 hover:bg-black text-white'
              }`}
              title="Click to download .sbs invoice, hold to copy Invoice ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Invoice ID Copied!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Download Invoice</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div id="header-config-actions" className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="btn-reset"
              type="button"
              onClick={onResetClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-lg transition-colors border border-neutral-300 cursor-pointer whitespace-nowrap shadow-2xs"
              title="Reset configuration"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              <span>Reset</span>
            </button>

            <button
              id="btn-import"
              type="button"
              onClick={onImportClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors border border-neutral-300 hover:border-neutral-400 cursor-pointer whitespace-nowrap shadow-2xs"
              title="Import Item Code or Invoice ID"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
              <span>Import</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
