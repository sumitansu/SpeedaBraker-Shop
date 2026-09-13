import React from 'react';
import { Radio, X, Sparkles, Check, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PRICING_CATALOG } from '../../utils/pricing';

interface AddUnconfiguredAntennaModalProps {
  slotId: number;
  onClose: () => void;
  onAddAsNormal: () => void;
  onAddAsPowerful: () => void;
}

export const AddUnconfiguredAntennaModal: React.FC<AddUnconfiguredAntennaModalProps> = ({
  slotId,
  onClose,
  onAddAsNormal,
  onAddAsPowerful,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      id="add-unconfigured-antenna-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="add-unconfigured-antenna-dialog"
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
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Radio className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {t('modals.addUnconfigured.title', { defaultValue: 'Add Antenna Slot {{slot}}', slot: slotId })}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {t('modals.addUnconfigured.subtitle', 'Currently Unconfigured')}
              </p>
            </div>
          </div>
          <motion.button
            id="btn-close-add-antenna-modal"
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

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
          {t('modals.addUnconfigured.desc', {
            defaultValue: 'Antenna Slot {{slot}} is currently unconfigured. Would you like to add this antenna to your configuration, or keep it unconfigured?',
            slot: slotId,
          })}
        </p>

        {/* Quality Options Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Normal Option */}
          <motion.button
            id={`btn-add-normal-slot-${slotId}`}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddAsNormal}
            className="p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700">
                {t('antennaQuality.normal', 'Normal')}
              </span>
              <Check className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600" />
            </div>
            <p className="text-[11px] text-neutral-500 mb-2 leading-tight">
              {t('antennaQuality.normalDesc', 'Standard performance module')}
            </p>
            <span className="text-sm font-mono font-bold text-neutral-900 group-hover:text-emerald-700">
              ₹{PRICING_CATALOG.antenna.quality.Normal}
            </span>
          </motion.button>

          {/* Powerful Option */}
          <motion.button
            id={`btn-add-powerful-slot-${slotId}`}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddAsPowerful}
            className="p-3 rounded-xl border border-neutral-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all text-left group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-amber-700">
                  {t('antennaQuality.powerful', 'Powerful')}
                </span>
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              </div>
              <Sparkles className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-600" />
            </div>
            <p className="text-[11px] text-neutral-500 mb-2 leading-tight">
              {t('antennaQuality.powerfulDesc', 'High-gain high-power module')}
            </p>
            <span className="text-sm font-mono font-bold text-neutral-900 group-hover:text-amber-700">
              ₹{PRICING_CATALOG.antenna.quality.Powerful}
            </span>
          </motion.button>
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
          <motion.button
            id="btn-keep-unconfigured-slot"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer text-center"
          >
            {t('modals.addUnconfigured.keepUnconfigured', 'Keep Unconfigured')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

