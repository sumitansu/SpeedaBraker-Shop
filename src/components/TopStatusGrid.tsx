import React from 'react';
import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../types';
import { getBoxBorderStyle } from '../utils/pricing';

interface TopStatusGridProps {
  upperBoxes: UpperBoxConfig[];
  slots: LowerSlotConfig[];
  antennaDbiTypes?: Record<number, AntennaDbiType | undefined>;
  onToggleUpperBox: (id: string) => void;
  onToggleSlot: (id: number) => void;
  animatedPrice: number;
  priceDiff: number | null;
  priceDirection: 'up' | 'down' | 'idle';
}

export const TopStatusGrid: React.FC<TopStatusGridProps> = ({
  upperBoxes,
  slots,
  antennaDbiTypes,
  onToggleUpperBox,
  onToggleSlot,
  animatedPrice,
  priceDiff,
  priceDirection,
}) => {
  return (
    <section
      id="top-one-third-canvas"
      className="shrink-0 w-full flex flex-col p-2.5 sm:p-3 md:p-4 bg-white/90"
    >
      {/* Upper Part of Top (3 equal horizontal boxes: Version, Display, Wireless) */}
      <div
        id="upper-part-grid"
        className="w-full grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 mb-2 sm:mb-2.5"
      >
        {upperBoxes.map((box, index) => (
          <div
            key={box.id}
            id={`upper-box-container-${index + 1}`}
            className="flex items-center justify-center min-w-0"
          >
            <div
              id={`upper-rounded-box-${index + 1}`}
              onClick={() => onToggleUpperBox(box.id)}
              title={`Click to toggle ${box.label} status`}
              className={`w-full py-1.5 sm:py-2 rounded-xl ${getBoxBorderStyle(
                box.label,
                box.value
              )} px-2.5 sm:px-4 md:px-5 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 shadow-xs cursor-pointer transition-all hover:brightness-95`}
            >
              {/* Left Side Text */}
              <span className="text-xs sm:text-sm md:text-base font-bold text-neutral-800 tracking-tight truncate">
                {box.label}
              </span>

              {/* Right Side Smaller Darker Box */}
              <div
                id={`upper-dark-box-${index + 1}`}
                className="bg-neutral-900 text-white text-[11px] sm:text-xs md:text-sm font-mono font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-xs flex items-center justify-center shrink-0 min-w-[2rem] sm:min-w-[2.6rem]"
              >
                {box.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Part of Top (4 Antenna boxes + Total Price Display) */}
      <div
        id="lower-part-grid"
        className="w-full grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4"
      >
        {/* 2/3 horizontal way: 4 standalone antenna boxes arranged in a 2x2 grid */}
        <div
          id="antenna-boxes-grid"
          className="col-span-2 grid grid-cols-2 grid-rows-2 gap-1.5 sm:gap-2.5 min-w-0"
        >
          {slots.map((slot) => {
            const dbi = antennaDbiTypes ? antennaDbiTypes[slot.id] : undefined;
            const displayDbi = dbi ? `${dbi.replace('dbi', '')} dbi` : '- dbi';

            return (
              <div
                key={slot.id}
                id={`antenna-box-slot-${slot.id}`}
                onClick={() => onToggleSlot(slot.id)}
                title={`Click to customize Antenna ${slot.id}`}
                className={`w-full rounded-xl ${getBoxBorderStyle(
                  slot.label,
                  slot.value
                )} flex flex-col justify-between p-1.5 sm:p-2 md:p-2.5 text-left min-w-0 shadow-xs cursor-pointer transition-all hover:brightness-95 overflow-hidden`}
              >
                {/* Top part: Antenna */}
                <span className="text-xs sm:text-sm md:text-base font-bold text-neutral-800 tracking-tight truncate">
                  {slot.label}
                </span>

                {/* Bottom row: Antenna number & dBi on left, full status badge on right */}
                <div className="flex items-center justify-between gap-1 mt-0.5 sm:mt-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
                    <span
                      id={`antenna-slot-num-${slot.id}`}
                      className="text-xs sm:text-sm md:text-base font-mono font-bold text-neutral-900 shrink-0"
                    >
                      {slot.id}
                    </span>
                    <span
                      id={`antenna-slot-divider-${slot.id}`}
                      className="text-neutral-300 font-normal select-none text-[10px] sm:text-xs shrink-0"
                    >
                      |
                    </span>
                    <span
                      id={`antenna-slot-dbi-${slot.id}`}
                      className="text-[9px] sm:text-[11px] md:text-xs font-mono font-semibold text-neutral-600 shrink-0 whitespace-nowrap"
                    >
                      {displayDbi}
                    </span>
                  </div>
                  <div className="bg-neutral-900 text-white font-mono font-bold text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-2xs flex items-center justify-center shrink-0 tracking-tight">
                    {slot.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest on right (1/3 horizontal way) has the clean, big price display without a box */}
        <div
          id="price-display-container"
          className="col-span-1 flex flex-col items-center justify-center min-w-0 px-1 sm:px-3"
        >
          <div
            id="total-price-display"
            className="w-full h-full flex flex-col items-center justify-center text-center select-text relative"
          >
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                Total
              </span>
              {priceDiff !== null && priceDiff !== 0 && (
                <span
                  id="price-delta-badge"
                  className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded-md transition-all animate-in fade-in zoom-in-75 duration-150 ${
                    priceDiff > 0
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300/80'
                      : 'bg-red-100 text-red-600 border border-red-300/80'
                  }`}
                >
                  {priceDiff > 0 ? `+₹${priceDiff}` : `-₹${Math.abs(priceDiff)}`}
                </span>
              )}
            </div>
            <div
              className={`flex items-baseline justify-center font-mono tracking-tight font-extrabold transition-colors duration-200 ${
                priceDirection === 'up'
                  ? 'text-emerald-600'
                  : priceDirection === 'down'
                  ? 'text-red-500'
                  : 'text-neutral-900'
              }`}
            >
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mr-0.5">
                ₹
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black truncate max-w-full">
                {animatedPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
