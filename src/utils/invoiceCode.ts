import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../types';
import { calculateTotalPrice } from './pricing';

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
    const dbi = antennaDbiTypes[slotId];
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
  invoiceNumber: string
) {
  const versionVal = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || 'None';
  const displayVal = upperBoxes.find((b) => b.label.toLowerCase() === 'display')?.value || 'None';
  const wirelessVal = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value || 'None';

  const itemCode = generateBoughtItemCode(upperBoxes, slots, antennaDbiTypes);
  const MANDATORY_MODULES_COST = 500;
  const configuredSubtotal = calculateTotalPrice(upperBoxes, slots, antennaDbiTypes);
  const grandTotal = configuredSubtotal + MANDATORY_MODULES_COST;

  const versionPrice = versionVal === 'V1' ? 100 : versionVal === 'V2' ? 300 : 0;
  const displayPrice = displayVal === 'Yes' ? 300 : 0;
  const wirelessPrice = wirelessVal === 'Yes' ? 700 : 0;

  const activeSlots = slots.filter((s) => s.value.toLowerCase() !== 'none');
  const antennaDetails = activeSlots.map((slot) => {
    const quality = slot.value.toLowerCase() as 'normal' | 'powerful';
    const dbi = antennaDbiTypes[slot.id] || '0dbi';
    const socketMountCost = 50;
    const qualityModuleCost = quality === 'normal' ? 200 : 700;
    const dbiRadiatorCost = dbi === '0dbi' ? 100 : dbi === '6dbi' ? 150 : 450;
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
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      currency: 'INR',
      currencySymbol: '₹',
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
      grandTotal,
      taxNote: 'All tax and GST included',
    },
    verificationDecodedSpec: decodeBoughtItemCode(itemCode),
  };
}

/**
 * Triggers client-side download of the custom JSON order file with .sbs extension.
 */
export function downloadSbsFile(
  invoiceNumber: string,
  orderDetails: ReturnType<typeof generateOrderDetailsJson>
) {
  const jsonContent = JSON.stringify(orderDetails, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
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
}

/**
 * Parses raw text input (from clipboard or manual entry) into either
 * an item configuration code or a full invoice ID.
 */
export function parseImportInput(rawInput: string): ParsedImportResult | null {
  if (!rawInput) return null;
  let trimmed = rawInput.trim();
  if (!trimmed) return null;

  // 1. JSON string from an exported .sbs file
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.invoice?.invoiceNumber) {
        return parseImportInput(parsed.invoice.invoiceNumber);
      }
      if (parsed.invoice?.itemCode) {
        return parseImportInput(parsed.invoice.itemCode);
      }
    } catch {
      // Continue to text checks
    }
  }

  // Remove surrounding quotes if any
  trimmed = trimmed.replace(/^["']|["']$/g, '').trim();

  // 2. Full invoice ID: SBS-<itemCode>-<customerCode>
  const fullInvoiceMatch = trimmed.match(/\bSBS\s*-\s*([0-9A-Z]{3})\s*-\s*([0-9A-Z]{3,12})\b/i);
  if (fullInvoiceMatch) {
    const itemCode = fullInvoiceMatch[1].toUpperCase();
    const customerCode = fullInvoiceMatch[2].toUpperCase();
    const intVal = parseInt(itemCode, 36);
    if (!isNaN(intVal) && intVal >= 0 && intVal <= 28811) {
      return {
        type: 'invoice',
        itemCode,
        customerCode,
        invoiceNumber: `SBS-${itemCode}-${customerCode}`,
      };
    }
  }

  // 3. Partial invoice prefix: SBS-<itemCode> (without customer code)
  const prefixMatch = trimmed.match(/\bSBS\s*-\s*([0-9A-Z]{3})\b/i);
  if (prefixMatch) {
    const itemCode = prefixMatch[1].toUpperCase();
    const intVal = parseInt(itemCode, 36);
    if (!isNaN(intVal) && intVal >= 0 && intVal <= 28811) {
      return {
        type: 'item_code',
        itemCode,
      };
    }
  }

  // 4. Pure 3-character item code (e.g. "7KF")
  if (/^[0-9A-Z]{3}$/i.test(trimmed)) {
    const itemCode = trimmed.toUpperCase();
    const intVal = parseInt(itemCode, 36);
    if (!isNaN(intVal) && intVal >= 0 && intVal <= 28811) {
      return {
        type: 'item_code',
        itemCode,
      };
    }
  }

  return null;
}
