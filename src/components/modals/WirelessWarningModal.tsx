import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface WirelessWarningModalProps {
  onClose: () => void;
}

export const WirelessWarningModal: React.FC<WirelessWarningModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="wireless-warning-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="wireless-warning-dialog"
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
              {t('modals.wirelessWarning.title', '5GHz Wi-Fi Compatibility')}
            </h3>
          </div>
          <motion.button
            id="btn-close-wireless-warning"
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
            {t('modals.wirelessWarning.message', 'Older devices that do not support 5GHz Wi-Fi will be unable to discover or connect to this network. All modern smartphones, tablets, and computers support 5GHz Wi-Fi seamlessly.')}
          </p>
        </div>

        <div className="flex items-center justify-end">
          <motion.button
            id="btn-understood-wireless-warning"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-lg transition-colors cursor-pointer shadow-xs text-center"
          >
            {t('common.understood', 'Understood')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

