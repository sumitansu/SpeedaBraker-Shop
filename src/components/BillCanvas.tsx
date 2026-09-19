import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType, AppliedPromo } from '../types';
import {
  calculateTotalPrice,
  calculateRawTotalPrice,
  applyPsychologicalPricing,
  PRICING_CATALOG,
} from '../utils/pricing';
import { calculateDiscount, validatePromoCode } from '../utils/promoCodes';
import {
  Download,
  Check,
  Copy,
  Tag,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  PackageCheck,
} from 'lucide-react';

interface BillCanvasProps {
  upperBoxes: UpperBoxConfig[];
  slots: LowerSlotConfig[];
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>;
  customerCode: string;
  invoiceNumber: string;
  onDownloadInvoice: () => void;
  onPlaceOrder?: () => void;
  isPlacingOrder?: boolean;
  isRegistered?: boolean;
  appliedPromo: AppliedPromo | null;
  onApplyPromo: (promo: AppliedPromo) => void;
  onRemovePromo: () => void;
  dbVerificationStatus?: {
    checked: boolean;
    verified: boolean;
    message: string;
  } | null;
}

export const BillCanvas: React.FC<BillCanvasProps> = ({
  upperBoxes,
  slots,
  antennaDbiTypes,
  customerCode,
  invoiceNumber,
  onDownloadInvoice,
  onPlaceOrder,
  isPlacingOrder = false,
  isRegistered = false,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
  dbVerificationStatus,
}) => {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
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

  // Configured items total (with psychological charm pricing)
  const configuredSubtotal = calculateTotalPrice(upperBoxes, slots, antennaDbiTypes);

  // Mandatory modules cost (100% needed, standard hardware)
  const MANDATORY_MODULES_COST = PRICING_CATALOG.mandatoryModules;

  // Grand Total: sum unadjusted items + mandatory hardware, then apply psychological total - 1 pricing
  const rawGrandTotal =
    calculateRawTotalPrice(upperBoxes, slots, antennaDbiTypes) + MANDATORY_MODULES_COST;
  const grandTotal = applyPsychologicalPricing(rawGrandTotal);

  // Discount and Payable Total
  const { discountAmount, finalTotal } = calculateDiscount(grandTotal, appliedPromo);

  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) {
      setPromoError(t('bill.enterPromo', 'Please enter a promo code'));
      return;
    }
    setPromoError(null);
    setIsValidatingPromo(true);
    try {
      const result = await validatePromoCode(promoInput, grandTotal);
      if (result.valid && result.promo) {
        onApplyPromo(result.promo);
        setPromoInput('');
      } else {
        setPromoError(result.error || t('bill.invalidPromo', 'Invalid or unrecognized promo code'));
      }
    } catch {
      setPromoError(t('bill.promoError', 'Unable to validate promo code'));
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const invoiceDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const activeSlots = slots.filter((s) => s.value.toLowerCase() !== 'none');
  const hasAddons = displayVal === 'Yes' || wirelessVal === 'Yes';
  const versionPrice =
    versionVal === 'V1'
      ? PRICING_CATALOG.version.V1
      : versionVal === 'V2'
      ? PRICING_CATALOG.version.V2
      : 0;

  return (
    <motion.div
      id="bill-canvas-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex-1 w-full bg-neutral-100 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden flex justify-center items-start print:p-0 print:bg-white"
    >
      {/* Long, thin invoice slip with paper unfold entrance animation */}
      <motion.div
        id="invoice-paper"
        initial={{ y: -24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="w-full max-w-[420px] bg-white rounded-xl sm:rounded-2xl border border-neutral-200/90 shadow-md p-4 sm:p-5 text-neutral-900 mx-auto box-border print:max-w-none print:shadow-none print:border-none print:p-0 print:w-full relative"
      >
        {/* Invoice Header */}
        <div id="invoice-header" className="border-b border-dashed border-neutral-300 pb-3.5 mb-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <motion.span
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="h-6 w-6 rounded-md bg-neutral-900 flex items-center justify-center text-white font-black text-xs shadow-2xs"
            >
              S
            </motion.span>
            <h1 className="text-lg font-black tracking-tight text-neutral-900">
              {t('app.title', "Speedabraker's Shop")}
            </h1>
          </div>
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
            {t('bill.subtitle', 'Retail Hardware Bill & Invoice')}
          </p>

          <div className="mt-3 bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/70 text-left text-xs space-y-1">
            <div className="flex justify-between items-center gap-2">
              <span className="text-neutral-500 text-[11px] shrink-0">{t('bill.invoiceNo', 'Invoice No')}:</span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={copyInvoiceId}
                title={t('bill.clickCopy', 'Click to copy Invoice ID')}
                className="group flex items-center gap-1.5 font-mono font-bold text-neutral-900 text-[11px] hover:text-neutral-700 transition-all cursor-pointer bg-white px-2.5 py-0.5 rounded-lg border border-neutral-200 shadow-2xs"
              >
                <span>{invoiceNumber}</span>
                <AnimatePresence mode="wait" initial={false}>
                  {copiedId ? (
                    <motion.span
                      key="copied"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex"
                    >
                      <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700 shrink-0" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-neutral-500">{t('bill.date', 'Date')}:</span>
              <span className="font-medium text-neutral-800">{invoiceDate}</span>
            </div>

            {/* Firebase Database Status Badge */}
            <div className="pt-1 mt-1 border-t border-neutral-200/60 flex items-center justify-between">
              <span className="text-neutral-500 text-[10px]">{t('bill.database', 'Database')}:</span>
              {isRegistered || (dbVerificationStatus?.checked && dbVerificationStatus.verified) ? (
                <motion.span
                  key="verified"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shadow-2xs"
                >
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{t('bill.verifiedDb', 'Verified in Firebase')}</span>
                </motion.span>
              ) : (
                <motion.span
                  key="unregistered"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shadow-2xs"
                >
                  <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />
                  <span>{t('bill.unregisteredDb', 'Unregistered Invoice')}</span>
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Categories & Simple Price List */}
        <div id="invoice-items-list" className="space-y-4 text-xs">
          {/* Category: Base Hardware */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-1.5"
          >
            <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              {t('bill.baseHardware', 'Base Hardware')}
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-neutral-900 leading-snug">{t('bill.coreKit', 'Core Modules Kit')}</p>
                  <p className="text-[10px] text-neutral-500">{t('bill.coreKitDesc', 'Mandatory power regulator & bus controller')}</p>
                </div>
                <span className="font-mono font-bold text-neutral-900 shrink-0">₹{applyPsychologicalPricing(MANDATORY_MODULES_COST)}</span>
              </div>

              <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-neutral-900 leading-snug">
                    {t('bill.firmwareSystem', 'Firmware System')} ({versionVal})
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {versionVal === 'V1'
                      ? t('bill.v1Desc', 'V1 Base (Dual antenna limit)')
                      : versionVal === 'V2'
                      ? t('bill.v2Desc', 'V2 Advanced (Quad antenna support)')
                      : t('bill.stdDesc', 'Standard Base')}
                  </p>
                </div>
                <span className="font-mono font-bold text-neutral-900 shrink-0">₹{applyPsychologicalPricing(versionPrice)}</span>
              </div>
            </div>
          </motion.div>

          {/* Category: Add-on Modules (only if user selected any add-ons) */}
          {hasAddons && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="space-y-1.5"
            >
              <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {t('bill.addons', 'Add-on Modules')}
              </h2>
              <div className="space-y-1.5">
                {displayVal === 'Yes' && (
                  <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-neutral-900 leading-snug">{t('bill.oledTitle', '0.96" OLED Display')}</p>
                      <p className="text-[10px] text-neutral-500">{t('bill.oledDesc', 'Monochrome status & mode screen')}</p>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 shrink-0">
                      ₹{applyPsychologicalPricing(PRICING_CATALOG.display.Yes)}
                    </span>
                  </div>
                )}

                {wirelessVal === 'Yes' && (
                  <div className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-neutral-900 leading-snug">{t('bill.wifiTitle', '5GHz Wi-Fi Controller')}</p>
                      <p className="text-[10px] text-neutral-500">{t('bill.wifiDesc', 'High-speed wireless web interface')}</p>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 shrink-0">
                      ₹{applyPsychologicalPricing(PRICING_CATALOG.wireless.Yes)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Category: Antenna Channels (only if active antennas exist) */}
          {activeSlots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="space-y-1.5"
            >
              <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {t('bill.antennaChannels', 'Antenna Channels')} ({activeSlots.length})
              </h2>
              <div className="space-y-1.5">
                {activeSlots.map((slot) => {
                  const quality = slot.value.toLowerCase();
                  const dbi = antennaDbiTypes[slot.id];
                  const baseCost = PRICING_CATALOG.antenna.baseSocket;
                  const qualityCost =
                    quality === 'normal'
                      ? PRICING_CATALOG.antenna.quality.Normal
                      : quality === 'powerful'
                      ? PRICING_CATALOG.antenna.quality.Powerful
                      : 0;
                  const dbiCost =
                    dbi && dbi in PRICING_CATALOG.antenna.dbi
                      ? PRICING_CATALOG.antenna.dbi[dbi]
                      : 0;
                  const slotTotal = baseCost + qualityCost + dbiCost;
                  const dbiLabel =
                    dbi === '0dbi' ? '0 dBi' : dbi === '6dbi' ? '6 dBi' : dbi === '12dbi' ? '12 dBi' : '0 dBi';

                  return (
                    <div key={slot.id} className="flex justify-between items-start gap-2 py-1 border-b border-neutral-100">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-neutral-900 leading-snug">
                          {t('bill.channelSlot', { defaultValue: 'Channel #{{id}} ({{quality}} Quality)', id: slot.id, quality: slot.value })}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          {t('bill.mount', 'Mount')} (₹{applyPsychologicalPricing(baseCost)}) + {t('bill.module', 'Module')} (₹{applyPsychologicalPricing(qualityCost)}) + {dbiLabel} (₹{applyPsychologicalPricing(dbiCost)})
                        </p>
                      </div>
                      <span className="font-mono font-bold text-neutral-900 shrink-0">₹{applyPsychologicalPricing(slotTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Promo Code Input & Active Discount Bar (Hidden in Print) */}
        <div id="promo-code-section" className="border-t border-neutral-200 mt-4 pt-3 print:hidden">
          <AnimatePresence mode="wait">
            {appliedPromo ? (
              <motion.div
                key="applied-promo-bar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-900 min-w-0">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-emerald-800">{appliedPromo.code}</span>
                    <span className="text-emerald-700 ml-1">({appliedPromo.label})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-xs text-emerald-800">
                    -₹{discountAmount}
                  </span>
                  <motion.button
                    type="button"
                    id="remove-promo-btn"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onRemovePromo}
                    className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={t('bill.removePromo', 'Remove promo code')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="promo-input-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleApplyPromo}
                className="space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="promo-code-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        if (promoError) setPromoError(null);
                      }}
                      placeholder={t('bill.enterPromo', 'Enter promo code')}
                      disabled={isValidatingPromo}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all disabled:opacity-50"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    id="apply-promo-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isValidatingPromo || !promoInput.trim()}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                  >
                    {isValidatingPromo ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t('bill.checking', 'Checking...')}</span>
                      </>
                    ) : (
                      <span>{t('bill.apply', 'Apply')}</span>
                    )}
                  </motion.button>
                </div>
                {promoError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 flex items-center gap-1 font-medium pl-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {promoError}
                  </motion.p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Totals & Clear Summary */}
        <div id="invoice-totals-section" className="border-t-2 border-neutral-900 mt-3 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>{t('bill.subtotal', 'Items Subtotal')}:</span>
            <span className="font-mono font-semibold text-neutral-800">₹{grandTotal}</span>
          </div>

          {appliedPromo && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                {t('bill.discount', 'Discount')} ({appliedPromo.label}):
              </span>
              <span className="font-mono font-bold">-₹{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-1 border-t border-dashed border-neutral-300">
            <span className="font-black text-sm text-neutral-900">{t('bill.totalPayable', 'Total Payable')}</span>
            <motion.span
              key={finalTotal}
              initial={{ scale: 1.18, color: '#059669' }}
              animate={{ scale: 1, color: '#171717' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="font-mono font-black text-xl text-neutral-900"
            >
              ₹{finalTotal}
            </motion.span>
          </div>

          {/* Simple, single statutory statement */}
          <div className="pt-2.5 border-t border-neutral-200 text-center text-[11px] font-medium text-neutral-500">
            {t('bill.taxIncluded', 'All tax and GST included')}
          </div>
        </div>

        {/* In-Bill Action Button (Place Order -> Download .sbs when registered) */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col items-center gap-1.5 print:hidden">
          {isRegistered ? (
            <motion.button
              id="btn-download-sbs"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              }`}
              title={t('bill.downloadTitle', 'Click to download registered .sbs invoice, hold to copy Invoice ID')}
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{t('bill.copied', 'Invoice ID Copied!')}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('bill.downloadInvoice', 'Download Invoice (.sbs)')}</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              id="btn-place-order"
              type="button"
              disabled={isPlacingOrder}
              whileHover={{ scale: isPlacingOrder ? 1 : 1.02 }}
              whileTap={{ scale: isPlacingOrder ? 1 : 0.98 }}
              onClick={onPlaceOrder}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98 bg-neutral-900 hover:bg-black text-white shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              title={t('bill.placeOrderTitle', 'Click to place order and register invoice in database')}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>{t('bill.placingOrder', 'Placing Order & Registering...')}</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('bill.placeOrder', 'Place Order')}</span>
                </>
              )}
            </motion.button>
          )}
          <span className="text-[10px] text-neutral-400">
            {isRegistered
              ? t('bill.downloadHint', 'Invoice registered in database • Click to save .sbs file')
              : t('bill.placeOrderHint', 'Click to register invoice in database & place order')}
          </span>
        </div>

        {/* Simple Footer */}
        <div id="invoice-footer" className="mt-3 pt-2 border-t border-neutral-100 text-center text-[10px] text-neutral-400">
          <p>© {new Date().getFullYear()} Speedabraker's Shop. All rights reserved.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

