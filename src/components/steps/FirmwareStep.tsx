import React from 'react';
import { Info, Check } from 'lucide-react';

interface FirmwareStepProps {
  currentVersion: string;
  onSelectVersion: (version: 'V1' | 'V2') => void;
  onOpenAntennaModal: (type: 'v1' | 'v2') => void;
  onNextStep: () => void;
}

export const FirmwareStep: React.FC<FirmwareStepProps> = ({
  currentVersion,
  onSelectVersion,
  onOpenAntennaModal,
  onNextStep,
}) => {
  return (
    <div
      id="firmware-step-container"
      className="w-full h-full flex flex-col justify-between min-h-0 animate-in fade-in duration-150"
    >
      {/* Main Question Center Banner */}
      <div id="firmware-question-title-section" className="text-center py-1 sm:py-2 shrink-0">
        <h2
          id="heading-which-firmware-version"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          Which firmware version?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          Choose between V1 and V2 firmware base.
        </p>
      </div>

      <div
        id="cards-container-v1-v2"
        className="w-full flex-1 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 min-h-0 py-1"
      >
        {/* Left Card: V1 */}
        <div
          id="card-v1"
          onClick={() => {
            if (currentVersion === 'V1') {
              onNextStep();
            } else {
              onSelectVersion('V1');
            }
          }}
          className={`h-full w-full rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col p-2.5 sm:p-4 lg:p-5 min-h-0 overflow-hidden justify-between cursor-pointer ${
            currentVersion === 'V1'
              ? 'bg-white border-2 border-neutral-900 shadow-md ring-2 sm:ring-4 ring-neutral-900/5'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300'
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
          </div>

          {/* Bullet points info list */}
          <div id="card-v1-content" className="flex-1 w-full min-h-0 py-2 sm:py-3 lg:py-4 flex flex-col justify-evenly overflow-hidden">
            <ul id="v1-bullet-list" className="h-full w-full flex flex-col justify-evenly text-neutral-700 text-[clamp(0.825rem,1.15vw,1.05rem)] sm:text-base lg:text-lg leading-snug sm:leading-normal">
              {/* 1st: Display */}
              <li id="v1-bullet-display" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-emerald-600 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <strong className="text-neutral-900 font-bold">Display:</strong> Supported (0.96' OLED)
                </span>
              </li>

              {/* 2nd: Wireless Control */}
              <li id="v1-bullet-wireless" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-red-500 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <strong className="text-neutral-900 font-bold">Wireless Control:</strong> Not supported
                </span>
              </li>

              {/* 3rd: Antenna Capacity / Number */}
              <li id="v1-bullet-antenna-count" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <span className="inline-flex items-center gap-1">
                    <strong className="text-neutral-900 font-bold">Antenna Capacity</strong>
                    <button
                      id="btn-antenna-info-v1"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAntennaModal('v1');
                      }}
                      title="View V1 antenna requirements detail"
                      aria-label="V1 antenna requirement details"
                      className="inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-200 hover:bg-neutral-900 text-neutral-700 hover:text-white transition-colors cursor-pointer text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs"
                    >
                      <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <strong className="text-neutral-900 font-bold">:</strong>
                  </span>{' '}
                  2 antennas only
                </span>
              </li>

              {/* 4th: Type of Antenna Support */}
              <li id="v1-bullet-antenna-type" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <strong className="text-neutral-900 font-bold">Antenna Compatibility:</strong> Supports Normal &amp; Powerful
                </span>
              </li>
            </ul>
          </div>

          {/* Price & Select Button Footer */}
          <div id="card-v1-footer" className="pt-1.5 sm:pt-2.5 border-t border-neutral-100 shrink-0 space-y-1.5 sm:space-y-2">
            <div id="v1-price-container" className="flex items-center justify-between px-1 py-0.5">
              <span className="font-semibold text-neutral-600 text-[clamp(0.8rem,1vw,1rem)] sm:text-sm md:text-base">Firmware Price</span>
              <span className="font-mono font-black text-neutral-900 text-[clamp(1.15rem,1.8vw,1.6rem)] sm:text-xl md:text-2xl">₹100</span>
            </div>

            <button
              id="btn-select-v1"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentVersion === 'V1') {
                  onNextStep();
                } else {
                  onSelectVersion('V1');
                }
              }}
              className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl font-mono text-[clamp(0.7rem,1vw,0.875rem)] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] shadow-xs cursor-pointer"
            >
              {currentVersion === 'V1' ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>Selected</span>
                </>
              ) : (
                'Select V1'
              )}
            </button>
          </div>
        </div>

        {/* Right Card: V2 */}
        <div
          id="card-v2"
          onClick={() => {
            if (currentVersion === 'V2') {
              onNextStep();
            } else {
              onSelectVersion('V2');
            }
          }}
          className={`h-full w-full rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col p-2.5 sm:p-4 lg:p-5 min-h-0 overflow-hidden justify-between cursor-pointer ${
            currentVersion === 'V2'
              ? 'bg-white border-2 border-neutral-900 shadow-md ring-2 sm:ring-4 ring-neutral-900/5'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300'
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
          </div>

          {/* Bullet points info list */}
          <div id="card-v2-content" className="flex-1 w-full min-h-0 py-2 sm:py-3 lg:py-4 flex flex-col justify-evenly overflow-hidden">
            <ul id="v2-bullet-list" className="h-full w-full flex flex-col justify-evenly text-neutral-700 text-[clamp(0.825rem,1.15vw,1.05rem)] sm:text-base lg:text-lg leading-snug sm:leading-normal">
              {/* 1st: Display */}
              <li id="v2-bullet-display" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-emerald-600 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <strong className="text-neutral-900 font-bold">Display:</strong> Supported (0.96' OLED)
                </span>
              </li>

              {/* 2nd: Wireless Control */}
              <li id="v2-bullet-wireless" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-emerald-600 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <strong className="text-neutral-900 font-bold">Wireless Control:</strong> Supported
                </span>
              </li>

              {/* 3rd: Antenna Capacity */}
              <li id="v2-bullet-antenna-count" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <span className="inline-flex items-center gap-1">
                    <strong className="text-neutral-900 font-bold">Antenna Capacity</strong>
                    <button
                      id="btn-antenna-info-v2"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAntennaModal('v2');
                      }}
                      title="View V2 antenna recommendations detail"
                      aria-label="V2 antenna recommendation details"
                      className="inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-200 hover:bg-neutral-900 text-neutral-700 hover:text-white transition-colors cursor-pointer text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs"
                    >
                      <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <strong className="text-neutral-900 font-bold">:</strong>
                  </span>{' '}
                  1–4 antennas
                </span>
              </li>

              {/* 4th: Type of Antenna Support */}
              <li id="v2-bullet-antenna-type" className="flex items-start gap-2 sm:gap-2.5">
                <span className="text-neutral-900 font-black select-none text-base sm:text-lg lg:text-xl leading-none mt-0.5 shrink-0">•</span>
                <span className="leading-snug">
                  <strong className="text-neutral-900 font-bold">Antenna Compatibility:</strong> Supports Normal &amp; Powerful
                </span>
              </li>
            </ul>
          </div>

          {/* Price & Select Button Footer */}
          <div id="card-v2-footer" className="pt-1.5 sm:pt-2.5 border-t border-neutral-100 shrink-0 space-y-1.5 sm:space-y-2">
            <div id="v2-price-container" className="flex items-center justify-between px-1 py-0.5">
              <span className="font-semibold text-neutral-600 text-[clamp(0.8rem,1vw,1rem)] sm:text-sm md:text-base">Firmware Price</span>
              <span className="font-mono font-black text-neutral-900 text-[clamp(1.15rem,1.8vw,1.6rem)] sm:text-xl md:text-2xl">₹300</span>
            </div>

            <button
              id="btn-select-v2"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentVersion === 'V2') {
                  onNextStep();
                } else {
                  onSelectVersion('V2');
                }
              }}
              className="w-full py-1.5 sm:py-2.5 px-3 rounded-lg sm:rounded-xl font-mono text-[clamp(0.7rem,1vw,0.875rem)] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] shadow-xs cursor-pointer"
            >
              {currentVersion === 'V2' ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>Selected</span>
                </>
              ) : (
                'Select V2'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
