import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <motion.div
      id="jump-question-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <motion.div
        id="jump-question-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 max-w-sm sm:max-w-md w-full max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-neutral-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {t('modals.jump.title', 'Jump to Question')}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t('modals.jump.subtitle', 'Choose any question to jump directly to it')}
            </p>
          </div>
          <motion.button
            id="btn-close-jump-modal"
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title={t('common.close', 'Close')}
          >
            <X className="w-4 h-4" />
          </motion.button>
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
                  const ver = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || currentVersion;
                  const activeCount = slots.filter((s) => s.value.toLowerCase() !== 'none').length;
                  if (ver === 'V1') {
                    // V1 strictly requires exactly 2 antennas (slots 1 & 2 only)
                    const slots3or4Active = slots.some((s) => (s.id === 3 || s.id === 4) && s.value.toLowerCase() !== 'none');
                    return activeCount === 2 && !slots3or4Active;
                  }
                  return activeCount > 0;
                }
                case 'quality': {
                  const ver = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || currentVersion;
                  const active = slots.filter((s) => s.value.toLowerCase() !== 'none');
                  if (ver === 'V1') {
                    const hasInvalidSlots = slots.some((s) => (s.id === 3 || s.id === 4) && s.value.toLowerCase() !== 'none');
                    if (active.length !== 2 || hasInvalidSlots) return false;
                  }
                  return active.length > 0 && active.every((s) => s.value === 'Normal' || s.value === 'Powerful');
                }
                case 'type': {
                  const ver = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || currentVersion;
                  const active = slots.filter((s) => s.value.toLowerCase() !== 'none');
                  const dbi = antennaDbiTypes || {};
                  if (ver === 'V1') {
                    const hasInvalidSlots = slots.some((s) => (s.id === 3 || s.id === 4) && s.value.toLowerCase() !== 'none');
                    if (active.length !== 2 || hasInvalidSlots) return false;
                  }
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
              if (firstUnansweredPrevStep.id === 'firmware') lockReason = t('modals.jump.lockFirmware', 'Select Firmware First');
              else if (firstUnansweredPrevStep.id === 'antennas') lockReason = t('modals.jump.lockAntennas', 'Select Antennas First');
              else if (firstUnansweredPrevStep.id === 'quality') lockReason = t('modals.jump.lockQuality', 'Configure Quality First');
              else lockReason = t('modals.jump.lockGeneric', { defaultValue: 'Answer {{name}} First', name: firstUnansweredPrevStep.name });
            }
            return (
              <motion.button
                key={step.id}
                id={`btn-jump-step-${step.id}`}
                type="button"
                disabled={isLocked}
                whileHover={!isLocked ? { scale: 1.01 } : undefined}
                whileTap={!isLocked ? { scale: 0.98 } : undefined}
                onClick={() => {
                  if (isLocked) return;
                  onSelectStep(step.id);
                  onClose();
                }}
                className={`w-full p-2.5 sm:p-3 rounded-xl border text-left transition-colors flex flex-col justify-between select-none ${
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
                      {t(`steps.${step.id}.name`, step.name)}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-neutral-800 text-neutral-200 rounded">
                        {t('common.current', 'Current')}
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
                  {t(`steps.${step.id}.description`, step.description)}
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
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end">
          <motion.button
            id="btn-close-jump-cancel"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            {t('common.close', 'Close')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

