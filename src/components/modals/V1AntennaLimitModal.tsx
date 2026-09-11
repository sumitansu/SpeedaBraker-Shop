import React from 'react';
import { AlertCircle, X, Sparkles } from 'lucide-react';

interface V1AntennaLimitModalProps {
  slotId: number;
  onClose: () => void;
  onUpgradeToV2: () => void;
}

export const V1AntennaLimitModal: React.FC<V1AntennaLimitModalProps> = ({
  slotId,
  onClose,
  onUpgradeToV2,
}) => {
  return (
    <div
      id="v1-antenna-limit-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="v1-antenna-limit-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm sm:max-w-md w-full animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              V1 Antenna Limit
            </h3>
          </div>
          <button
            id="btn-close-v1-antenna-limit"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-xl border border-amber-200/90 mb-5">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            You cannot activate <strong className="text-neutral-900 font-semibold">Antenna Slot {slotId}</strong> under V1 firmware. The V1 firmware only supports up to 2 antennas (Slots 1 &amp; 2).
          </p>
          <p className="text-xs sm:text-sm text-neutral-700 mt-2 leading-relaxed">
            To use 3 or 4 antennas, you need to upgrade to <strong className="text-neutral-900 font-semibold">V2 firmware</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            id="btn-understood-v1-limit"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Understood
          </button>
          <button
            id="btn-upgrade-v2-from-limit"
            type="button"
            onClick={onUpgradeToV2}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Upgrade to V2</span>
          </button>
        </div>
      </div>
    </div>
  );
};
