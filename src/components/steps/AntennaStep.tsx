import React from 'react';
import { AlertCircle, Radio, Sparkles, Check, Info } from 'lucide-react';

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
  if (currentVersion === 'None') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">Firmware Selection Required</h3>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
          Please select a firmware version first before configuring antenna options.
        </p>
        <button
          type="button"
          onClick={onGoToFirmware}
          className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
        >
          Select Firmware
        </button>
      </div>
    );
  }

  if (currentVersion === 'V1') {
    return (
      <div
        id="v1-antenna-options-container"
        className="w-full h-full flex flex-col justify-between min-h-0 animate-in fade-in duration-150"
      >
        {/* Main Question Center Banner */}
        <div id="v1-antenna-title-section" className="text-center py-1 sm:py-2 shrink-0">
          <h2
            id="heading-v1-antenna-count"
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
          >
            How many antennas?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
            V1 firmware operates with 2 antennas. Change to V2 for 1 to 4 antenna options.
          </p>
        </div>

        {/* Options: 2 Antennas card vs Change to V2 card */}
        <div
          id="v1-antenna-cards-grid"
          className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-6 flex-1 min-h-0 py-1"
        >
          {/* Option 1: 2 Antennas (Required for V1) */}
          <div
            id="card-v1-antenna-2"
            onClick={() => onSetAntennaCount(2)}
            className={`rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
              activeAntennaCount === 2
                ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
                : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white'
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
                    Keep 2 Antennas
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                    Dual-antenna configuration
                  </p>
                </div>
              </div>
            </div>

            {/* Middle detail */}
            <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
              <p>
                Required for V1 firmware. Operates with Antenna Slot 1 and Slot 2. Slots 3 and 4 remain disabled.
              </p>
            </div>

            {/* Footer & Price */}
            <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Cost
                </span>
                <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">
                  ₹100
                </span>
              </div>

              <button
                id="btn-select-v1-antenna-2"
                type="button"
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
                {activeAntennaCount === 2 ? 'Selected' : 'Keep 2 Antennas'}
              </button>
            </div>
          </div>

          {/* Option 2: Change to V2 for more combinations */}
          <div
            id="card-v1-upgrade-v2"
            onClick={onUpgradeToV2}
            className="rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white"
          >
            {/* Top content */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                    Change to V2
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                    Unlock 1 to 4 antennas
                  </p>
                </div>
              </div>
            </div>

            {/* Middle detail */}
            <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
              <p>
                Change to V2 firmware to configure flexible 1, 3, or 4 antenna combinations and enable 5GHz Wi-Fi.
              </p>
            </div>

            {/* Footer & Price */}
            <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Cost
                </span>
                <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">
                  ₹200
                </span>
              </div>

              <button
                id="btn-upgrade-v2-from-antenna"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpgradeToV2();
                }}
                className="px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-tight sm:tracking-wider transition-all flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs cursor-pointer whitespace-nowrap"
              >
                <span>Change to V2</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // V2 firmware: 1 to 4 antenna combinations
  return (
    <div
      id="v2-antenna-options-container"
      className="w-full h-full flex flex-col justify-between min-h-0 animate-in fade-in duration-150"
    >
      {/* Main Question Center Banner */}
      <div id="v2-antenna-title-section" className="text-center py-1 sm:py-2 shrink-0">
        <h2
          id="heading-v2-antenna-count"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          How many antennas?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          Choose 1 to 4 antennas. ₹50 per antenna.
        </p>
      </div>

      {/* 4 Options Grid */}
      <div
        id="v2-antenna-cards-grid"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 flex-1 min-h-0 py-1"
      >
        {[
          { count: 1, title: '1 Antenna', subtitle: 'Slot 1' },
          { count: 2, title: '2 Antennas', subtitle: 'Slots 1 & 2' },
          { count: 3, title: '3 Antennas', subtitle: 'Slots 1, 2 & 3' },
          { count: 4, title: '4 Antennas', subtitle: 'All 4 Slots' },
        ].map((item) => {
          const isSelected = activeAntennaCount === item.count;
          return (
            <div
              key={item.count}
              id={`card-antenna-count-${item.count}`}
              onClick={() => {
                onSetAntennaCount(item.count);
                if (item.count === 1) {
                  onOpenOneAntennaWarning();
                }
              }}
              className={`rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col justify-between p-3 sm:p-4 cursor-pointer min-h-0 ${
                isSelected
                  ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
                  : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white'
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
                        <button
                          id="btn-antenna-1-warning-info"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOneAntennaWarning();
                          }}
                          title="Channel hopping recommendation"
                          className="w-5 h-5 rounded-full bg-red-100/90 hover:bg-red-200/90 text-red-700 border border-red-200 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
                        >
                          <Info className="w-3.5 h-3.5 text-red-600 stroke-[2.2]" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-500">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle visual dots */}
              <div className="py-2 space-y-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((slotNum) => {
                    const isActive = slotNum <= item.count;
                    return (
                      <div
                        key={slotNum}
                        className={`h-2 rounded-full transition-colors ${
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
                    Cost
                  </span>
                  <span className="text-sm sm:text-base md:text-lg font-mono font-black text-neutral-900">
                    ₹{item.count * 50}
                  </span>
                </div>

                <button
                  id={`btn-select-antenna-${item.count}`}
                  type="button"
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
                      <span>Selected</span>
                    </>
                  ) : (
                    'Select'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
