import React from 'react';
import { Info, X } from 'lucide-react';

interface AntennaInfoModalProps {
  type: 'v1' | 'v2';
  onClose: () => void;
}

export const AntennaInfoModal: React.FC<AntennaInfoModalProps> = ({ type, onClose }) => {
  return (
    <div
      id="antenna-info-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="antenna-info-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-300">
              <Info className="w-4.5 h-4.5 text-neutral-800" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {type === 'v1' ? 'V1 Antenna Requirement' : 'V2 Antenna Recommendation'}
            </h3>
          </div>
          <button
            id="btn-close-antenna-info"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/90 mb-5">
          {type === 'v1' ? (
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              The <strong className="text-neutral-900 font-semibold">V1 firmware</strong> is unable to operate with 1 antenna and must need at least 2 antennas to function.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              Unlike V1, it supports <strong className="text-neutral-900 font-semibold">1 antenna to 4 antennas</strong>, but we still recommend using at least 2 antennas for proper functioning.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            id="btn-got-it-antenna-info"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-lg transition-colors cursor-pointer shadow-xs text-center"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
