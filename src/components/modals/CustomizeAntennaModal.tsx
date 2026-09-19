import React from 'react';
import { Radio, X, Check, Power, AlertTriangle, ArrowUpRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { AntennaDbiType } from '../../types';
import { PRICING_CATALOG, applyPsychologicalPricing } from '../../utils/pricing';

interface CustomizeAntennaModalProps {
  slotId: number;
  slotStatus: string;
  currentDbi?: AntennaDbiType;
  currentVersion: string;
  onClose: () => void;
  onActivate: (slotId: number) => void;
  onDeactivate: (slotId: number) => void;
  onChangeQuality: (slotId: number, quality: 'Normal' | 'Powerful') => void;
  onChangeDbi: (slotId: number, dbi: AntennaDbiType) => void;
  onUpgradeToV2: (slotId: number) => void;
  stockMap?: Record<string, boolean>;
  onOutOfStockAttempt?: (itemName: string, alternative?: { name: string; onSelect: () => void }) => void;
}

export const CustomizeAntennaModal: React.FC<CustomizeAntennaModalProps> = ({
  slotId,
  slotStatus,
  currentDbi,
  currentVersion,
  onClose,
  onActivate,
  onDeactivate,
  onChangeQuality,
  onChangeDbi,
  onUpgradeToV2,
  stockMap = {},
  onOutOfStockAttempt,
}) => {
  const { t } = useTranslation();
  const isInactive = slotStatus.toLowerCase() === 'none';
  const isV1SlotLimit = currentVersion === 'V1' && slotId > 2;

  const isNormalInStock = stockMap['antenna_quality_normal'] !== false;
  const isPowerfulInStock = stockMap['antenna_quality_powerful'] !== false;

  const is0dbiInStock = stockMap['antenna_dbi_0'] !== false;
  const is6dbiInStock = stockMap['antenna_dbi_6'] !== false;
  const is12dbiInStock = stockMap['antenna_dbi_12'] !== false;

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
    onChangeQuality(slotId, quality);
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
    onChangeDbi(slotId, dbi);
  };

  // Calculate live antenna specific cost using PRICING_CATALOG
  const baseCost = isInactive ? 0 : PRICING_CATALOG.antenna.baseSocket;
  const qualityCost =
    slotStatus === 'Normal'
      ? PRICING_CATALOG.antenna.quality.Normal
      : slotStatus === 'Powerful'
      ? PRICING_CATALOG.antenna.quality.Powerful
      : 0;
  const dbiCost =
    currentDbi && currentDbi in PRICING_CATALOG.antenna.dbi
      ? PRICING_CATALOG.antenna.dbi[currentDbi]
      : 0;
  const totalAntennaCost = baseCost + qualityCost + dbiCost;

  return (
    <motion.div
      id="customize-antenna-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4"
    >
      <motion.div
        id="customize-antenna-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-5 max-w-md w-full max-h-[92vh] overflow-y-auto relative"
      >
        {/* Top-Right Close Cross Button */}
        <motion.button
          id="btn-close-customize-antenna-modal"
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          title={t('common.close', 'Close')}
        >
          <X className="w-4 h-4" />
        </motion.button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100 pr-8">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isInactive
                ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {t('modals.customizeAntenna.title', { defaultValue: 'Antenna Slot {{slot}}', slot: slotId })}
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isInactive
                    ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
                    : slotStatus === 'Normal'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : slotStatus === 'Powerful'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {isInactive ? t('modals.customizeAntenna.inactive', 'INACTIVE') : slotStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {isInactive
                ? t('modals.customizeAntenna.slotDeactivated', 'Slot is currently deactivated')
                : `${t('modals.customizeAntenna.activeCost', 'Active slot cost')}: ₹${applyPsychologicalPricing(totalAntennaCost)}`}
            </p>
          </div>
        </div>

        {/* CONTENT AREA */}
        {isInactive ? (
          /* INACTIVE STATE VIEW */
          <div className="space-y-4 py-2">
            {isV1SlotLimit ? (
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('modals.v1Limit.title', 'V1 Firmware Limit Reached')}</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  {t('modals.customizeAntenna.v1Desc', {
                    defaultValue: 'V1 firmware only supports up to 2 antennas. To activate Antenna Slot {{slot}}, upgrade to V2 firmware.',
                    slot: slotId,
                  })}
                </p>
                <motion.button
                  id="btn-upgrade-v2-and-activate-slot"
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpgradeToV2(slotId)}
                  className="w-full mt-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t('modals.customizeAntenna.upgradeAndActivate', { defaultValue: 'Upgrade to V2 & Activate Slot {{slot}}', slot: slotId })}</span>
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-4 px-2 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Power className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">
                    {t('modals.customizeAntenna.slotDeactivatedTitle', { defaultValue: 'Antenna Slot {{slot}} is Deactivated', slot: slotId })}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    {t('modals.customizeAntenna.activateDesc', 'Activate this antenna to configure its transmission module quality (Normal/Powerful) and antenna type (dBi).')}
                  </p>
                </div>

                <div className="pt-2">
                  <motion.button
                    id={`btn-activate-slot-${slotId}`}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onActivate(slotId)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                    <span>{t('modals.customizeAntenna.activateBtn', { defaultValue: 'Activate Antenna Slot {{slot}} (+₹{{base}} base)', slot: slotId, base: applyPsychologicalPricing(PRICING_CATALOG.antenna.baseSocket) })}</span>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE STATE VIEW (Configuration & Customization) */
          <div className="space-y-4">
            {/* Section 1: Module Quality (Normal / Powerful) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  1. {t('modals.customizeAntenna.moduleQuality', 'Module Quality')}
                </label>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {slotStatus === 'Conf'
                    ? t('modals.customizeAntenna.chooseQuality', 'Please choose quality')
                    : `${t('modals.customizeAntenna.selected', 'Selected')}: ${slotStatus}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Normal Quality Button */}
                <motion.button
                  id={`btn-customize-quality-normal-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectQuality('Normal')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !isNormalInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : slotStatus === 'Normal'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isNormalInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>{t('antennaQuality.normal', 'Normal')}</span>
                    {slotStatus === 'Normal' && isNormalInStock && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    )}
                    {!isNormalInStock && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {t('common.outOfStock', 'Out of Stock')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-2 leading-tight">
                    {t('antennaQuality.normalDesc', 'Standard efficiency & reliability')}
                  </p>
                  <span className={`text-xs font-mono font-bold ${isNormalInStock ? 'text-emerald-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.quality.Normal)}
                  </span>
                </motion.button>

                {/* Powerful Quality Button */}
                <motion.button
                  id={`btn-customize-quality-powerful-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectQuality('Powerful')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !isPowerfulInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : slotStatus === 'Powerful'
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${isPowerfulInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>{t('antennaQuality.powerful', 'Powerful')}</span>
                      <Zap className={`w-3 h-3 ${isPowerfulInStock ? 'text-amber-500 fill-amber-500' : 'text-neutral-400 fill-neutral-400'}`} />
                    </div>
                    {slotStatus === 'Powerful' && isPowerfulInStock && (
                      <Check className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                    )}
                    {!isPowerfulInStock && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {t('common.outOfStock', 'Out of Stock')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-2 leading-tight">
                    {t('antennaQuality.powerfulDesc', 'High power transmission & range')}
                  </p>
                  <span className={`text-xs font-mono font-bold ${isPowerfulInStock ? 'text-amber-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.quality.Powerful)}
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Section 2: Antenna Type (0 dBi / 6 dBi / 12 dBi) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  2. {t('modals.customizeAntenna.antennaDbi', 'Antenna Type (Gain)')}
                </label>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {currentDbi ? currentDbi.toUpperCase() : t('modals.customizeAntenna.notSelected', 'Not selected')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* 0 dBi */}
                <motion.button
                  id={`btn-customize-dbi-0dbi-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectDbi('0dbi')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !is0dbiInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : currentDbi === '0dbi'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${is0dbiInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>0 dBi</span>
                    {currentDbi === '0dbi' && is0dbiInStock && (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${!is0dbiInStock ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                    {!is0dbiInStock ? t('common.outOfStock', 'Out of Stock') : t('antennaTypes.0dbi.desc', 'Standard')}
                  </span>
                  <span className={`text-[11px] font-mono font-bold mt-1 ${is0dbiInStock ? 'text-emerald-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.dbi['0dbi'])}
                  </span>
                </motion.button>

                {/* 6 dBi */}
                <motion.button
                  id={`btn-customize-dbi-6dbi-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectDbi('6dbi')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !is6dbiInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : currentDbi === '6dbi'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${is6dbiInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>6 dBi</span>
                    {currentDbi === '6dbi' && is6dbiInStock && (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${!is6dbiInStock ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                    {!is6dbiInStock ? t('common.outOfStock', 'Out of Stock') : t('antennaTypes.6dbi.desc', 'Enhanced')}
                  </span>
                  <span className={`text-[11px] font-mono font-bold mt-1 ${is6dbiInStock ? 'text-emerald-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.dbi['6dbi'])}
                  </span>
                </motion.button>

                {/* 12 dBi */}
                <motion.button
                  id={`btn-customize-dbi-12dbi-${slotId}`}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectDbi('12dbi')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    !is12dbiInStock
                      ? 'border-rose-200 bg-white/70 shadow-2xs hover:border-rose-300'
                      : currentDbi === '12dbi'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${is12dbiInStock ? 'text-neutral-900' : 'text-neutral-500'}`}>12 dBi</span>
                    {currentDbi === '12dbi' && is12dbiInStock && (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${!is12dbiInStock ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                    {!is12dbiInStock ? t('common.outOfStock', 'Out of Stock') : t('antennaTypes.12dbi.desc', 'Max Range')}
                  </span>
                  <span className={`text-[11px] font-mono font-bold mt-1 ${is12dbiInStock ? 'text-emerald-700' : 'text-neutral-400 line-through'}`}>
                    +₹{applyPsychologicalPricing(PRICING_CATALOG.antenna.dbi['12dbi'])}
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Section 3: Deactivate Antenna Option */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <motion.button
                id={`btn-deactivate-slot-${slotId}`}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onDeactivate(slotId)}
                className="py-2 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{t('modals.customizeAntenna.deactivateBtn', 'Deactivate Antenna')}</span>
              </motion.button>

              <motion.button
                id="btn-done-customize-antenna"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="py-2 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {t('modals.customizeAntenna.done', 'Done')}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

