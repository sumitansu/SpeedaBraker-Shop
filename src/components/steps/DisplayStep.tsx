import React from 'react';
import { AlertCircle, Monitor, MonitorOff } from 'lucide-react';

interface DisplayStepProps {
  currentVersion: string;
  currentDisplay: string;
  onSelectDisplay: (val: 'Yes' | 'No') => void;
  onGoToFirmware: () => void;
}

export const DisplayStep: React.FC<DisplayStepProps> = ({
  currentVersion,
  currentDisplay,
  onSelectDisplay,
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
          Please select a firmware version first before configuring display options.
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

  return (
    <div
      id="display-question-container"
      className="w-full h-full flex flex-col justify-between p-1 sm:p-2 animate-in fade-in duration-150 min-h-0"
    >
      {/* Main Question Center Banner */}
      <div id="display-question-title-section" className="text-center py-1 sm:py-2 shrink-0">
        <h2
          id="heading-do-you-want-display"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight"
        >
          Do you want display?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 max-w-xl mx-auto">
          Displays the active operating mode (Bluetooth, BLE, Wi-Fi, or RC Remote).
        </p>
      </div>

      {/* Options: No and Yes cards */}
      <div
        id="display-options-grid"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0 py-1"
      >
        {/* Option 1: No */}
        <div
          id="card-display-no"
          onClick={() => onSelectDisplay('No')}
          className={`rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
            currentDisplay === 'No'
              ? 'bg-white border-2 border-red-500 shadow-md ring-2 sm:ring-4 ring-red-500/10'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white'
          }`}
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentDisplay === 'No'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <MonitorOff className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                  No
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                  Blinking LED pattern indicator
                </p>
              </div>
            </div>
          </div>

          {/* Middle detail */}
          <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
            <p>
              Harder to keep track of the active operating mode, as only an onboard LED blinks in unique patterns to represent{' '}
              <span className="font-semibold text-neutral-800">Bluetooth, BLE, Wi-Fi, or RC Remote</span>.
            </p>
          </div>

          {/* Footer & Price */}
          <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">Cost</span>
              <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">₹0</span>
            </div>

            <button
              id="btn-select-display-no"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectDisplay('No');
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                currentDisplay === 'No'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {currentDisplay === 'No' ? 'Selected' : 'No'}
            </button>
          </div>
        </div>

        {/* Option 2: Yes */}
        <div
          id="card-display-yes"
          onClick={() => onSelectDisplay('Yes')}
          className={`rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col justify-between p-3 sm:p-5 cursor-pointer min-h-0 ${
            currentDisplay === 'Yes'
              ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 sm:ring-4 ring-emerald-500/10'
              : 'bg-white/90 border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:bg-white'
          }`}
        >
          {/* Top content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentDisplay === 'Yes'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                    Yes
                  </h3>
                  <span
                    id="badge-display-in-stock"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In Stock</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 hidden sm:block">
                  0.96' OLED screen
                </p>
              </div>
            </div>
          </div>

          {/* Middle detail */}
          <div className="py-2 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-1">
            <p>
              Much easier to operate as the display clearly shows the currently active operating mode (
              <span className="font-semibold text-neutral-800">Bluetooth, BLE, Wi-Fi, or RC Remote</span>).
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 pt-0.5">
              <span className="font-semibold text-neutral-700">Note:</span> LED light is not provided when the display is added (can be added on request, though not needed with the display).
            </p>
          </div>

          {/* Footer & Price */}
          <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-semibold">Cost</span>
              <span className="text-base sm:text-xl md:text-2xl font-mono font-black text-neutral-900">₹300</span>
            </div>

            <button
              id="btn-select-display-yes"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectDisplay('Yes');
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                currentDisplay === 'Yes'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {currentDisplay === 'Yes' ? 'Selected' : 'Yes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
