import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../types';
import { calculateTotalPrice } from '../utils/pricing';
import { Download, Check, Copy } from 'lucide-react';

interface BillCanvasProps {
  upperBoxes: UpperBoxConfig[];
  slots: LowerSlotConfig[];
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>;
  customerCode: string;
  invoiceNumber: string;
  onDownloadInvoice: () => void;
}

export const BillCanvas: React.FC<BillCanvasProps> = ({
  upperBoxes,
  slots,
  antennaDbiTypes,
  invoiceNumber,
  onDownloadInvoice,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const preventClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copyInvoiceId = () => {
    if (invoiceNumber && navigator.clipboard) {
      navigator.clipboard.writeText(invoiceNumber).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = invoiceNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    }
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2200);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isLongPressRef.current = false;
    preventClickRef.current = false;
    setIsPressing(true);

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      preventClickRef.current = true;
      setIsPressing(false);
      copyInvoiceId();
    }, 500);
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPressRef.current) {
      onDownloadInvoice();
    }
    isLongPressRef.current = false;
  };

  const handlePointerCancel = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isLongPressRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (preventClickRef.current) {
      e.preventDefault();
      preventClickRef.current = false;
    }
  };

  const versionVal = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || 'None';
  const displayVal = upperBoxes.find((b) => b.label.toLowerCase() === 'display')?.value || 'None';
  const wirelessVal = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value || 'None';

  // Configured items total
  const configuredSubtotal = calculateTotalPrice(upperBoxes, slots, antennaDbiTypes);

  // Mandatory modules cost (100% needed, standard hardware)
  const MANDATORY_MODULES_COST = 500;

  // Grand Total
  const grandTotal = configuredSubtotal + MANDATORY_MODULES_COST;

  const invoiceDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const activeSlots = slots.filter((s) => s.value.toLowerCase() !== 'none');
  const hasAddons = displayVal === 'Yes' || wirelessVal === 'Yes';
  const versionPrice = versionVal === 'V1' ? 100 : versionVal === 'V2' ? 300 : 0;

  return (
    <div
      id="bill-canvas-container"
      className="flex-1 w-full bg-neutral-100 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden flex justify-center items-start print:p-0 print:bg-white"
    >
      {/* Long, thin invoice slip matching device width with maximum width cap */}
      <div
        id="invoice-paper"
        className="w-full max-w-[420px] bg-white rounded-xl sm:rounded-2xl border border-neutral-200/90 shadow-sm p-4 sm:p-5 text-neutral-900 mx-auto box-border print:max-w-none print:shadow-none print:border-none print:p-0 print:w-full"
      >
        {/* Invoice Header */}
        <div id="invoice-header" className="border-b border-dashed border-neutral-300 pb-3.5 mb-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="h-6 w-6 rounded-md bg-neutral-900 flex items-center justify-center text-white font-black text-xs">
              S
            </span>
            <h1 className="text-lg font-black tracking-tight text-neutral-900">
              Speedabraker's Shop
            </h1>
          </div>
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
            Retail Hardware Bill & Invoice
          </p>

          <div className="mt-3 bg-neutral-50 rounded-lg p-2.5 border border-neutral-200/70 text-left text-xs space-y-1">
            <div className="flex justify-between items-center gap-2">
              <span className="text-neutral-500 text-[11px] shrink-0">Invoice No:</span>
              <button
                type="button"
                onClick={copyInvoiceId}
                title="Click to copy Invoice ID"
                className="group flex items-center gap-1.5 font-mono font-bold text-neutral-900 text-[11px] hover:text-neutral-700 active:scale-98 transition-all cursor-pointer bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-2xs"
              >
                <span>{invoiceNumber}</span>
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700 shrink-0" />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-neutral-500">Date:</span>
              <span className="font-medium text-neutral-800">{invoiceDate}</span>
            </div>
          </div>
        </div>

        {/* Itemized Categories & Simple Price List */}
        <div id="invoice-items-list" className="space-y-4 text-xs">
          {/* Category: Base Hardware */}
          <div className="space-y-1.5">
            <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Base Hardware
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-neutral-900 leading-snug">Core Modules Kit</p>
                  <p className="text-[10px] text-neutral-500">Mandatory power regulator & bus controller</p>
                </div>
                <span className="font-mono font-bold text-neutral-900 shrink-0">₹{MANDATORY_MODULES_COST}</span>
              </div>

              <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-neutral-900 leading-snug">
                    Firmware System ({versionVal})
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {versionVal === 'V1'
                      ? 'V1 Base (Dual antenna limit)'
                      : versionVal === 'V2'
                      ? 'V2 Advanced (Quad antenna support)'
                      : 'Standard Base'}
                  </p>
                </div>
                <span className="font-mono font-bold text-neutral-900 shrink-0">₹{versionPrice}</span>
              </div>
            </div>
          </div>

          {/* Category: Add-on Modules (only if user selected any add-ons) */}
          {hasAddons && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Add-on Modules
              </h2>
              <div className="space-y-1.5">
                {displayVal === 'Yes' && (
                  <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-neutral-900 leading-snug">0.96" OLED Display</p>
                      <p className="text-[10px] text-neutral-500">Monochrome status & mode screen</p>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 shrink-0">₹300</span>
                  </div>
                )}

                {wirelessVal === 'Yes' && (
                  <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-neutral-900 leading-snug">5GHz Wi-Fi Controller</p>
                      <p className="text-[10px] text-neutral-500">High-speed wireless web interface</p>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 shrink-0">₹700</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category: Antenna Channels (only if active antennas exist) */}
          {activeSlots.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Antenna Channels ({activeSlots.length})
              </h2>
              <div className="space-y-1.5">
                {activeSlots.map((slot) => {
                  const quality = slot.value.toLowerCase();
                  const dbi = antennaDbiTypes[slot.id];
                  const baseCost = 50;
                  const qualityCost = quality === 'normal' ? 200 : quality === 'powerful' ? 700 : 0;
                  const dbiCost = dbi === '0dbi' ? 100 : dbi === '6dbi' ? 150 : dbi === '12dbi' ? 450 : 0;
                  const slotTotal = baseCost + qualityCost + dbiCost;
                  const dbiLabel = dbi === '0dbi' ? '0 dBi' : dbi === '6dbi' ? '6 dBi' : dbi === '12dbi' ? '12 dBi' : '0 dBi';

                  return (
                    <div key={slot.id} className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-neutral-900 leading-snug">
                          Channel #{slot.id} ({slot.value} Quality)
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          Mount (₹50) + Module (₹{qualityCost}) + {dbiLabel} (₹{dbiCost})
                        </p>
                      </div>
                      <span className="font-mono font-bold text-neutral-900 shrink-0">₹{slotTotal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Totals & Clear Summary */}
        <div id="invoice-totals-section" className="border-t-2 border-neutral-900 mt-4 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Items Subtotal:</span>
            <span className="font-mono font-semibold text-neutral-800">₹{grandTotal}</span>
          </div>

          <div className="flex justify-between items-baseline pt-1 border-t border-dashed border-neutral-300">
            <span className="font-black text-sm text-neutral-900">Total Payable</span>
            <span className="font-mono font-black text-xl text-neutral-900">
              ₹{grandTotal}
            </span>
          </div>

          {/* Simple, single statutory statement */}
          <div className="pt-2.5 border-t border-neutral-200 text-center text-[11px] font-medium text-neutral-500">
            All tax and GST included
          </div>
        </div>

        {/* In-Bill Download Button */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col items-center gap-1.5 print:hidden">
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerCancel}
            onPointerCancel={handlePointerCancel}
            onClick={handleClick}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98 ${
              copiedId
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/40'
                : isPressing
                ? 'bg-neutral-800 text-neutral-200 scale-98 ring-2 ring-neutral-400/50'
                : 'bg-neutral-900 hover:bg-black text-white shadow-xs'
            }`}
            title="Click to download .sbs invoice, hold to copy Invoice ID"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Invoice ID Copied!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Download Invoice (.sbs)</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-neutral-400">
            Click to save .sbs file • Press & hold to copy ID
          </span>
        </div>

        {/* Simple Footer */}
        <div id="invoice-footer" className="mt-3 pt-2 border-t border-neutral-100 text-center text-[10px] text-neutral-400">
          <p>© {new Date().getFullYear()} Speedabraker's Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
