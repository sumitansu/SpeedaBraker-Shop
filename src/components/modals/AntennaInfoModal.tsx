import React from 'react';
import { Info, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface AntennaInfoModalProps {
  type: 'v1' | 'v2';
  onClose: () => void;
}

export const AntennaInfoModal: React.FC<AntennaInfoModalProps> = ({ type, onClose }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="antenna-info-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="antenna-info-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm w-full relative"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-300">
              <Info className="w-4.5 h-4.5 text-neutral-800" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {type === 'v1'
                ? t('modals.antennaInfo.v1Title', 'V1 Antenna Requirement')
                : t('modals.antennaInfo.v2Title', 'V2 Antenna Recommendation')}
            </h3>
          </div>
          <motion.button
            id="btn-close-antenna-info"
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

        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/90 mb-5">
          {type === 'v1' ? (
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {t('modals.antennaInfo.v1Desc', 'The V1 firmware is unable to operate with 1 antenna and must need at least 2 antennas to function.')}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {t('modals.antennaInfo.v2Desc', 'Unlike V1, it supports 1 antenna to 4 antennas, but we still recommend using at least 2 antennas for proper functioning.')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <motion.button
            id="btn-got-it-antenna-info"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-lg transition-colors cursor-pointer shadow-xs text-center"
          >
            {t('modals.antennaInfo.understood', 'Understood')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

