import React from 'react';
import { Info, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { PRICING_CATALOG } from '../../utils/pricing';

interface FirmwareStepProps {
  currentVersion: string;
  onSelectVersion: (version: 'V1' | 'V2') => void;
  onOpenAntennaModal: (type: 'v1' | 'v2') => void;
  onNextStep: () => void;
  stockMap?: Record<string, boolean>;
}

export const FirmwareStep: React.FC<FirmwareStepProps> = ({
  currentVersion,
  onSelectVersion,
  onOpenAntennaModal,
  onNextStep,
}) => {
  const { t } = useTranslation();

  return (
    <div
      id="firmware-step-container"
      className="w-full h-full flex flex-col justify-between min-h-0"
    >
      {/* Main Question Center Banner */}
      <motion.div
        id="firmware-question-title-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center py-1 sm:py-2 shrink-0"
      >
        <h2
          id="heading-which-firmware-version"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          {t('steps.firmware.title', 'Which firmware version?')}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          {t('steps.firmware.desc', 'Choose between V1 and V2 firmware base.')}
        </p>
      </motion.div>

      <div
        id="cards-container-v1-v2"
        className="w-full flex-1 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 min-h-0 py-1"
      >
        {/* Left Card: V1 */}
        <motion.div
          id="card-v1"
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => {
            if (currentVersion === 'V1') {
              onNextStep();
            } else {
              onSelectVersion('V1');
            }
          }}
          className={`h-full w-full rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col p-2.5 sm:p-4 lg:p-5 min-h-0 overflow-hidden justify-between cursor-pointer ${
            currentVersion === 'V1'
              ? 'bg-white border-2 border-neutral-900 shadow-md ring-2 sm:ring-4 ring-neutral-900/10'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-sm'
          }`}
        >
          {/* Header: Name */}
          <div id="card-v1-header" className="flex items-center justify-between pb-1.5 sm:pb-2.5 border-b border-neutral-100 shrink-0">
            <h2
              id="heading-v1"
              className="font-black text-neutral-900 tracking-tight font-mono text-[clamp(1.25rem,2.8vw,2.75rem)] leading-none"
            >
              V1
            </h2>
            {currentVersion === 'V1' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold border border-emerald-300"
              >
                {t('steps.firmware.v1.active', 'Active')}
              </motion.span>
            )}
          </div>

          {/* Bullet points info list */}
          <div id="card-v1-content" className="flex-1 w-full min-h-0 py-2 sm:py-3 lg:py-4 flex flex-col justify-evenly overflow-hidden">
            <ul id="v1-bullet-list" className="h-full w-full flex flex-col justify-evenly text-neutral-700 text-[clamp(0.825rem,1.15vw,1.05rem)] sm:text-base lg:text-lg leading-snug sm:leading-normal">
              {/* 1st: Display */}
              <li id="v1-bullet-display" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-emerald-600 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  {t('steps.firmware.v1.displayBullet', "Display: Supported (0.96' OLED)")}
                </span>
              </li>

              {/* 2nd: Wireless Control */}
              <li id="v1-bullet-wireless" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-red-500 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  {t('steps.firmware.v1.wirelessBullet', 'Wireless Control: Not supported')}
                </span>
              </li>

              {/* 3rd: Antenna Capacity / Number */}
              <li id="v1-bullet-antenna-count" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <span className="inline-flex items-center gap-1">
                    <strong className="text-neutral-900 font-bold">
                      {t('topGrid.antennas', 'Antenna')}
                    </strong>
                    <motion.button
                      id="btn-antenna-info-v1"
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAntennaModal('v1');
                      }}
                      title="View V1 antenna requirements detail"
                      aria-label="V1 antenna requirement details"
                      className="inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-200 hover:bg-neutral-900 text-neutral-700 hover:text-white transition-colors cursor-pointer text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs"
                    >
                      <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </motion.button>
                    <strong className="text-neutral-900 font-bold">:</strong>
                  </span>{' '}
                  {t('steps.firmware.v1.antennaCountBullet', '2 antennas only').replace(/^.*:\s*/, '')}
                </span>
              </li>

              {/* 4th: Type of Antenna Support */}
              <li id="v1-bullet-antenna-type" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  {t('steps.firmware.v1.antennaTypeBullet', 'Antenna Compatibility: Supports Normal & Powerful')}
                </span>
              </li>
            </ul>
          </div>

          {/* Price & Select Button Footer */}
          <div id="card-v1-footer" className="pt-1.5 sm:pt-2.5 border-t border-neutral-100 shrink-0 space-y-1.5 sm:space-y-2">
            <div id="v1-price-container" className="flex items-center justify-between px-1 py-0.5">
              <span className="font-semibold text-neutral-600 text-[clamp(0.8rem,1vw,1rem)] sm:text-sm md:text-base">
                {t('steps.firmware.v1.priceLabel', 'Firmware Price')}
              </span>
              <span className="font-mono font-black text-neutral-900 text-[clamp(1.15rem,1.8vw,1.6rem)] sm:text-xl md:text-2xl">
                ₹{PRICING_CATALOG.version.V1}
              </span>
            </div>

            <motion.button
              id="btn-select-v1"
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                if (currentVersion === 'V1') {
                  onNextStep();
                } else {
                  onSelectVersion('V1');
                }
              }}
              className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl font-mono text-[clamp(0.7rem,1vw,0.875rem)] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer"
            >
              {currentVersion === 'V1' ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>{t('steps.firmware.v1.selected', 'Selected')}</span>
                </>
              ) : (
                t('steps.firmware.v1.select', 'Select V1')
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Right Card: V2 */}
        <motion.div
          id="card-v2"
          whileHover={{ y: -3, scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => {
            if (currentVersion === 'V2') {
              onNextStep();
            } else {
              onSelectVersion('V2');
            }
          }}
          className={`h-full w-full rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col p-2.5 sm:p-4 lg:p-5 min-h-0 overflow-hidden justify-between cursor-pointer ${
            currentVersion === 'V2'
              ? 'bg-white border-2 border-neutral-900 shadow-md ring-2 sm:ring-4 ring-neutral-900/10'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-sm'
          }`}
        >
          {/* Header: Name */}
          <div id="card-v2-header" className="flex items-center justify-between pb-1.5 sm:pb-2.5 border-b border-neutral-100 shrink-0">
            <h2
              id="heading-v2"
              className="font-black text-neutral-900 tracking-tight font-mono text-[clamp(1.25rem,2.8vw,2.75rem)] leading-none"
            >
              V2
            </h2>
            {currentVersion === 'V2' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold border border-emerald-300"
              >
                {t('steps.firmware.v2.active', 'Active')}
              </motion.span>
            )}
          </div>

          {/* Bullet points info list */}
          <div id="card-v2-content" className="flex-1 w-full min-h-0 py-2 sm:py-3 lg:py-4 flex flex-col justify-evenly overflow-hidden">
            <ul id="v2-bullet-list" className="h-full w-full flex flex-col justify-evenly text-neutral-700 text-[clamp(0.825rem,1.15vw,1.05rem)] sm:text-base lg:text-lg leading-snug sm:leading-normal">
              {/* 1st: Display */}
              <li id="v2-bullet-display" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-emerald-600 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  {t('steps.firmware.v2.displayBullet', "Display: Supported (0.96' OLED)")}
                </span>
              </li>

              {/* 2nd: Wireless Control */}
              <li id="v2-bullet-wireless" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-emerald-600 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  {t('steps.firmware.v2.wirelessBullet', 'Wireless Control: Supported')}
                </span>
              </li>

              {/* 3rd: Antenna Capacity */}
              <li id="v2-bullet-antenna-count" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <span className="inline-flex items-center gap-1">
                    <strong className="text-neutral-900 font-bold">
                      {t('topGrid.antennas', 'Antenna')}
                    </strong>
                    <motion.button
                      id="btn-antenna-info-v2"
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAntennaModal('v2');
                      }}
                      title="View V2 antenna recommendations detail"
                      aria-label="V2 antenna recommendation details"
                      className="inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-200 hover:bg-neutral-900 text-neutral-700 hover:text-white transition-colors cursor-pointer text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs"
                    >
                      <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </motion.button>
                    <strong className="text-neutral-900 font-bold">:</strong>
                  </span>{' '}
                  {t('steps.firmware.v2.antennaCountBullet', '1–4 antennas').replace(/^.*:\s*/, '')}
                </span>
              </li>

              {/* 4th: Type of Antenna Support */}
              <li id="v2-bullet-antenna-type" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  {t('steps.firmware.v2.antennaTypeBullet', 'Antenna Compatibility: Supports Normal & Powerful')}
                </span>
              </li>
            </ul>
          </div>

          {/* Price & Select Button Footer */}
          <div id="card-v2-footer" className="pt-1.5 sm:pt-2.5 border-t border-neutral-100 shrink-0 space-y-1.5 sm:space-y-2">
            <div id="v2-price-container" className="flex items-center justify-between px-1 py-0.5">
              <span className="font-semibold text-neutral-600 text-[clamp(0.8rem,1vw,1rem)] sm:text-sm md:text-base">
                {t('steps.firmware.v2.priceLabel', 'Firmware Price')}
              </span>
              <span className="font-mono font-black text-neutral-900 text-[clamp(1.15rem,1.8vw,1.6rem)] sm:text-xl md:text-2xl">
                ₹{PRICING_CATALOG.version.V2}
              </span>
            </div>

            <motion.button
              id="btn-select-v2"
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                if (currentVersion === 'V2') {
                  onNextStep();
                } else {
                  onSelectVersion('V2');
                }
              }}
              className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl font-mono text-[clamp(0.7rem,1vw,0.875rem)] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer"
            >
              {currentVersion === 'V2' ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>{t('steps.firmware.v2.selected', 'Selected')}</span>
                </>
              ) : (
                t('steps.firmware.v2.select', 'Select V2')
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


