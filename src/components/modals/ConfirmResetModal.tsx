import React from 'react';
import { AlertCircle, X, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface ConfirmResetModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="confirm-reset-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="confirm-reset-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm w-full relative"
      >
        {/* Cross Close Button */}
        <motion.button
          id="btn-close-reset-modal-cross"
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          title={t('common.close', 'Close')}
        >
          <X className="w-4 h-4" />
        </motion.button>

        <div className="flex items-center gap-3 mb-3 pr-6">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {t('modals.confirmReset.title', 'Confirm Reset')}
            </h3>
            <p className="text-xs text-neutral-500">
              {t('modals.confirmReset.subtitle', 'Are you sure you want to reset all options?')}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 mb-5 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
          {t('modals.confirmReset.desc', 'This will restore all default values and reset the total price back to ₹0.')}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <motion.button
            id="btn-cancel-reset"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-300 cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-4 h-4 text-neutral-500" />
            <span>{t('modals.confirmReset.cancel', 'Cancel')}</span>
          </motion.button>
          <motion.button
            id="btn-confirm-reset-yes"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{t('modals.confirmReset.confirm', 'Yes, Reset')}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

