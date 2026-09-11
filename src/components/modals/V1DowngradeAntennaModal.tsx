import React from 'react';
import { AlertCircle, X, Check, WifiOff, Radio } from 'lucide-react';

interface V1DowngradeAntennaModalProps {
  currentAntennaCount: number;
  hasWirelessEnabled: boolean;
  onClose: () => void;
  onConfirmDowngrade: () => void;
}

export const V1DowngradeAntennaModal: React.FC<V1DowngradeAntennaModalProps> = ({
  currentAntennaCount,
  hasWirelessEnabled,
  onClose,
  onConfirmDowngrade,
}) => {
  const isAntennaMismatch = currentAntennaCount !== 2;
  const isWirelessMismatch = hasWirelessEnabled;
  const isCombined = isAntennaMismatch && isWirelessMismatch;

  return (
    <div
      id="v1-downgrade-antenna-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="v1-downgrade-antenna-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm sm:max-w-md w-full animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {isCombined
                ? 'V1 Compatibility Adjustments'
                : isWirelessMismatch
                ? 'Wireless Control Disabled in V1'
                : '2 Antennas Required for V1'}
            </h3>
          </div>
          <button
            id="btn-close-v1-downgrade-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-xl border border-amber-200/90 mb-5 space-y-2.5">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
            Switching to <strong className="text-neutral-900 font-bold">V1 firmware</strong> requires the following adjustments:
          </p>

          <div className="space-y-2 pt-1">
            {isWirelessMismatch && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 font-semibold">Wireless Control:</strong> Will be turned <strong className="text-red-600 font-bold">OFF</strong> (not supported in V1).
                </span>
              </div>
            )}

            {isAntennaMismatch && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
                <Radio className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 font-semibold">Antenna Count:</strong> Will be set to <strong className="text-emerald-700 font-bold">2 Antennas</strong> (Slots 1 &amp; 2). You currently have {currentAntennaCount}.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            id="btn-cancel-downgrade"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Keep V2
          </button>
          <button
            id="btn-confirm-set-two-and-downgrade"
            type="button"
            onClick={onConfirmDowngrade}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isCombined ? 'Apply & Switch' : isWirelessMismatch ? 'Disable & Switch' : 'Set 2 & Switch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

