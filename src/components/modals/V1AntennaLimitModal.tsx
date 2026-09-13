import React from 'react';
import { AlertCircle, X, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface V1AntennaLimitModalProps {
  slotId: number;
  onClose: () => void;
  onUpgradeToV2: () => void;
}

export const V1AntennaLimitModal: React.FC<V1AntennaLimitModalProps> = ({
  slotId,
  onClose,
  onUpgradeToV2,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="v1-antenna-limit-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="v1-antenna-limit-dialog"
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
              {t('modals.v1Limit.title', 'V1 Antenna Limit')}
            </h3>
          </div>
          <motion.button
            id="btn-close-v1-antenna-limit"
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

        <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-xl border border-amber-200/90 mb-5">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            {t('modals.v1Limit.message1', { defaultValue: 'You cannot activate Antenna Slot {{slot}} under V1 firmware. The V1 firmware only supports up to 2 antennas (Slots 1 & 2).', slot: slotId })}
          </p>
          <p className="text-xs sm:text-sm text-neutral-700 mt-2 leading-relaxed">
            {t('modals.v1Limit.message2', 'To use 3 or 4 antennas, you need to upgrade to V2 firmware.')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <motion.button
            id="btn-understood-v1-limit"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 rounded-xl transition-colors cursor-pointer text-center"
          >
            {t('common.understood', 'Understood')}
          </motion.button>
          <motion.button
            id="btn-upgrade-v2-from-limit"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpgradeToV2}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-xl transition-colors cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t('modals.v1Limit.upgradeV2', 'Upgrade to V2')}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

