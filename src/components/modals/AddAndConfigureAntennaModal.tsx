import React, { useState } from 'react';
import { Radio, X, Sparkles, Check, Zap } from 'lucide-react';
import { AntennaDbiType } from '../../types';

interface AddAndConfigureAntennaModalProps {
  slotId: number;
  initialTierId?: AntennaDbiType;
  onClose: () => void;
  onConfirm: (slotId: number, quality: 'Normal' | 'Powerful', dbi: AntennaDbiType) => void;
}

export const AddAndConfigureAntennaModal: React.FC<AddAndConfigureAntennaModalProps> = ({
  slotId,
  initialTierId = '6dbi',
  onClose,
  onConfirm,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<'Normal' | 'Powerful'>('Normal');
  const [selectedDbi, setSelectedDbi] = useState<AntennaDbiType>(initialTierId);

  const qualityCost = selectedQuality === 'Normal' ? 200 : 700;
  const dbiCost = selectedDbi === '0dbi' ? 100 : selectedDbi === '6dbi' ? 150 : 450;
  const totalAntennaCost = 50 + qualityCost + dbiCost;

  return (
    <div
      id="add-and-configure-antenna-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        id="add-and-configure-antenna-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Radio className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Add & Configure Antenna Slot {slotId}
              </h3>
              <p className="text-[11px] text-neutral-500">Configure quality & antenna type</p>
            </div>
          </div>
          <button
            id="btn-close-add-configure-antenna-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Module Quality */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            1. Select Module Quality
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Normal Option */}
            <button
              id={`btn-config-quality-normal-${slotId}`}
              type="button"
              onClick={() => setSelectedQuality('Normal')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedQuality === 'Normal'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-neutral-900">Normal</span>
                {selectedQuality === 'Normal' && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                )}
              </div>
              <p className="text-[10px] text-neutral-500 mb-2 leading-tight">Standard efficiency module</p>
              <span className="text-xs font-mono font-bold text-emerald-700">+₹200</span>
            </button>

            {/* Powerful Option */}
            <button
              id={`btn-config-quality-powerful-${slotId}`}
              type="button"
              onClick={() => setSelectedQuality('Powerful')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedQuality === 'Powerful'
                  ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-neutral-900">Powerful</span>
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
                {selectedQuality === 'Powerful' && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <p className="text-[10px] text-neutral-500 mb-2 leading-tight">High-power signal module</p>
              <span className="text-xs font-mono font-bold text-amber-700">+₹700</span>
            </button>
          </div>
        </div>

        {/* Section 2: Antenna Type (dBi) */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            2. Select Antenna Type (dBi)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '0dbi' as AntennaDbiType, label: '0 dBi', desc: 'Compact', cost: '+₹100' },
              { id: '6dbi' as AntennaDbiType, label: '6 dBi', desc: 'Balanced', cost: '+₹150' },
              { id: '12dbi' as AntennaDbiType, label: '12 dBi', desc: 'High Gain', cost: '+₹450' },
            ].map((tier) => (
              <button
                key={tier.id}
                id={`btn-config-dbi-${tier.id}-${slotId}`}
                type="button"
                onClick={() => setSelectedDbi(tier.id)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  selectedDbi === tier.id
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                }`}
              >
                <span className="text-xs font-mono font-bold">{tier.label}</span>
                <span
                  className={`text-[9px] my-1 ${
                    selectedDbi === tier.id ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {tier.desc}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    selectedDbi === tier.id ? 'text-emerald-300' : 'text-neutral-700'
                  }`}
                >
                  {tier.cost}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cost Summary Banner */}
        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 mb-4 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
              Slot {slotId} Total Addition
            </span>
            <span className="text-[11px] text-neutral-600">
              Hardware (₹50) + Module (₹{qualityCost}) + Antenna (₹{dbiCost})
            </span>
          </div>
          <span className="text-base font-mono font-black text-neutral-900">
            ₹{totalAntennaCost}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <button
            id="btn-cancel-add-configure-antenna"
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            id={`btn-confirm-add-configure-slot-${slotId}`}
            type="button"
            onClick={() => onConfirm(slotId, selectedQuality, selectedDbi)}
            className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all cursor-pointer text-center shadow-xs"
          >
            Add Antenna {slotId}
          </button>
        </div>
      </div>
    </div>
  );
};
