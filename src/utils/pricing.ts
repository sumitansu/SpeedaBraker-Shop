import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../types';

export const getBoxBorderStyle = (label: string, value: string): string => {
  const normVal = value.trim().toLowerCase();
  const normLabel = label.trim().toLowerCase();

  // Version: V1 is yellow (amber), V2 is green (emerald)
  if (normLabel === 'version') {
    if (normVal === 'v1') {
      return 'border-2 border-amber-500 bg-amber-50/40 text-neutral-900 shadow-2xs';
    }
    if (normVal === 'v2') {
      return 'border-2 border-emerald-500 bg-emerald-50/40 text-neutral-900 shadow-2xs';
    }
    return 'border-2 border-neutral-900 bg-neutral-50/90 text-neutral-900';
  }

  // Antenna boxes in top canvas: None = neutral, Yes / Normal = green, Powerful = yellow
  if (normLabel.startsWith('antenna')) {
    if (normVal === 'none') {
      return 'border-2 border-neutral-900 bg-neutral-50/90 text-neutral-900';
    }
    if (normVal === 'powerful') {
      return 'border-2 border-amber-500 bg-amber-50/40 text-neutral-900 shadow-2xs';
    }
    // 'yes', 'normal'
    return 'border-2 border-emerald-500 bg-emerald-50/30 text-neutral-900 shadow-2xs';
  }

  // Display & Wireless
  if (normVal === 'none') {
    return 'border-2 border-neutral-900 bg-neutral-50/90 text-neutral-900';
  }
  if (normVal === 'no') {
    return 'border-2 border-red-500 bg-red-50/30 text-neutral-900';
  }
  return 'border-2 border-emerald-500 bg-emerald-50/30 text-neutral-900 shadow-2xs';
};

export const calculateTotalPrice = (
  currentUpperBoxes: UpperBoxConfig[],
  currentSlots: LowerSlotConfig[],
  currentAntennaTypes?: Record<number, AntennaDbiType | undefined>
): number => {
  let total = 0;

  // Version price: V1 = ₹100, V2 = ₹300, None = ₹0
  const versionBox = currentUpperBoxes.find(
    (b) => b.label.toLowerCase() === 'version'
  );
  if (versionBox?.value === 'V1') total += 100;
  else if (versionBox?.value === 'V2') total += 300;

  // Display price: Yes = ₹300, None/No = ₹0
  const displayBox = currentUpperBoxes.find(
    (b) => b.label.toLowerCase() === 'display'
  );
  if (displayBox?.value === 'Yes') total += 300;

  // Wireless price: Yes = ₹700, None/No = ₹0
  const wirelessBox = currentUpperBoxes.find(
    (b) => b.label.toLowerCase() === 'wireless'
  );
  if (wirelessBox?.value === 'Yes') total += 700;

  // Antenna prices:
  // Base antenna = ₹50 (when status is 'Yes' or 'Conf' / pending quality)
  // Normal module = ₹50 (base) + ₹200 (normal module) = ₹250
  // Powerful module = ₹50 (base) + ₹700 (powerful module) = ₹750
  // None = ₹0
  // Plus dBi Type price for configured antenna when selected:
  // 0 dBi = +₹100, 6 dBi = +₹150, 12 dBi = +₹450
  currentSlots.forEach((slot) => {
    const val = slot.value.toLowerCase();
    if (val === 'yes' || val === 'conf') {
      total += 50;
    } else if (val === 'normal') {
      total += 250;
    } else if (val === 'powerful') {
      total += 750;
    }

    if (val !== 'none') {
      const dbi = currentAntennaTypes ? currentAntennaTypes[slot.id] : undefined;
      if (dbi === '0dbi') {
        total += 100;
      } else if (dbi === '6dbi') {
        total += 150;
      } else if (dbi === '12dbi') {
        total += 450;
      }
    }
  });

  return total;
};


