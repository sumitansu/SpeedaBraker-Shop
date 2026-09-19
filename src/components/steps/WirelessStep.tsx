import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff, Info, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PRICING_CATALOG, applyPsychologicalPricing } from '../../utils/pricing';

interface WirelessStepProps {
  currentVersion: string;
  currentWireless: string;
  onSelectWireless: (val: 'Yes' | 'No') => void;
  onOpenWirelessWarning: () => void;
  onGoToFirmware: () => void;
  stockMap?: Record<string, boolean>;
  onOutOfStockAttempt?: (itemName: string) => void;
}

export const WirelessStep: React.FC<WirelessStepProps> = ({
  currentVersion,
  currentWireless,
  onSelectWireless,
  onOpenWirelessWarning,
  onGoToFirmware,
  stockMap,
  onOutOfStockAttempt,
}) => {
  const { t } = useTranslation();
  const isWirelessInStock = stockMap?.['wireless_5ghz'] !== false;
  const [copiedIp, setCopiedIp] = useState<boolean>(false);
  const copyTimerRef = useRef<number | null>(null);

  const handleSelectYes = () => {
    if (!isWirelessInStock) {
      onOutOfStockAttempt?.(
        t('products.wireless5ghz', '5GHz High-Speed Wireless Control Module')
      );
      return;
    }
    onSelectWireless('Yes');
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const copyIpToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText('http://192.168.1.1')
        .then(() => {
          setCopiedIp(true);
          if (copyTimerRef.current) {
            clearTimeout(copyTimerRef.current);
          }
          copyTimerRef.current = window.setTimeout(() => {
            setCopiedIp(false);
            copyTimerRef.current = null;
          }, 2000);
        })
        .catch(() => {
          // Gracefully ignore clipboard rejection in restricted iframe sandbox
        });
    }
  };

  if (currentVersion === 'None') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3"
        >
          <AlertCircle className="w-6 h-6" />
        </motion.div>
        <h3 className="text-lg font-bold text-neutral-900">
          {t('steps.display.firmwareRequired', 'Firmware Selection Required')}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
          {t('steps.display.firmwareRequiredDesc', 'Please select a firmware version first before configuring wireless control options.')}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onGoToFirmware}
          className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
        >
          {t('steps.display.selectFirmwareBtn', 'Select Firmware')}
        </motion.button>
      </div>
    );
  }

  return (
    <div
      id="wireless-question-container"
      className="w-full h-full flex flex-col justify-between p-1 sm:p-2 min-h-0"
    >
      {/* Main Question Center Banner */}
      <motion.div
        id="wireless-question-title-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center py-1 sm:py-2 shrink-0"
      >
        <h2
          id="heading-do-you-want-wireless-control"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          {t('steps.wireless.title', 'Do you want wireless control?')}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          {t('steps.wireless.desc', 'Control your device wirelessly on a 5GHz Wi-Fi network.')}
        </p>
      </motion.div>

      {/* Options: No and Yes cards */}
      <div
        id="wireless-options-grid"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0 py-1"
      >
        {/* Option 1: No */}
        <motion.div
          id="card-wireless-no"
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => onSelectWireless('No')}
          className={`rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
            currentWireless === 'No'
              ? 'bg-white border-2 border-red-500 shadow-md ring-2 sm:ring-4 ring-red-500/10'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm'
          }`}
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentWireless === 'No'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <WifiOff className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                  {t('steps.wireless.no.title', 'No')}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                  {t('steps.wireless.no.subtitle', 'Onboard push button control')}
                </p>
              </div>
            </div>
            {currentWireless === 'No' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold border border-red-300"
              >
                {t('steps.wireless.no.selected', 'Selected')}
              </motion.span>
            )}
          </div>

          {/* Middle detail */}
          <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
            <p>
              {t('steps.wireless.no.desc', 'Wireless Wi-Fi control is disabled. The device can be operated directly using the onboard push buttons.')}
            </p>
          </div>

          {/* Footer & Price */}
          <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                {t('bill.price', 'Cost')}
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">₹0</span>
            </div>

            <motion.button
              id="btn-select-wireless-no"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectWireless('No');
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                currentWireless === 'No'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {currentWireless === 'No' ? t('steps.wireless.no.selected', 'Selected') : t('steps.wireless.no.select', 'No')}
            </motion.button>
          </div>
        </motion.div>

        {/* Option 2: Yes */}
        <motion.div
          id="card-wireless-yes"
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleSelectYes}
          className={`rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
            currentWireless === 'Yes'
              ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
              : !isWirelessInStock
              ? 'bg-white/70 border border-rose-200 shadow-xs hover:border-rose-300'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm'
          }`}
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentWireless === 'Yes'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <Wifi className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                    {t('steps.wireless.yes.title', 'Yes')}
                  </h3>
                  <motion.button
                    id="btn-wireless-warning-info"
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWirelessWarning();
                    }}
                    title="5GHz Wi-Fi Compatibility Warning"
                    aria-label="5GHz Wi-Fi Compatibility Warning"
                    className="inline-flex items-center justify-center w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer text-xs font-bold shrink-0 shadow-2xs border border-red-300"
                  >
                    <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </motion.button>
                  {isWirelessInStock ? (
                    <span
                      id="badge-wireless-in-stock"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('steps.display.yes.inStock', 'In Stock')}</span>
                    </span>
                  ) : (
                    <span
                      id="badge-wireless-out-of-stock"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{t('steps.display.yes.outOfStock', 'Out of Stock')}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                  {currentVersion === 'V1' ? t('steps.wireless.yes.reqV2', 'Requires V2 firmware upgrade') : t('steps.wireless.yes.subtitle', '5GHz Wi-Fi Web Interface')}
                </p>
              </div>
            </div>
            {currentWireless === 'Yes' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold border border-emerald-300"
              >
                {t('steps.wireless.yes.selected', 'Selected')}
              </motion.span>
            )}
          </div>

          {/* Middle detail */}
          <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
            <p>
              {t('steps.wireless.yes.desc', "Enables wireless device control over a 5GHz Wi-Fi network. Connect to the device's Wi-Fi AP and open")}{' '}
              <motion.button
                id="btn-copy-ip"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyIpToClipboard}
                title="Click to copy IP to clipboard"
                className="inline-flex items-center gap-1.5 font-mono font-bold text-neutral-800 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-300/80 px-2 py-0.5 rounded-md text-[11px] sm:text-xs transition-all cursor-pointer shadow-2xs group align-baseline"
              >
                <span>http://192.168.1.1</span>
                <AnimatePresence mode="wait">
                  {copiedIp ? (
                    <motion.span
                      key="copied"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-0.5 text-emerald-600 font-sans text-[10px] font-bold"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{t('steps.wireless.yes.copied', 'Copied')}</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy-icon"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center"
                    >
                      <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>{' '}
              {t('steps.wireless.yes.inBrowser', 'in any web browser.')}
            </p>
          </div>

          {/* Footer & Price */}
          <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                {t('bill.price', 'Cost')}
              </span>
              <span className={`text-base sm:text-xl md:text-2xl font-mono font-black ${
                isWirelessInStock ? 'text-neutral-900' : 'text-neutral-400 line-through'
              }`}>
                ₹{applyPsychologicalPricing(PRICING_CATALOG.wireless.Yes + (currentVersion === 'V1' ? (PRICING_CATALOG.version.V2 - PRICING_CATALOG.version.V1) : 0))}
              </span>
            </div>

            <motion.button
              id="btn-select-wireless-yes"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectYes();
              }}
              className={`transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentWireless === 'Yes' && currentVersion === 'V2'
                  ? 'px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs'
                  : !isWirelessInStock
                  ? 'px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 shadow-2xs'
                  : 'px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {currentWireless === 'Yes' && currentVersion === 'V2'
                ? t('steps.wireless.yes.selected', 'Selected')
                : !isWirelessInStock
                ? t('common.outOfStock', 'Out of Stock')
                : currentVersion === 'V1'
                ? t('steps.wireless.yes.changeToV2', 'Change to V2')
                : t('steps.wireless.yes.select', 'Yes')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

