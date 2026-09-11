import React from 'react';
import { Radio, X, Sparkles, Check, Zap } from 'lucide-react';

interface AddUnconfiguredAntennaModalProps {
  slotId: number;
  onClose: () => void;
  onAddAsNormal: () => void;
  onAddAsPowerful: () => void;
}

export const AddUnconfiguredAntennaModal: React.FC<AddUnconfiguredAntennaModalProps> = ({
  slotId,
  onClose,
  onAddAsNormal,
  onAddAsPowerful,
}) => {
  return (
    <div
      id="add-unconfigured-antenna-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="add-unconfigured-antenna-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-sm sm:max-w-md w-full animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Radio className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Add Antenna Slot {slotId}
              </h3>
              <p className="text-[11px] text-neutral-500">Currently Unconfigured</p>
            </div>
          </div>
          <button
            id="btn-close-add-antenna-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
          Antenna Slot <strong className="text-neutral-900 font-semibold">{slotId}</strong> is currently unconfigured. Would you like to add this antenna to your configuration, or keep it unconfigured?
        </p>

        {/* Quality Options Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Normal Option */}
          <button
            id={`btn-add-normal-slot-${slotId}`}
            type="button"
            onClick={onAddAsNormal}
            className="p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700">Normal</span>
              <Check className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600" />
            </div>
            <p className="text-[11px] text-neutral-500 mb-2 leading-tight">Standard performance module</p>
            <span className="text-sm font-mono font-bold text-neutral-900 group-hover:text-emerald-700">₹200</span>
          </button>

          {/* Powerful Option */}
          <button
            id={`btn-add-powerful-slot-${slotId}`}
            type="button"
            onClick={onAddAsPowerful}
            className="p-3 rounded-xl border border-neutral-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all text-left group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-amber-700">Powerful</span>
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              </div>
              <Sparkles className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-600" />
            </div>
            <p className="text-[11px] text-neutral-500 mb-2 leading-tight">High-gain high-power module</p>
            <span className="text-sm font-mono font-bold text-neutral-900 group-hover:text-amber-700">₹700</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
          <button
            id="btn-keep-unconfigured-slot"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Keep Unconfigured
          </button>
        </div>
      </div>
    </div>
  );
};
