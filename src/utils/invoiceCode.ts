import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType, AppliedPromo } from '../types';
import {
  calculateTotalPrice,
  calculateRawTotalPrice,
  applyPsychologicalPricing,
  PRICING_CATALOG,
} from './pricing';
import {
  calculateDiscount,
  extractPromoTierFromCustomerCode,
  extractBaseCustomerCode,
  getPromoDetailsByTier,
} from './promoCodes';

/**
 * Ultra-compact deterministic item code generator.
 * Encodes all configuration options into a 3-character Base36 string.
 *
 * Space calculation:
 * - Version: None (0), V1 (1), V2 (2) -> 3 states
 * - Display: No (0), Yes (1) -> 2 states
 * - Wireless: No (0), Yes (1) -> 2 states
 * - Slots 1 to 4: Each slot has 7 mutually exclusive states (0 to 6):
 *     0 = Unconfigured / None
 *     1 = Normal 0 dBi
 *     2 = Normal 6 dBi
 *     3 = Normal 12 dBi
 *     4 = Powerful 0 dBi
 *     5 = Powerful 6 dBi
 *     6 = Powerful 12 dBi
 * Total possibilities: 3 * 2 * 2 * (7 ^ 4) = 28,812 configurations.
 * 28,812 <= 36^3 (46,656) -> perfectly fits into 3 Base36 characters!
 *
 * Two users buying the same items will get the EXACT same code.
 * Any difference produces a unique different code.
 */
export function generateBoughtItemCode(
  upperBoxes: UpperBoxConfig[],
  slots: LowerSlotConfig[],
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>
): string {
  const versionVal = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || 'None';
  const displayVal = upperBoxes.find((b) => b.label.toLowerCase() === 'display')?.value || 'None';
  const wirelessVal = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value || 'None';

  // Version: 0 = None, 1 = V1, 2 = V2
  const v = versionVal === 'V1' ? 1 : versionVal === 'V2' ? 2 : 0;
  // Display: 0 = No/None, 1 = Yes
  const d = displayVal === 'Yes' ? 1 : 0;
  // Wireless: 0 = No/None, 1 = Yes
  const w = wirelessVal === 'Yes' ? 1 : 0;

  // Slot states: 0 to 6
  const getSlotState = (slotId: number): number => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.value.toLowerCase() === 'none') return 0;
    const isPowerful = slot.value.toLowerCase() === 'powerful';
    const rawDbi = antennaDbiTypes[slotId];
    const dbi = rawDbi ? rawDbi.toLowerCase().replace(/\s+/g, '') : '';
    let dbiOffset = 0;
    if (dbi === '6dbi') dbiOffset = 1;
    else if (dbi === '12dbi') dbiOffset = 2;

    return (isPowerful ? 4 : 1) + dbiOffset;
  };

  const s1 = getSlotState(1);
  const s2 = getSlotState(2);
  const s3 = getSlotState(3);
  const s4 = getSlotState(4);

  // Pack into a single compact integer (0 .. 28811)
  let intVal = v;
  intVal = intVal * 2 + d;
  intVal = intVal * 2 + w;
  intVal = intVal * 7 + s1;
  intVal = intVal * 7 + s2;
  intVal = intVal * 7 + s3;
  intVal = intVal * 7 + s4;

  // Encode as 3 uppercase Base-36 characters (e.g., "000" to "M8B")
  return intVal.toString(36).toUpperCase().padStart(3, '0');
}

/**
 * Decodes the 3-character compact item code back to the exact items combination.
 */
export function decodeBoughtItemCode(code: string): {
  version: 'None' | 'V1' | 'V2';
  display: boolean;
  wireless: boolean;
  slots: { slotId: number; active: boolean; quality?: 'normal' | 'powerful'; dbi?: AntennaDbiType }[];
} {
  let intVal = parseInt(code, 36);
  if (isNaN(intVal)) intVal = 0;

  const s4 = intVal % 7; intVal = Math.floor(intVal / 7);
  const s3 = intVal % 7; intVal = Math.floor(intVal / 7);
  const s2 = intVal % 7; intVal = Math.floor(intVal / 7);
  const s1 = intVal % 7; intVal = Math.floor(intVal / 7);
  const w = intVal % 2; intVal = Math.floor(intVal / 2);
  const d = intVal % 2; intVal = Math.floor(intVal / 2);
  const v = intVal % 3;

  const parseSlotState = (slotId: number, state: number) => {
    if (state === 0) return { slotId, active: false };
    const quality: 'normal' | 'powerful' = state >= 4 ? 'powerful' : 'normal';
    const dbiOffset = state >= 4 ? state - 4 : state - 1;
    const dbi: AntennaDbiType = dbiOffset === 1 ? '6dbi' : dbiOffset === 2 ? '12dbi' : '0dbi';
    return { slotId, active: true, quality, dbi };
  };

  return {
    version: v === 1 ? 'V1' : v === 2 ? 'V2' : 'None',
    display: d === 1,
    wireless: w === 1,
    slots: [
      parseSlotState(1, s1),
      parseSlotState(2, s2),
      parseSlotState(3, s3),
      parseSlotState(4, s4),
    ],
  };
}

/**
 * Generates a random customer order code that varies for each order.
 * Example: 7X9K2M (6 random alphanumeric uppercase characters)
 */
export function generateRandomCustomerCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // non-ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Constructs the full invoice number according to specification:
 * SBS-<unique compact item code>-<unique random customer code>
 * Example: SBS-7KF-8K2X4P
 */
export function generateInvoiceNumber(
  upperBoxes: UpperBoxConfig[],
  slots: LowerSlotConfig[],
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>,
  customerCode: string
): string {
  const itemCode = generateBoughtItemCode(upperBoxes, slots, antennaDbiTypes);
  return `SBS-${itemCode}-${customerCode}`;
}

/**
 * Builds the comprehensive order details object containing every detail about the order.
 */
export function generateOrderDetailsJson(
  upperBoxes: UpperBoxConfig[],
  slots: LowerSlotConfig[],
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>,
  customerCode: string,
  invoiceNumber: string,
  appliedPromo?: AppliedPromo | null,
  verificationHash?: string | null
) {
  const versionVal = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || 'None';
  const displayVal = upperBoxes.find((b) => b.label.toLowerCase() === 'display')?.value || 'None';
  const wirelessVal = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value || 'None';

  const itemCode = generateBoughtItemCode(upperBoxes, slots, antennaDbiTypes);
  const MANDATORY_MODULES_COST = PRICING_CATALOG.mandatoryModules;
  const configuredSubtotal = calculateTotalPrice(upperBoxes, slots, antennaDbiTypes);
  const rawGrandTotal =
    calculateRawTotalPrice(upperBoxes, slots, antennaDbiTypes) + MANDATORY_MODULES_COST;
  const grandTotal = applyPsychologicalPricing(rawGrandTotal);
  const { discountAmount, finalTotal } = calculateDiscount(grandTotal, appliedPromo || null);
  const baseCustomerCode = extractBaseCustomerCode(customerCode);
  const promoTier = extractPromoTierFromCustomerCode(customerCode);

  const versionPrice =
    versionVal === 'V1'
      ? PRICING_CATALOG.version.V1
      : versionVal === 'V2'
      ? PRICING_CATALOG.version.V2
      : 0;
  const displayPrice = displayVal === 'Yes' ? PRICING_CATALOG.display.Yes : 0;
  const wirelessPrice = wirelessVal === 'Yes' ? PRICING_CATALOG.wireless.Yes : 0;

  const activeSlots = slots.filter((s) => s.value.toLowerCase() !== 'none');
  const antennaDetails = activeSlots.map((slot) => {
    const isPowerful = slot.value.toLowerCase() === 'powerful';
    const dbi = antennaDbiTypes[slot.id] || '0dbi';
    const socketMountCost = PRICING_CATALOG.antenna.baseSocket;
    const qualityModuleCost = isPowerful
      ? PRICING_CATALOG.antenna.quality.Powerful
      : PRICING_CATALOG.antenna.quality.Normal;
    const dbiRadiatorCost = PRICING_CATALOG.antenna.dbi[dbi as keyof typeof PRICING_CATALOG.antenna.dbi] || 0;
    const channelTotal = socketMountCost + qualityModuleCost + dbiRadiatorCost;

    return {
      channelSlotId: slot.id,
      qualityModule: slot.value,
      radiatorGain: dbi,
      costBreakdown: {
        socketMount: socketMountCost,
        qualityModule: qualityModuleCost,
        radiatorGain: dbiRadiatorCost,
      },
      channelSubtotal: channelTotal,
    };
  });

  const antennasSubtotal = antennaDetails.reduce((sum, a) => sum + a.channelSubtotal, 0);

  return {
    fileFormat: "Speedabraker's Shop Order Specification",
    formatVersion: '1.0',
    fileExtension: '.sbs',
    exportedAt: new Date().toISOString(),
    invoice: {
      invoiceNumber,
      itemCode,
      customerCode,
      baseCustomerCode,
      promoTier: promoTier || (appliedPromo ? appliedPromo.tierId : null),
      verificationHash: verificationHash || undefined,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      currency: 'INR',
      currencySymbol: '₹',
    },
    verificationHash: verificationHash || undefined,
    promoDiscount: appliedPromo
      ? {
          applied: true,
          label: appliedPromo.label,
          tierId: appliedPromo.tierId,
          type: appliedPromo.type,
          value: appliedPromo.value,
          discountAmount,
        }
      : {
          applied: false,
          discountAmount: 0,
        },
    items: {
      baseHardware: {
        mandatoryCoreModules: {
          name: 'Core Modules Kit',
          description: 'Mandatory power regulator & bus controller',
          required: true,
          price: MANDATORY_MODULES_COST,
        },
        firmware: {
          name: 'Firmware System',
          selectedVersion: versionVal,
          price: versionPrice,
          specifications:
            versionVal === 'V1'
              ? 'V1 Base (Dual antenna limit)'
              : versionVal === 'V2'
              ? 'V2 Advanced (Quad antenna support)'
              : 'Standard Base',
        },
      },
      addOns: {
        display: {
          name: '0.96" OLED Display',
          selected: displayVal === 'Yes',
          price: displayPrice,
          description: 'Monochrome status & mode screen',
        },
        wireless: {
          name: '5GHz Wi-Fi Controller',
          selected: wirelessVal === 'Yes',
          price: wirelessPrice,
          description: 'High-speed wireless web interface',
        },
      },
      antennas: {
        totalChannelsConfigured: activeSlots.length,
        channels: antennaDetails,
      },
    },
    pricingSummary: {
      mandatoryModulesSubtotal: MANDATORY_MODULES_COST,
      firmwareSubtotal: versionPrice,
      addOnsSubtotal: displayPrice + wirelessPrice,
      antennasSubtotal,
      itemsSubtotal: grandTotal,
      discountAmount,
      payableTotal: finalTotal,
      taxNote: 'All tax and GST included',
    },
    verificationDecodedSpec: decodeBoughtItemCode(itemCode),
  };
}

/**
 * Triggers client-side download of the custom order file with strict .sbs extension.
 * Using 'application/octet-stream' prevents Chromium/Chrome from auto-appending '.json'
 * to the filename, while preserving clean formatted JSON text inside the file.
 * Converting or renaming this .sbs file to .json will revert to standard JSON.
 */
export function downloadSbsFile(
  invoiceNumber: string,
  orderDetails: ReturnType<typeof generateOrderDetailsJson>
) {
  const jsonContent = JSON.stringify(orderDetails, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/octet-stream' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `${invoiceNumber}.sbs`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

export interface ParsedImportResult {
  type: 'invoice' | 'item_code';
  itemCode: string;
  customerCode?: string;
  invoiceNumber?: string;
  appliedPromo?: AppliedPromo | null;
}

/**
 * Normalizes an item code and checks if it's within the valid Base36 range (0..28811).
 */
function validateBase36ItemCode(codeCandidate: string): string | null {
  if (!codeCandidate) return null;
  const cleaned = codeCandidate.trim().toUpperCase();
  if (/^[0-9A-Z]{3}$/.test(cleaned)) {
    const val = parseInt(cleaned, 36);
    if (!isNaN(val) && val >= 0 && val <= 28811) {
      return cleaned;
    }
  }
  return null;
}

/**
 * Attempts to parse raw hardware specifications from a custom .sbs JSON object
 * and re-computes the corresponding 3-character item code.
 */
function parseHardwareSpecFromJson(obj: Record<string, any>): ParsedImportResult | null {
  if (!obj || typeof obj !== 'object') return null;

  // 1. Version extraction
  let rawVersion =
    obj.version ??
    obj.firmware ??
    obj.firmwareVersion ??
    obj.items?.baseHardware?.firmware?.selectedVersion ??
    obj.baseHardware?.firmware?.selectedVersion;

  let version: 'V1' | 'V2' | null = null;
  if (typeof rawVersion === 'string') {
    if (/V2/i.test(rawVersion)) version = 'V2';
    else if (/V1/i.test(rawVersion)) version = 'V1';
  } else if (rawVersion === 2) {
    version = 'V2';
  } else if (rawVersion === 1) {
    version = 'V1';
  }

  if (!version) return null;

  // 2. Display extraction
  const rawDisplay =
    obj.display ??
    obj.oled ??
    obj.items?.addOns?.display?.selected ??
    obj.addOns?.display?.selected;
  const isDisplay =
    rawDisplay === true ||
    rawDisplay === 1 ||
    rawDisplay === 'Yes' ||
    rawDisplay === 'yes' ||
    rawDisplay === 'true';

  // 3. Wireless extraction
  const rawWireless =
    obj.wireless ??
    obj.wifi ??
    obj.items?.addOns?.wireless?.selected ??
    obj.addOns?.wireless?.selected;
  const isWireless =
    rawWireless === true ||
    rawWireless === 1 ||
    rawWireless === 'Yes' ||
    rawWireless === 'yes' ||
    rawWireless === 'true';

  // 4. Slots / Channels extraction
  const rawChannels =
    obj.slots ??
    obj.antennas?.channels ??
    obj.items?.antennas?.channels ??
    obj.channels ??
    (Array.isArray(obj.antennas) ? obj.antennas : null);

  const upperBoxes: UpperBoxConfig[] = [
    { id: '1', label: 'Version', value: version },
    { id: '2', label: 'Display', value: isDisplay ? 'Yes' : 'No' },
    { id: '3', label: 'Wireless', value: isWireless ? 'Yes' : 'No' },
  ];

  const slots: LowerSlotConfig[] = [1, 2, 3, 4].map((id) => ({
    id,
    label: `Antenna ${id}`,
    value: 'None',
  }));

  const antennaDbiTypes: Record<number, AntennaDbiType | undefined> = {};

  if (Array.isArray(rawChannels)) {
    rawChannels.forEach((ch, idx) => {
      if (!ch || typeof ch !== 'object') return;
      const slotId = ch.channelSlotId ?? ch.slotId ?? ch.slot ?? ch.id ?? idx + 1;
      if (typeof slotId !== 'number' || slotId < 1 || slotId > 4) return;

      const qRaw = String(ch.qualityModule ?? ch.quality ?? ch.value ?? ch.type ?? '');
      const isPowerful = /powerful/i.test(qRaw);
      const isNormal = /normal/i.test(qRaw);
      const isNone = /none/i.test(qRaw) || (!isPowerful && !isNormal);

      if (!isNone) {
        const slotObj = slots.find((s) => s.id === slotId);
        if (slotObj) {
          slotObj.value = isPowerful ? 'Powerful' : 'Normal';
        }

        const dbiRaw = String(ch.radiatorGain ?? ch.dbi ?? ch.gain ?? ch.dBi ?? '').toLowerCase();
        if (dbiRaw.includes('12')) {
          antennaDbiTypes[slotId] = '12dbi';
        } else if (dbiRaw.includes('6')) {
          antennaDbiTypes[slotId] = '6dbi';
        } else {
          antennaDbiTypes[slotId] = '0dbi';
        }
      }
    });
  } else if (obj.antennas && typeof obj.antennas === 'object' && !Array.isArray(obj.antennas)) {
    // Key-value object of antennas: e.g. { "1": { "quality": "Normal", "dbi": "0dbi" } }
    for (let slotId = 1; slotId <= 4; slotId++) {
      const ch = obj.antennas[slotId] || obj.antennas[`slot${slotId}`] || obj.antennas[`antenna${slotId}`];
      if (ch) {
        const qRaw = String(ch.qualityModule ?? ch.quality ?? ch.value ?? ch.type ?? '');
        const isPowerful = /powerful/i.test(qRaw);
        const isNormal = /normal/i.test(qRaw);
        if (isPowerful || isNormal) {
          const slotObj = slots.find((s) => s.id === slotId);
          if (slotObj) {
            slotObj.value = isPowerful ? 'Powerful' : 'Normal';
          }
          const dbiRaw = String(ch.radiatorGain ?? ch.dbi ?? ch.gain ?? '').toLowerCase();
          if (dbiRaw.includes('12')) antennaDbiTypes[slotId] = '12dbi';
          else if (dbiRaw.includes('6')) antennaDbiTypes[slotId] = '6dbi';
          else antennaDbiTypes[slotId] = '0dbi';
        }
      }
    }
  }

  try {
    const itemCode = generateBoughtItemCode(upperBoxes, slots, antennaDbiTypes);
    return {
      type: 'item_code',
      itemCode,
    };
  } catch {
    return null;
  }
}

/**
 * Parses raw text input (from clipboard, file upload, or manual entry) into either
 * an item configuration code or a full invoice ID.
 * Robust against custom .sbs JSON formats, BOM characters, markdown code fences, and text templates.
 */
export function parseImportInput(rawInput: string): ParsedImportResult | null {
  if (!rawInput) return null;
  let trimmed = rawInput.trim();
  if (!trimmed) return null;

  // 1. Strip UTF-8 BOM (\uFEFF) and zero-width spaces
  trimmed = trimmed.replace(/^[\uFEFF\u200B]+/, '').trim();

  // 2. Unwrap markdown code blocks if pasted as ```json ... ``` or ```sbs ... ```
  const codeBlockMatch = trimmed.match(/^```(?:json|sbs|text)?\s*([\s\S]*?)\s*```$/i);
  if (codeBlockMatch) {
    trimmed = codeBlockMatch[1].trim();
  }

  // 3. Try parsing JSON (supports standard .sbs, custom .sbs, and converted .json files)
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      // Remove JS comments if present (e.g. // or /* */)
      const sanitized = jsonCandidate
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');
      const parsed = JSON.parse(sanitized);

      // 3a. Standard exported SBS JSON
      if (parsed.invoice) {
        if (typeof parsed.invoice === 'string') {
          const res = parseImportInput(parsed.invoice);
          if (res) return res;
        }
        if (parsed.invoice.invoiceNumber) {
          const res = parseImportInput(parsed.invoice.invoiceNumber);
          if (res) return res;
        }
        if (parsed.invoice.itemCode) {
          const validated = validateBase36ItemCode(parsed.invoice.itemCode);
          if (validated) {
            return {
              type: parsed.invoice.invoiceNumber ? 'invoice' : 'item_code',
              itemCode: validated,
              customerCode: parsed.invoice.customerCode,
              invoiceNumber: parsed.invoice.invoiceNumber,
            };
          }
        }
      }

      // 3b. Direct code properties in custom .sbs JSON
      const directCode =
        parsed.itemCode ||
        parsed.item_code ||
        parsed.code ||
        parsed.boughtItemCode ||
        parsed.order?.itemCode ||
        parsed.data?.itemCode;
      if (typeof directCode === 'string') {
        const validated = validateBase36ItemCode(directCode);
        if (validated) {
          const invNum = parsed.invoiceNumber || parsed.invoice_number || parsed.id;
          const custCode = parsed.customerCode ? extractBaseCustomerCode(parsed.customerCode) : undefined;
          let promo = null;
          if (parsed.promoDiscount?.applied && parsed.promoDiscount?.tierId) {
            promo = getPromoDetailsByTier(parsed.promoDiscount.tierId, 0, parsed.promoDiscount.label);
          }
          return {
            type: invNum ? 'invoice' : 'item_code',
            itemCode: validated,
            customerCode: custCode,
            invoiceNumber: invNum,
            appliedPromo: promo,
          };
        }
      }

      // 3c. Direct invoiceNumber property in custom .sbs JSON
      const directInvoice =
        parsed.invoiceNumber ||
        parsed.invoice_number ||
        parsed.orderId ||
        parsed.order_id ||
        parsed.id;
      if (typeof directInvoice === 'string') {
        const res = parseImportInput(directInvoice);
        if (res) return res;
      }

      // 3d. Hardware specification object inside custom .sbs JSON
      const hardwareResult = parseHardwareSpecFromJson(parsed);
      if (hardwareResult) {
        return hardwareResult;
      }
    } catch {
      // Continue to textual regex extraction
    }
  }

  // Remove surrounding quotes if any
  trimmed = trimmed.replace(/^["']|["']$/g, '').trim();

  // 4. Full invoice ID: SBS-<itemCode>-<customerCode>
  const fullInvoiceMatch = trimmed.match(/\bSBS\s*-\s*([0-9A-Z]{3})\s*-\s*([0-9A-Z]{3,16})\b/i);
  if (fullInvoiceMatch) {
    const itemCode = validateBase36ItemCode(fullInvoiceMatch[1]);
    if (itemCode) {
      const rawCustomerCode = fullInvoiceMatch[2].toUpperCase();
      const customerCode = extractBaseCustomerCode(rawCustomerCode);
      return {
        type: 'invoice',
        itemCode,
        customerCode,
        invoiceNumber: `SBS-${itemCode}-${customerCode}`,
        appliedPromo: null, // Must be verified against Firebase Firestore database
      };
    }
  }

  // 5. Partial invoice prefix: SBS-<itemCode> (without customer code)
  const prefixMatch = trimmed.match(/\bSBS\s*-\s*([0-9A-Z]{3})\b/i);
  if (prefixMatch) {
    const itemCode = validateBase36ItemCode(prefixMatch[1]);
    if (itemCode) {
      return {
        type: 'item_code',
        itemCode,
      };
    }
  }

  // 6. Labelled item code in plain text: e.g. "itemCode: 7KF" or "code = 7KF"
  const labelledMatch = trimmed.match(/(?:item_?code|code|bought_?code)\s*[:=]\s*["']?([0-9A-Z]{3})["']?/i);
  if (labelledMatch) {
    const itemCode = validateBase36ItemCode(labelledMatch[1]);
    if (itemCode) {
      return {
        type: 'item_code',
        itemCode,
      };
    }
  }

  // 7. Pure 3-character item code (e.g. "7KF")
  const direct3Char = validateBase36ItemCode(trimmed);
  if (direct3Char) {
    return {
      type: 'item_code',
      itemCode: direct3Char,
    };
  }

  return null;
}
