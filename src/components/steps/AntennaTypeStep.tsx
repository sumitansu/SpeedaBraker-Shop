import React from 'react';
import { AlertCircle, Radio, Zap, Plus, Check, Signal, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LowerSlotConfig, AntennaDbiType } from '../../types';
import { PRICING_CATALOG } from '../../utils/pricing';

interface AntennaTypeStepProps {
  currentVersion: string;
  slots: LowerSlotConfig[];
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>;
  onSelectAntennaType: (slotId: number, dbiType: AntennaDbiType) => void;
  onOpenUnconfiguredModal: (slotId: number, tierId?: AntennaDbiType) => void;
  onGoToFirmware: () => void;
  onGoToAntennas?: () => void;
  stockMap?: Record<string, boolean>;
}

interface DbiTierConfig {
  id: AntennaDbiType;
  label: string;
  badge: string;
  subtitle: string;
  accentColor: string;
  activeBtnClass: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export const AntennaTypeStep: React.FC<AntennaTypeStepProps> = ({
  currentVersion,
  slots,
  antennaDbiTypes,
  onSelectAntennaType,
  onOpenUnconfiguredModal,
  onGoToFirmware,
  onGoToAntennas,
  stockMap,
}) => {
  const { t } = useTranslation();
  const is0dbiInStock = stockMap?.['antenna_dbi_0'] !== false;
  const is6dbiInStock = stockMap?.['antenna_dbi_6'] !== false;
  const is12dbiInStock = stockMap?.['antenna_dbi_12'] !== false;

  const isDbiInStock = (id: AntennaDbiType) => {
    if (id === '0dbi') return is0dbiInStock;
    if (id === '6dbi') return is6dbiInStock;
    return is12dbiInStock;
  };

  if (currentVersion === 'None') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3"
        >
          <AlertCircle className="w-6 h-6" />
        </motion.div>
        <h3 className="text-lg font-bold text-neutral-900">
          {t('steps.display.firmwareRequired', 'Firmware Selection Required')}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
          {t('steps.antennaType.firmwareRequiredDesc', 'Please select a firmware version first before configuring antenna types.')}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onGoToFirmware}
          className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
        >
          {t('steps.display.selectFirmwareBtn', 'Select Firmware')}
        </motion.button>
      </div>
    );
  }

  if (slots.every((s) => s.value.toLowerCase() === 'none')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3"
        >
          <AlertCircle className="w-6 h-6" />
        </motion.div>
        <h3 className="text-lg font-bold text-neutral-900">
          {t('steps.antennaQuality.antennaCountRequired', 'Antenna Count Required')}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
          {t('steps.antennaType.antennaCountRequiredDesc', 'Please select the number of antennas first before configuring antenna types.')}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onGoToAntennas}
          className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
        >
          {t('steps.antennaQuality.selectAntennasBtn', 'Select Antennas')}
        </motion.button>
      </div>
    );
  }

  const TIERS: DbiTierConfig[] = [
    {
      id: '0dbi',
      label: '0 dBi',
      badge: `₹${PRICING_CATALOG.antenna.dbi['0dbi']}`,
      subtitle: t('steps.antennaType.0dbiDesc', 'Standard direct omni coverage'),
      accentColor: 'border-emerald-500/80 ring-emerald-500/30',
      activeBtnClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/40',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <Signal className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: '6dbi',
      label: '6 dBi',
      badge: `₹${PRICING_CATALOG.antenna.dbi['6dbi']}`,
      subtitle: t('steps.antennaType.6dbiDesc', 'Balanced medium-gain coverage'),
      accentColor: 'border-sky-500/80 ring-sky-500/30',
      activeBtnClass: 'bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-400/40',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: <Waves className="w-4 h-4 text-sky-600" />,
    },
    {
      id: '12dbi',
      label: '12 dBi',
      badge: `₹${PRICING_CATALOG.antenna.dbi['12dbi']}`,
      subtitle: t('steps.antennaType.12dbiDesc', 'Ultra long-range high-gain booster'),
      accentColor: 'border-amber-500/80 ring-amber-500/30',
      activeBtnClass: 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-400/40',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />,
    },
  ];

  return (
    <div
      id="antenna-type-options-container"
      className="w-full h-full flex flex-col justify-between min-h-0"
    >
      {/* Question Header */}
      <motion.div
        id="antenna-type-title-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center py-1 sm:py-1.5 shrink-0 flex flex-col items-center"
      >
        <h2
          id="heading-antenna-type"
          className="text-base sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight"
        >
          {t('steps.antennaType.title', 'Which type of antenna?')}
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5 max-w-xl mx-auto">
          {t('steps.antennaType.desc', 'Select antenna gain for each active module. All combinations supported.')}
        </p>

        {/* Pricing Tabs */}
        <div id="antenna-type-price-pills" className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] sm:text-xs font-mono font-bold text-emerald-800 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>0 dBi: +₹{PRICING_CATALOG.antenna.dbi['0dbi']}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-xs font-mono font-bold text-sky-800 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>6 dBi: +₹{PRICING_CATALOG.antenna.dbi['6dbi']}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] sm:text-xs font-mono font-bold text-amber-800 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>12 dBi: +₹{PRICING_CATALOG.antenna.dbi['12dbi']}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* 3 Long Horizontal Stacked Boxes */}
      <div
        id="antenna-type-stacked-boxes"
        className="flex-1 min-h-0 flex flex-col justify-between gap-2 sm:gap-2.5 py-1 sm:py-1.5"
      >
        {TIERS.map((tier) => {
          return (
            <motion.div
              key={tier.id}
              id={`card-dbi-tier-${tier.id}`}
              whileHover={{ scale: 1.005 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-xl sm:rounded-2xl border-2 border-neutral-200/90 shadow-2xs hover:border-neutral-300 hover:shadow-xs transition-all p-2 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 overflow-hidden"
            >
              {/* Left Side: Tier Label & Description */}
              <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${tier.badgeClass}`}
                >
                  {tier.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black font-mono text-neutral-900 tracking-tight">
                      {tier.label}
                    </h3>
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${tier.badgeClass}`}
                    >
                      +{tier.badge}
                    </span>
                    {/* Dynamic Stock Badge */}
                    {isDbiInStock(tier.id) ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('steps.display.yes.inStock', 'In Stock')}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{t('steps.display.yes.outOfStock', 'Out of Stock')}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 truncate hidden sm:block mt-0.5">
                    {tier.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Side: 4 Antenna Buttons (A1, A2, A3, A4) */}
              <div
                id={`antenna-buttons-row-${tier.id}`}
                className="grid grid-cols-4 gap-1.5 sm:gap-2 sm:w-auto w-full"
              >
                {slots.map((slot) => {
                  const isConfigured = slot.value.toLowerCase() !== 'none';
                  const isSelectedInThisTier = isConfigured && antennaDbiTypes[slot.id] === tier.id;

                  if (!isConfigured) {
                    // Unconfigured / Grayed out Button
                    return (
                      <motion.button
                        key={slot.id}
                        id={`btn-tier-${tier.id}-unconfigured-slot-${slot.id}`}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onOpenUnconfiguredModal(slot.id, tier.id)}
                        title={`Antenna ${slot.id} is unconfigured. Click to configure.`}
                        className="py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100/70 hover:bg-neutral-200/80 text-neutral-400 hover:text-neutral-600 transition-all flex flex-col items-center justify-center cursor-pointer group min-w-[3.5rem] sm:min-w-[4.2rem]"
                      >
                        <div className="flex items-center gap-0.5">
                          <span className="text-[11px] sm:text-xs font-mono font-bold">
                            A{slot.id}
                          </span>
                          <Plus className="w-2.5 h-2.5 text-neutral-400 group-hover:text-neutral-600 transition-transform group-hover:scale-110" />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 uppercase tracking-tighter">
                          {t('topGrid.disabled', 'Disabled')}
                        </span>
                      </motion.button>
                    );
                  }

                  // Configured Button: Active in this tier vs Clickable
                  return (
                    <motion.button
                      key={slot.id}
                      id={`btn-tier-${tier.id}-slot-${slot.id}`}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      onClick={() => onSelectAntennaType(slot.id, tier.id)}
                      className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer min-w-[3.5rem] sm:min-w-[4.2rem] ${
                        isSelectedInThisTier
                          ? tier.activeBtnClass
                          : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 hover:border-neutral-400 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isSelectedInThisTier ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Radio className="w-3 h-3 text-neutral-400" />
                        )}
                        <span className="text-xs sm:text-sm font-black font-mono tracking-tight">
                          A{slot.id}
                        </span>
                      </div>
                      <span
                        className={`text-[8px] sm:text-[9px] font-mono font-semibold uppercase tracking-tighter ${
                          isSelectedInThisTier ? 'opacity-90' : 'text-neutral-500'
                        }`}
                      >
                        {isSelectedInThisTier ? t('steps.firmware.v1.active', 'Active') : t('steps.antenna.select', 'Select')}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

