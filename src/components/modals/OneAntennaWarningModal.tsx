import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface OneAntennaWarningModalProps {
  onClose: () => void;
  onSelectTwoAntennas: () => void;
}

export const OneAntennaWarningModal: React.FC<OneAntennaWarningModalProps> = ({
  onClose,
  onSelectTwoAntennas,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="one-antenna-warning-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="one-antenna-warning-dialog"
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
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {t('modals.oneAntennaWarning.title', 'Antenna Recommendation')}
            </h3>
          </div>
          <motion.button
            id="btn-close-one-antenna-warning"
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

        <div className="bg-red-50/70 p-3.5 sm:p-4 rounded-xl border border-red-200/90 mb-5">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            {t('modals.oneAntennaWarning.message', 'Although 1 antenna is functional, we strongly recommend choosing at least 2 antennas for seamless hopping between channels and significantly better signal stability.')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <motion.button
            id="btn-keep-one-antenna"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 rounded-xl transition-colors cursor-pointer text-center"
          >
            {t('modals.oneAntennaWarning.keepOne', 'Keep 1 Antenna')}
          </motion.button>
          <motion.button
            id="btn-change-to-two-antennas"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectTwoAntennas}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-xl transition-colors cursor-pointer shadow-xs text-center flex items-center justify-center gap-1"
          >
            {t('modals.oneAntennaWarning.changeToTwo', 'Change to 2 Antennas')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

