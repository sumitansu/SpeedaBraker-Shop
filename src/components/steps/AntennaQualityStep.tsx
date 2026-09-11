import React from 'react';
import { Radio, AlertCircle, Zap, Plus, Check, ShieldCheck } from 'lucide-react';
import { LowerSlotConfig } from '../../types';

interface AntennaQualityStepProps {
  currentVersion: string;
  slots: LowerSlotConfig[];
  onSetSlotQuality: (slotId: number, quality: 'Normal' | 'Powerful') => void;
  onOpenUnconfiguredModal: (slotId: number) => void;
  onGoToFirmware: () => void;
  onGoToAntennas: () => void;
}

interface QualityTierConfig {
  id: 'Normal' | 'Powerful';
  label: string;
  badge: string;
  subtitle: string;
  accentColor: string;
  activeBtnClass: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export const AntennaQualityStep: React.FC<AntennaQualityStepProps> = ({
  currentVersion,
  slots,
  onSetSlotQuality,
  onOpenUnconfiguredModal,
  onGoToFirmware,
  onGoToAntennas,
}) => {
  if (currentVersion === 'None') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">Firmware Selection Required</h3>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
          Please select a firmware version first before configuring antenna module qualities.
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

  if (slots.every((s) => s.value.toLowerCase() === 'none')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">Antenna Count Required</h3>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
          Please select the number of antennas first before configuring antenna module qualities.
        </p>
        <button
          type="button"
          onClick={onGoToAntennas}
          className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
        >
          Select Antennas
        </button>
      </div>
    );
  }

  const TIERS: QualityTierConfig[] = [
    {
      id: 'Normal',
      label: 'Normal Module',
      badge: '₹200',
      subtitle: 'Standard reliable transmission & efficiency',
      accentColor: 'border-emerald-500/80 ring-emerald-500/30',
      activeBtnClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/40',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'Powerful',
      label: 'Powerful Module',
      badge: '₹700',
      subtitle: 'High-power output & maximum signal reach',
      accentColor: 'border-amber-500/80 ring-amber-500/30',
      activeBtnClass: 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-400/40',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />,
    },
  ];

  return (
    <div
      id="antenna-quality-options-container"
      className="w-full h-full flex flex-col justify-between min-h-0 animate-in fade-in duration-150"
    >
      {/* Main Question Header */}
      <div id="antenna-quality-title-section" className="text-center py-1 sm:py-1.5 shrink-0 flex flex-col items-center">
        <h2
          id="heading-antenna-quality"
          className="text-base sm:text-xl md:text-2xl font-black text-neutral-900 tracking-tight"
        >
          Which antenna module quality?
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5 max-w-xl mx-auto">
          Choose Normal or Powerful for each antenna. Any combination is allowed.
        </p>

        {/* Pricing Reference Tabs */}
        <div
          id="quality-pricing-tabs"
          className="flex items-center justify-center gap-2 mt-1.5 flex-wrap"
        >
          <div
            id="tab-normal-module-price"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-xs font-mono font-bold shadow-2xs"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Normal: +₹200</span>
          </div>
          <div
            id="tab-powerful-module-price"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-mono font-bold shadow-2xs"
          >
            <Zap className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
            <span>Powerful: +₹700</span>
          </div>
        </div>
      </div>

      {/* 2 Long Horizontal Stacked Boxes (same style as antenna type) */}
      <div
        id="antenna-quality-stacked-boxes"
        className="flex-1 min-h-0 flex flex-col justify-center gap-2.5 sm:gap-3.5 py-1 sm:py-2"
      >
        {TIERS.map((tier) => {
          return (
            <div
              key={tier.id}
              id={`card-quality-tier-${tier.id.toLowerCase()}`}
              className="bg-white rounded-xl sm:rounded-2xl border-2 border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all p-2.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 overflow-hidden"
            >
              {/* Left Side: Tier Label, Badges & Subtitle */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${tier.badgeClass}`}
                >
                  {tier.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black font-mono text-neutral-900 tracking-tight">
                      {tier.label}
                    </h3>
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${tier.badgeClass}`}
                    >
                      +{tier.badge}
                    </span>
                    {/* Green In Stock Badge */}
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-mono font-bold tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>In Stock</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 truncate hidden sm:block mt-0.5">
                    {tier.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Side: 4 Antenna Buttons (A1, A2, A3, A4) */}
              <div
                id={`antenna-quality-buttons-row-${tier.id.toLowerCase()}`}
                className="grid grid-cols-4 gap-1.5 sm:gap-2 sm:w-auto w-full"
              >
                {slots.map((slot) => {
                  const val = slot.value.toLowerCase();
                  const isConfigured = val !== 'none';
                  // An antenna is active in this tier if its current quality equals this tier's id
                  const isSelectedInThisTier =
                    isConfigured &&
                    (tier.id === 'Normal' ? val === 'normal' : val === 'powerful');

                  if (!isConfigured) {
                    // Unconfigured / Grayed out Button
                    return (
                      <button
                        key={slot.id}
                        id={`btn-quality-${tier.id.toLowerCase()}-unconfigured-slot-${slot.id}`}
                        type="button"
                        onClick={() => onOpenUnconfiguredModal(slot.id)}
                        title={`Antenna ${slot.id} is unconfigured. Click to configure.`}
                        className="py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100/70 hover:bg-neutral-200/80 text-neutral-400 hover:text-neutral-600 transition-all flex flex-col items-center justify-center cursor-pointer group min-w-[3.5rem] sm:min-w-[4.2rem]"
                      >
                        <div className="flex items-center gap-0.5">
                          <span className="text-[11px] sm:text-xs font-mono font-bold">
                            A{slot.id}
                          </span>
                          <Plus className="w-2.5 h-2.5 text-neutral-400 group-hover:text-neutral-600 transition-transform group-hover:scale-110" />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 uppercase tracking-tighter">
                          Disabled
                        </span>
                      </button>
                    );
                  }

                  // Configured Button: Active in this tier vs Clickable
                  return (
                    <button
                      key={slot.id}
                      id={`btn-quality-${tier.id.toLowerCase()}-slot-${slot.id}`}
                      type="button"
                      onClick={() => onSetSlotQuality(slot.id, tier.id)}
                      className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer min-w-[3.5rem] sm:min-w-[4.2rem] ${
                        isSelectedInThisTier
                          ? tier.activeBtnClass
                          : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 hover:border-neutral-400 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isSelectedInThisTier ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Radio className="w-3 h-3 text-neutral-400" />
                        )}
                        <span className="text-xs sm:text-sm font-black font-mono tracking-tight">
                          A{slot.id}
                        </span>
                      </div>
                      <span
                        className={`text-[8px] sm:text-[9px] font-mono font-semibold uppercase tracking-tighter ${
                          isSelectedInThisTier ? 'opacity-90' : 'text-neutral-500'
                        }`}
                      >
                        {isSelectedInThisTier ? 'Active' : 'Select'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
