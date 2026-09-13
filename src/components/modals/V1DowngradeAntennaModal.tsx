import React from 'react';
import { AlertCircle, X, Check, WifiOff, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface V1DowngradeAntennaModalProps {
  currentAntennaCount: number;
  hasWirelessEnabled: boolean;
  onClose: () => void;
  onConfirmDowngrade: () => void;
}

export const V1DowngradeAntennaModal: React.FC<V1DowngradeAntennaModalProps> = ({
  currentAntennaCount,
  hasWirelessEnabled,
  onClose,
  onConfirmDowngrade,
}) => {
  const { t } = useTranslation();
  const isAntennaMismatch = currentAntennaCount !== 2;
  const isWirelessMismatch = hasWirelessEnabled;
  const isCombined = isAntennaMismatch && isWirelessMismatch;

  return (
    <motion.div
      id="v1-downgrade-antenna-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="v1-downgrade-antenna-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm sm:max-w-md w-full"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {isCombined
                ? t('modals.v1Downgrade.combinedTitle', 'V1 Compatibility Adjustments')
                : isWirelessMismatch
                ? t('modals.v1Downgrade.wirelessDisabledTitle', 'Wireless Control Disabled in V1')
                : t('modals.v1Downgrade.antennaRequiredTitle', '2 Antennas Required for V1')}
            </h3>
          </div>
          <motion.button
            id="btn-close-v1-downgrade-modal"
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title={t('common.close', 'Close')}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-xl border border-amber-200/90 mb-5 space-y-2.5">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
            {t('modals.v1Downgrade.notice', 'Switching to V1 firmware requires the following adjustments:')}
          </p>

          <div className="space-y-2 pt-1">
            {isWirelessMismatch && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 font-semibold">{t('modals.v1Downgrade.wirelessLabel', 'Wireless Control')}:</strong> {t('modals.v1Downgrade.wirelessAction', 'Will be turned OFF (not supported in V1).')}
                </span>
              </div>
            )}

            {isAntennaMismatch && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                <Radio className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 font-semibold">{t('modals.v1Downgrade.antennaLabel', 'Antenna Count')}:</strong> {t('modals.v1Downgrade.antennaAction', { defaultValue: 'Will be set to 2 Antennas (Slots 1 & 2). You currently have {{count}}.', count: currentAntennaCount })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <motion.button
            id="btn-cancel-downgrade"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 rounded-xl transition-colors cursor-pointer text-center"
          >
            {t('modals.v1Downgrade.keepV2', 'Keep V2')}
          </motion.button>
          <motion.button
            id="btn-confirm-set-two-and-downgrade"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirmDowngrade}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-xl transition-colors cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isCombined
                ? t('modals.v1Downgrade.applyAndSwitch', 'Apply & Switch')
                : isWirelessMismatch
                ? t('modals.v1Downgrade.disableAndSwitch', 'Disable & Switch')
                : t('modals.v1Downgrade.setTwoAndSwitch', 'Set 2 & Switch')}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};


