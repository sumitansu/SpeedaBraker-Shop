import React from 'react';
import { AlertCircle, Radio, Sparkles, Check, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PRICING_CATALOG } from '../../utils/pricing';

interface AntennaStepProps {
  currentVersion: string;
  activeAntennaCount: number;
  onSetAntennaCount: (count: number) => void;
  onUpgradeToV2: () => void;
  onOpenOneAntennaWarning: () => void;
  onGoToFirmware: () => void;
}

export const AntennaStep: React.FC<AntennaStepProps> = ({
  currentVersion,
  activeAntennaCount,
  onSetAntennaCount,
  onUpgradeToV2,
  onOpenOneAntennaWarning,
  onGoToFirmware,
}) => {
  const { t } = useTranslation();

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
          {t('steps.antenna.firmwareRequiredDesc', 'Please select a firmware version first before configuring antenna options.')}
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

  if (currentVersion === 'V1') {
    return (
      <div
        id="v1-antenna-options-container"
        className="w-full h-full flex flex-col justify-between min-h-0"
      >
        {/* Main Question Center Banner */}
        <motion.div
          id="v1-antenna-title-section"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center py-1 sm:py-2 shrink-0"
        >
          <h2
            id="heading-v1-antenna-count"
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
          >
            {t('steps.antenna.title', 'How many antennas?')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
            {t('steps.antenna.v1Desc', 'V1 firmware operates with 2 antennas. Change to V2 for 1 to 4 antenna options.')}
          </p>
        </motion.div>

        {/* Options: 2 Antennas card vs Change to V2 card */}
        <div
          id="v1-antenna-cards-grid"
          className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-6 flex-1 min-h-0 py-1"
        >
          {/* Option 1: 2 Antennas (Required for V1) */}
          <motion.div
            id="card-v1-antenna-2"
            whileHover={{ y: -3, scale: 1.008 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => onSetAntennaCount(2)}
            className={`rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
              activeAntennaCount === 2
                ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
                : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm'
            }`}
          >
            {/* Top content */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    activeAntennaCount === 2
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <Radio className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                    {t('steps.antenna.keep2', 'Keep 2 Antennas')}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                    {t('steps.antenna.dualAntenna', 'Dual-antenna configuration')}
                  </p>
                </div>
              </div>
              {activeAntennaCount === 2 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold border border-emerald-300"
                >
                  {t('steps.antenna.selected', 'Selected')}
                </motion.span>
              )}
            </div>

            {/* Middle detail */}
            <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
              <p>
                {t('steps.antenna.v1TwoAntennaDesc', 'Required for V1 firmware. Operates with Antenna Slot 1 and Slot 2. Slots 3 and 4 remain disabled.')}
              </p>
            </div>

            {/* Footer & Price */}
            <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  {t('bill.price', 'Cost')}
                </span>
                <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">
                  ₹{PRICING_CATALOG.antenna.baseSocket * 2}
                </span>
              </div>

              <motion.button
                id="btn-select-v1-antenna-2"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetAntennaCount(2);
                }}
                className={`px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeAntennaCount === 2
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {activeAntennaCount === 2 ? t('steps.antenna.selected', 'Selected') : t('steps.antenna.keep2', 'Keep 2 Antennas')}
              </motion.button>
            </div>
          </motion.div>

          {/* Option 2: Change to V2 for more combinations */}
          <motion.div
            id="card-v1-upgrade-v2"
            whileHover={{ y: -3, scale: 1.008 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onUpgradeToV2}
            className="rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm"
          >
            {/* Top content */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                    {t('steps.antenna.changeToV2', 'Change to V2')}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                    {t('steps.antenna.unlockAntennas', 'Unlock 1 to 4 antennas')}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle detail */}
            <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
              <p>
                {t('steps.antenna.upgradeV2Desc', 'Change to V2 firmware to configure flexible 1, 3, or 4 antenna combinations and enable 5GHz Wi-Fi.')}
              </p>
            </div>

            {/* Footer & Price */}
            <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  {t('bill.price', 'Cost')}
                </span>
                <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">
                  ₹{PRICING_CATALOG.version.V2 - PRICING_CATALOG.version.V1}
                </span>
              </div>

              <motion.button
                id="btn-upgrade-v2-from-antenna"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpgradeToV2();
                }}
                className="px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-tight sm:tracking-wider transition-all flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs cursor-pointer whitespace-nowrap"
              >
                <span>{t('steps.antenna.changeToV2', 'Change to V2')}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // V2 firmware: 1 to 4 antenna combinations
  return (
    <div
      id="v2-antenna-options-container"
      className="w-full h-full flex flex-col justify-between min-h-0"
    >
      {/* Main Question Center Banner */}
      <motion.div
        id="v2-antenna-title-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center py-1 sm:py-2 shrink-0"
      >
        <h2
          id="heading-v2-antenna-count"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          {t('steps.antenna.title', 'How many antennas?')}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          {t('steps.antenna.v2Desc', 'Choose 1 to 4 antennas. ₹{{price}} per antenna.', { price: PRICING_CATALOG.antenna.baseSocket })}
        </p>
      </motion.div>

      {/* 4 Options Grid */}
      <div
        id="v2-antenna-cards-grid"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 flex-1 min-h-0 py-1"
      >
        {[
          { count: 1, title: t('steps.antenna.count1', '1 Antenna'), subtitle: t('steps.antenna.slot1', 'Slot 1') },
          { count: 2, title: t('steps.antenna.count2', '2 Antennas'), subtitle: t('steps.antenna.slots12', 'Slots 1 & 2') },
          { count: 3, title: t('steps.antenna.count3', '3 Antennas'), subtitle: t('steps.antenna.slots123', 'Slots 1, 2 & 3') },
          { count: 4, title: t('steps.antenna.count4', '4 Antennas'), subtitle: t('steps.antenna.slotsAll', 'All 4 Slots') },
        ].map((item) => {
          const isSelected = activeAntennaCount === item.count;
          return (
            <motion.div
              key={item.count}
              id={`card-antenna-count-${item.count}`}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => {
                onSetAntennaCount(item.count);
                if (item.count === 1) {
                  onOpenOneAntennaWarning();
                }
              }}
              className={`rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col justify-between p-3 sm:p-4 cursor-pointer min-h-0 ${
                isSelected
                  ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
                  : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white hover:shadow-sm'
              }`}
            >
              {/* Top info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                        {item.title}
                      </h3>
                      {item.count === 1 && (
                        <motion.button
                          id="btn-antenna-1-warning-info"
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOneAntennaWarning();
                          }}
                          title="Channel hopping recommendation"
                          className="w-5 h-5 rounded-full bg-red-100/90 hover:bg-red-200/90 text-red-700 border border-red-200 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Info className="w-3.5 h-3.5 text-red-600 stroke-[2.2]" />
                        </motion.button>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-500">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                )}
              </div>

              {/* Middle visual dots */}
              <div className="py-2 space-y-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((slotNum) => {
                    const isActive = slotNum <= item.count;
                    return (
                      <motion.div
                        key={slotNum}
                        layout
                        className={`h-2 rounded-full transition-colors duration-200 ${
                          isActive
                            ? isSelected
                              ? 'bg-emerald-500'
                              : 'bg-neutral-800'
                            : 'bg-neutral-200'
                        }`}
                        title={`Slot ${slotNum}: ${isActive ? 'Active' : 'Empty'}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Footer & Price */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1.5 shrink-0">
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                    {t('bill.price', 'Cost')}
                  </span>
                  <span className="text-sm sm:text-base md:text-lg font-mono font-black text-neutral-900">
                    ₹{item.count * PRICING_CATALOG.antenna.baseSocket}
                  </span>
                </div>

                <motion.button
                  id={`btn-select-antenna-${item.count}`}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetAntennaCount(item.count);
                    if (item.count === 1) {
                      onOpenOneAntennaWarning();
                    }
                  }}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                      <span>{t('steps.antenna.selected', 'Selected')}</span>
                    </>
                  ) : (
                    t('steps.antenna.select', 'Select')
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

