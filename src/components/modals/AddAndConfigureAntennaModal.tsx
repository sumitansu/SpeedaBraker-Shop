import React, { useState } from 'react';
import { Radio, X, Sparkles, Check, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { AntennaDbiType } from '../../types';
import { PRICING_CATALOG, applyPsychologicalPricing } from '../../utils/pricing';

interface AddAndConfigureAntennaModalProps {
  slotId: number;
  initialTierId?: AntennaDbiType;
  currentVersion?: string;
  onClose: () => void;
  onConfirm: (slotId: number, quality: 'Normal' | 'Powerful', dbi: AntennaDbiType) => void;
  onUpgradeToV2?: (slotId: number) => void;
  stockMap?: Record<string, boolean>;
  onOutOfStockAttempt?: (itemName: string, alternative?: { name: string; onSelect: () => void }) => void;
}

export const AddAndConfigureAntennaModal: React.FC<AddAndConfigureAntennaModalProps> = ({
  slotId,
  initialTierId = '6dbi',
  currentVersion = 'V2',
  onClose,
  onConfirm,
  onUpgradeToV2,
  stockMap = {},
  onOutOfStockAttempt,
}) => {
  const { t } = useTranslation();

  const isNormalInStock = stockMap['antenna_quality_normal'] !== false;
  const isPowerfulInStock = stockMap['antenna_quality_powerful'] !== false;

  const is0dbiInStock = stockMap['antenna_dbi_0'] !== false;
  const is6dbiInStock = stockMap['antenna_dbi_6'] !== false;
  const is12dbiInStock = stockMap['antenna_dbi_12'] !== false;

  const defaultQuality: 'Normal' | 'Powerful' = isNormalInStock ? 'Normal' : isPowerfulInStock ? 'Powerful' : 'Normal';
  const defaultDbi: AntennaDbiType = 
    initialTierId === '0dbi' && is0dbiInStock ? '0dbi' :
    initialTierId === '6dbi' && is6dbiInStock ? '6dbi' :
    initialTierId === '12dbi' && is12dbiInStock ? '12dbi' :
    is6dbiInStock ? '6dbi' : is0dbiInStock ? '0dbi' : '12dbi';

  const [selectedQuality, setSelectedQuality] = useState<'Normal' | 'Powerful'>(defaultQuality);
  const [selectedDbi, setSelectedDbi] = useState<AntennaDbiType>(defaultDbi);

  const handleSelectQuality = (quality: 'Normal' | 'Powerful') => {
    const inStock = quality === 'Normal' ? isNormalInStock : isPowerfulInStock;
    if (!inStock) {
      const itemName =
        quality === 'Normal'
          ? t('products.antennaNormal', 'Normal Antenna Quality')
          : t('products.antennaPowerful', 'Powerful Antenna Quality');
      onOutOfStockAttempt?.(itemName);
      return;
    }
    setSelectedQuality(quality);
  };

  const handleSelectDbi = (dbi: AntennaDbiType) => {
    const isDbiAvailable =
      dbi === '0dbi' ? is0dbiInStock : dbi === '6dbi' ? is6dbiInStock : is12dbiInStock;
    if (!isDbiAvailable) {
      const dbiNames: Record<AntennaDbiType, string> = {
        '0dbi': t('products.antenna0dbi', '0 dBi Stubby Antenna'),
        '6dbi': t('products.antenna6dbi', '6 dBi High-Gain Antenna'),
        '12dbi': t('products.antenna12dbi', '12 dBi Long-Range Antenna'),
      };
      onOutOfStockAttempt?.(dbiNames[dbi] || `${dbi} Antenna`);
      return;
    }
    setSelectedDbi(dbi);
  };

  const isV1SlotLimit = currentVersion === 'V1' && slotId > 2;

  const baseCost = PRICING_CATALOG.antenna.baseSocket;
  const qualityCost =
    selectedQuality === 'Normal'
      ? PRICING_CATALOG.antenna.quality.Normal
      : PRICING_CATALOG.antenna.quality.Powerful;
  const dbiCost = PRICING_CATALOG.antenna.dbi[selectedDbi];
  const totalAntennaCost = baseCost + qualityCost + dbiCost;

  return (
    <motion.div
      id="add-and-configure-antenna-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4"
    >
      <motion.div
        id="add-and-configure-antenna-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Radio className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {t('modals.addAndConfigure.title', { defaultValue: 'Add & Configure Antenna Slot {{slot}}', slot: slotId })}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {isV1SlotLimit
                  ? t('modals.addAndConfigure.v1Restriction', 'V1 Firmware Restriction')
                  : t('modals.addAndConfigure.subtitle', 'Configure quality & antenna type')}
              </p>
            </div>
          </div>
          <motion.button
            id="btn-close-add-configure-antenna-modal"
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

        {isV1SlotLimit ? (
          /* V1 LIMIT VIEW */
          <div className="space-y-4 py-2">
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('modals.v1Limit.title', 'V1 Firmware Limit Reached')}</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {t('modals.addAndConfigure.v1Desc', {
                  defaultValue: 'V1 firmware only supports up to 2 antennas (Slots 1 & 2). To activate Antenna Slot {{slot}}, please upgrade to V2 firmware.',
                  slot: slotId,
                })}
              </p>
              {onUpgradeToV2 && (
                <motion.button
                  id="btn-upgrade-v2-from-add-configure"
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpgradeToV2(slotId)}
                  className="w-full mt-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t('modals.addAndConfigure.upgradeBtn', { defaultValue: 'Upgrade to V2 & Configure Slot {{slot}}', slot: slotId })}</span>
                </motion.button>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t('common.close', 'Close')}
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            {/* Section 1: Module Quality */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                1. {t('modals.customizeAntenna.moduleQuality', 'Select Module Quality')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Normal Option */}
                <motion.button
                  id={`btn-config-quality-normal-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectQuality('Normal')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !isNormalInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : selectedQuality === 'Normal'
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${isNormalInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>{t('antennaQuality.normal', 'Normal')}</span>
                    {selectedQuality === 'Normal' && isNormalInStock && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    )}
                    {!isNormalInStock && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {t('common.outOfStock', 'Out of Stock')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-2 leading-tight">
                    {t('antennaQuality.normalDesc', 'Standard efficiency module')}
                  </p>
                  <span className={`text-xs font-mono font-bold ${isNormalInStock ? 'text-emerald-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.quality.Normal)}
                  </span>
                </motion.button>

                {/* Powerful Option */}
                <motion.button
                  id={`btn-config-quality-powerful-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectQuality('Powerful')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !isPowerfulInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : selectedQuality === 'Powerful'
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${isPowerfulInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>{t('antennaQuality.powerful', 'Powerful')}</span>
                      <Zap className={`w-3 h-3 ${isPowerfulInStock ? 'text-amber-500 fill-amber-500' : 'text-neutral-400 fill-neutral-400'}`} />
                    </div>
                    {selectedQuality === 'Powerful' && isPowerfulInStock && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {!isPowerfulInStock && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {t('common.outOfStock', 'Out of Stock')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-2 leading-tight">
                    {t('antennaQuality.powerfulDesc', 'High-power signal module')}
                  </p>
                  <span className={`text-xs font-mono font-bold ${isPowerfulInStock ? 'text-amber-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.quality.Powerful)}
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Section 2: Antenna Type (dBi) */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                2. {t('modals.customizeAntenna.antennaDbi', 'Select Antenna Type (dBi)')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '0dbi' as AntennaDbiType, label: '0 dBi', desc: t('antennaTypes.0dbi.desc', 'Compact'), inStock: is0dbiInStock, cost: `+₹${applyPsychologicalPricing(PRICING_CATALOG.antenna.dbi['0dbi'])}` },
                  { id: '6dbi' as AntennaDbiType, label: '6 dBi', desc: t('antennaTypes.6dbi.desc', 'Balanced'), inStock: is6dbiInStock, cost: `+₹${applyPsychologicalPricing(PRICING_CATALOG.antenna.dbi['6dbi'])}` },
                  { id: '12dbi' as AntennaDbiType, label: '12 dBi', desc: t('antennaTypes.12dbi.desc', 'High Gain'), inStock: is12dbiInStock, cost: `+₹${applyPsychologicalPricing(PRICING_CATALOG.antenna.dbi['12dbi'])}` },
                ].map((tier) => (
                  <motion.button
                    key={tier.id}
                    id={`btn-config-dbi-${tier.id}-${slotId}`}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectDbi(tier.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                      !tier.inStock
                        ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300 text-neutral-500'
                        : selectedDbi === tier.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{tier.label}</span>
                    <span
                      className={`text-[9px] my-1 ${
                        !tier.inStock
                          ? 'text-rose-600 font-bold'
                          : selectedDbi === tier.id
                          ? 'text-neutral-300'
                          : 'text-neutral-500'
                      }`}
                    >
                      {!tier.inStock ? t('common.outOfStock', 'Out of Stock') : tier.desc}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        !tier.inStock
                          ? 'text-neutral-400 line-through'
                          : selectedDbi === tier.id
                          ? 'text-emerald-300'
                          : 'text-neutral-700'
                      }`}
                    >
                      {tier.cost}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Cost Summary Banner */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 mb-4 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                  {t('modals.addAndConfigure.slotTotal', { defaultValue: 'Slot {{slot}} Total Addition', slot: slotId })}
                </span>
                <span className="text-[11px] text-neutral-600">
                  {t('modals.addAndConfigure.costBreakdown', {
                    defaultValue: 'Hardware (₹{{base}}) + Module (₹{{quality}}) + Antenna (₹{{dbi}})',
                    base: applyPsychologicalPricing(baseCost),
                    quality: applyPsychologicalPricing(qualityCost),
                    dbi: applyPsychologicalPricing(dbiCost),
                  })}
                </span>
              </div>
              <span className="text-base font-mono font-black text-neutral-900">
                ₹{applyPsychologicalPricing(totalAntennaCost)}
              </span>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <motion.button
                id="btn-cancel-add-configure-antenna"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer text-center"
              >
                {t('common.cancel', 'Cancel')}
              </motion.button>
              <motion.button
                id={`btn-confirm-add-configure-slot-${slotId}`}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onConfirm(slotId, selectedQuality, selectedDbi)}
                className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all cursor-pointer text-center shadow-xs"
              >
                {t('modals.addAndConfigure.addAntennaSlot', { defaultValue: 'Add Antenna {{slot}}', slot: slotId })}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

