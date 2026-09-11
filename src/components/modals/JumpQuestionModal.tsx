import React from 'react';
import { X } from 'lucide-react';
import { StepConfig, StepId, UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../../types';

interface JumpQuestionModalProps {
  steps: StepConfig[];
  currentStep: StepId;
  currentVersion: string;
  upperBoxes: UpperBoxConfig[];
  slots: LowerSlotConfig[];
  antennaDbiTypes?: Record<number, AntennaDbiType | undefined>;
  onClose: () => void;
  onSelectStep: (stepId: StepId) => void;
}

export const JumpQuestionModal: React.FC<JumpQuestionModalProps> = ({
  steps,
  currentStep,
  currentVersion,
  upperBoxes,
  slots,
  antennaDbiTypes,
  onClose,
  onSelectStep,
}) => {
  return (
    <div
      id="jump-question-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        id="jump-question-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 max-w-sm sm:max-w-md w-full animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-neutral-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Jump to Question
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Choose any question to jump directly to it
            </p>
          </div>
          <button
            id="btn-close-jump-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto pr-0.5">
          {steps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const value = step.getValue(upperBoxes, slots, antennaDbiTypes);

            const isStepAnswered = (id: StepId): boolean => {
              switch (id) {
                case 'firmware': {
                  const ver = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || currentVersion;
                  return ver !== 'None';
                }
                case 'display': {
                  const disp = upperBoxes.find((b) => b.label.toLowerCase() === 'display')?.value;
                  return disp !== 'None' && disp !== undefined;
                }
                case 'wireless': {
                  const wl = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value;
                  return wl !== 'None' && wl !== undefined;
                }
                case 'antennas': {
                  return slots.some((s) => s.value.toLowerCase() !== 'none');
                }
                case 'quality': {
                  const active = slots.filter((s) => s.value.toLowerCase() !== 'none');
                  return active.length > 0 && active.every((s) => s.value === 'Normal' || s.value === 'Powerful');
                }
                case 'type': {
                  const active = slots.filter((s) => s.value.toLowerCase() !== 'none');
                  const dbi = antennaDbiTypes || {};
                  return active.length > 0 && active.every((s) => Boolean(dbi[s.id]));
                }
                default:
                  return false;
              }
            };

            const firstUnansweredPrevStep = steps.slice(0, index).find((s) => !isStepAnswered(s.id));
            const isLocked = !isCurrent && Boolean(firstUnansweredPrevStep);

            let lockReason = '';
            if (isLocked && firstUnansweredPrevStep) {
              if (firstUnansweredPrevStep.id === 'firmware') lockReason = 'Select Firmware First';
              else if (firstUnansweredPrevStep.id === 'antennas') lockReason = 'Select Antennas First';
              else if (firstUnansweredPrevStep.id === 'quality') lockReason = 'Configure Quality First';
              else lockReason = `Answer ${firstUnansweredPrevStep.name} First`;
            }
            return (
              <button
                key={step.id}
                id={`btn-jump-step-${step.id}`}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  onSelectStep(step.id);
                  onClose();
                }}
                className={`w-full p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isLocked
                    ? 'border-neutral-200 bg-neutral-100/70 text-neutral-400 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs cursor-pointer'
                    : 'border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 text-neutral-800 hover:border-neutral-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${isCurrent ? 'text-white' : isLocked ? 'text-neutral-400' : 'text-neutral-900'}`}>
                      {step.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-neutral-800 text-neutral-200 rounded">
                        Current
                      </span>
                    )}
                    {isLocked && lockReason && (
                      <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded">
                        {lockReason}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`inline-flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${
                        isCurrent
                          ? 'bg-neutral-800 text-emerald-300 border-neutral-700'
                          : isLocked
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200'
                          : value === 'None'
                          ? 'bg-neutral-200/80 text-neutral-700 border-neutral-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                </div>

                {/* Step Description */}
                <p className={`text-xs mt-0.5 ${isCurrent ? 'text-neutral-300' : isLocked ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {step.description}
                </p>

                {/* Color-Coded Compact A1-A4 Badges for Quality & Type steps */}
                {step.id === 'quality' && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {slots.map((slot) => {
                      const val = slot.value.toLowerCase();
                      const isConfigured = val !== 'none';
                      let badgeStyle = '';
                      let title = `Antenna ${slot.id}: Unconfigured`;

                      if (!isConfigured) {
                        badgeStyle = isCurrent
                          ? 'bg-neutral-800/60 text-neutral-600 border-neutral-700/50 opacity-40'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 opacity-40';
                      } else if (val === 'normal') {
                        badgeStyle = isCurrent
                          ? 'bg-emerald-500 text-white font-bold border-emerald-400'
                          : 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300';
                        title = `Antenna ${slot.id}: Normal`;
                      } else if (val === 'powerful') {
                        badgeStyle = isCurrent
                          ? 'bg-amber-400 text-neutral-900 font-bold border-amber-300'
                          : 'bg-amber-100 text-amber-900 font-bold border-amber-300';
                        title = `Antenna ${slot.id}: Powerful`;
                      } else if (val === 'conf') {
                        badgeStyle = isCurrent
                          ? 'bg-emerald-600/90 text-white font-bold border-emerald-400 border-dashed'
                          : 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300 border-dashed';
                        title = `Antenna ${slot.id}: Conf`;
                      } else {
                        badgeStyle = isCurrent
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-600 border-dashed'
                          : 'bg-white text-neutral-500 border-neutral-300 border-dashed';
                        title = `Antenna ${slot.id}: Unset`;
                      }

                      return (
                        <span
                          key={slot.id}
                          title={title}
                          className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[10.5px] font-mono border transition-colors ${badgeStyle}`}
                        >
                          A{slot.id}
                        </span>
                      );
                    })}
                  </div>
                )}

                {step.id === 'type' && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {slots.map((slot) => {
                      const val = slot.value.toLowerCase();
                      const isConfigured = val !== 'none';
                      const dbi = antennaDbiTypes ? antennaDbiTypes[slot.id] : undefined;
                      let badgeStyle = '';
                      let title = `Antenna ${slot.id}: Unconfigured`;

                      if (!isConfigured) {
                        badgeStyle = isCurrent
                          ? 'bg-neutral-800/60 text-neutral-600 border-neutral-700/50 opacity-40'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 opacity-40';
                      } else if (dbi === '0dbi') {
                        badgeStyle = isCurrent
                          ? 'bg-emerald-500 text-white font-bold border-emerald-400'
                          : 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300';
                        title = `Antenna ${slot.id}: 0 dBi`;
                      } else if (dbi === '6dbi') {
                        badgeStyle = isCurrent
                          ? 'bg-sky-400 text-neutral-900 font-bold border-sky-300'
                          : 'bg-sky-100 text-sky-900 font-bold border-sky-300';
                        title = `Antenna ${slot.id}: 6 dBi`;
                      } else if (dbi === '12dbi') {
                        badgeStyle = isCurrent
                          ? 'bg-amber-400 text-neutral-900 font-bold border-amber-300'
                          : 'bg-amber-100 text-amber-900 font-bold border-amber-300';
                        title = `Antenna ${slot.id}: 12 dBi`;
                      } else {
                        badgeStyle = isCurrent
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-600 border-dashed'
                          : 'bg-white text-neutral-500 border-neutral-300 border-dashed';
                        title = `Antenna ${slot.id}: Unset`;
                      }

                      return (
                        <span
                          key={slot.id}
                          title={title}
                          className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[10.5px] font-mono border transition-colors ${badgeStyle}`}
                        >
                          A{slot.id}
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end">
          <button
            id="btn-close-jump-cancel"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
