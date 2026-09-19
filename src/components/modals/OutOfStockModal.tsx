import React from 'react';
import { PackageX, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export interface OutOfStockModalData {
  itemName: string;
}

interface OutOfStockModalProps {
  data: OutOfStockModalData;
  onClose: () => void;
}

export const OutOfStockModal: React.FC<OutOfStockModalProps> = ({ data, onClose }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="out-of-stock-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="out-of-stock-dialog"
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm sm:max-w-md w-full relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200">
              <PackageX className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {t('common.outOfStock', 'Out of Stock')}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight mt-0.5">
                {t('modals.outOfStock.title', 'Item Unavailable')}
              </h3>
            </div>
          </div>
          <motion.button
            id="btn-close-out-of-stock"
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title={t('common.close', 'Close')}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Body content */}
        <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200 mb-4">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
            <strong className="text-neutral-900 font-bold">{data.itemName}</strong>{' '}
            {t('modals.outOfStock.desc', 'is currently out of stock and cannot be selected.')}
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            {t('modals.outOfStock.instruction', 'Please choose another option from the available catalog to complete your device build.')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end pt-1">
          <motion.button
            id="btn-dismiss-out-of-stock"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-black text-white shadow-xs transition-all flex items-center justify-center cursor-pointer"
          >
            <span>{t('modals.understood', 'Understood')}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
