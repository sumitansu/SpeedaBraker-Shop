import React from 'react';
import { AlertCircle, Monitor, MonitorOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PRICING_CATALOG, applyPsychologicalPricing } from '../../utils/pricing';

interface DisplayStepProps {
  currentVersion: string;
  currentDisplay: string;
  onSelectDisplay: (val: 'Yes' | 'No') => void;
  onGoToFirmware: () => void;
  stockMap?: Record<string, boolean>;
  onOutOfStockAttempt?: (itemName: string) => void;
}

export const DisplayStep: React.FC<DisplayStepProps> = ({
  currentVersion,
  currentDisplay,
  onSelectDisplay,
  onGoToFirmware,
  stockMap,
  onOutOfStockAttempt,
}) => {
  const { t } = useTranslation();
  const isDisplayInStock = stockMap?.['display_oled'] !== false;

  const handleSelectYes = () => {
    if (!isDisplayInStock) {
      onOutOfStockAttempt?.(t('products.displayOled', 'OLED Status Display Module'));
      return;
    }
    onSelectDisplay('Yes');
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
          {t('steps.display.firmwareRequiredDesc', 'Please select a firmware version first before configuring display options.')}
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
      id="display-question-container"
      className="w-full h-full flex flex-col justify-between p-1 sm:p-2 min-h-0"
    >
      {/* Main Question Center Banner */}
      <motion.div
        id="display-question-title-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center py-1 sm:py-2 shrink-0"
      >
        <h2
          id="heading-do-you-want-display"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          {t('steps.display.title', 'Do you want display?')}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          {t('steps.display.desc', 'Displays the active operating mode (Bluetooth, BLE, Wi-Fi, or RC Remote).')}
        </p>
      </motion.div>

      {/* Options: No and Yes cards */}
      <div
        id="display-options-grid"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0 py-1"
      >
        {/* Option 1: No */}
        <motion.div
          id="card-display-no"
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => onSelectDisplay('No')}
          className={`rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
            currentDisplay === 'No'
              ? 'bg-white border-2 border-red-500 shadow-md ring-2 sm:ring-4 ring-red-500/10'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm'
          }`}
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentDisplay === 'No'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <MonitorOff className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                  {t('steps.display.no.title', 'No')}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                  {t('steps.display.no.subtitle', 'Blinking LED pattern indicator')}
                </p>
              </div>
            </div>
            {currentDisplay === 'No' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold border border-red-300"
              >
                {t('steps.display.no.selected', 'Selected')}
              </motion.span>
            )}
          </div>

          {/* Middle detail */}
          <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
            <p>
              {t('steps.display.no.desc', 'Harder to keep track of active mode as onboard LED blinks in unique patterns for Bluetooth, BLE, Wi-Fi, or RC Remote.')}
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
              id="btn-select-display-no"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDisplay('No');
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                currentDisplay === 'No'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {currentDisplay === 'No' ? t('steps.display.no.selected', 'Selected') : t('steps.display.no.select', 'No')}
            </motion.button>
          </div>
        </motion.div>

        {/* Option 2: Yes */}
        <motion.div
          id="card-display-yes"
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleSelectYes}
          className={`rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
            currentDisplay === 'Yes'
              ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
              : !isDisplayInStock
              ? 'bg-white/70 border border-rose-200 shadow-xs hover:border-rose-300'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm'
          }`}
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentDisplay === 'Yes'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                    {t('steps.display.yes.title', 'Yes')}
                  </h3>
                  {isDisplayInStock ? (
                    <span
                      id="badge-display-in-stock"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('steps.display.yes.inStock', 'In Stock')}</span>
                    </span>
                  ) : (
                    <span
                      id="badge-display-out-of-stock"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{t('steps.display.yes.outOfStock', 'Out of Stock')}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                  {t('steps.display.yes.subtitle', "0.96' OLED screen")}
                </p>
              </div>
            </div>
            {currentDisplay === 'Yes' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold border border-emerald-300"
              >
                {t('steps.display.yes.selected', 'Selected')}
              </motion.span>
            )}
          </div>

          {/* Middle detail */}
          <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
            <p>
              {t('steps.display.yes.desc', "Much easier to operate as display clearly shows active mode (Bluetooth, BLE, Wi-Fi, or RC Remote).")}
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 pt-0.5">
              {t('steps.display.yes.note', "Note: LED light is not provided when display is added.")}
            </p>
          </div>

          {/* Footer & Price */}
          <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                {t('bill.price', 'Cost')}
              </span>
              <span className={`text-base sm:text-xl md:text-2xl font-mono font-black ${
                isDisplayInStock ? 'text-neutral-900' : 'text-neutral-400 line-through'
              }`}>
                ₹{applyPsychologicalPricing(PRICING_CATALOG.display.Yes)}
              </span>
            </div>

            <motion.button
              id="btn-select-display-yes"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectYes();
              }}
              className={`transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentDisplay === 'Yes'
                  ? 'px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs'
                  : !isDisplayInStock
                  ? 'px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 shadow-2xs'
                  : 'px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {currentDisplay === 'Yes'
                ? t('steps.display.yes.selected', 'Selected')
                : !isDisplayInStock
                ? t('common.outOfStock', 'Out of Stock')
                : t('steps.display.yes.select', 'Yes')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

