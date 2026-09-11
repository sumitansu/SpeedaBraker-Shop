import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface OneAntennaWarningModalProps {
  onClose: () => void;
  onSelectTwoAntennas: () => void;
}

export const OneAntennaWarningModal: React.FC<OneAntennaWarningModalProps> = ({
  onClose,
  onSelectTwoAntennas,
}) => {
  return (
    <div
      id="one-antenna-warning-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="one-antenna-warning-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm sm:max-w-md w-full animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Antenna Recommendation
            </h3>
          </div>
          <button
            id="btn-close-one-antenna-warning"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-red-50/70 p-3.5 sm:p-4 rounded-xl border border-red-200/90 mb-5">
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            Although <strong className="text-neutral-900 font-semibold">1 antenna</strong> is functional, we strongly recommend choosing <strong className="text-neutral-900 font-semibold">at least 2 antennas</strong> for seamless hopping between channels and significantly better signal stability.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            id="btn-keep-one-antenna"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Keep 1 Antenna
          </button>
          <button
            id="btn-change-to-two-antennas"
            type="button"
            onClick={onSelectTwoAntennas}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1"
          >
            Change to 2 Antennas
          </button>
        </div>
      </div>
    </div>
  );
};
