import { useState, useEffect } from 'react';
import { UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../types';
import {
  savePricingCatalogToFirestore,
  subscribePricingCatalogFromFirestore,
} from '../lib/firebase';

export interface PricingCatalog {
  version: {
    V1: number;
    V2: number;
    None: number;
  };
  display: {
    Yes: number;
    No: number;
    None: number;
  };
  wireless: {
    Yes: number;
    No: number;
    None: number;
  };
  antenna: {
    baseSocket: number;
    quality: {
      Normal: number;
      Powerful: number;
    };
    dbi: {
      '0dbi': number;
      '6dbi': number;
      '12dbi': number;
    };
  };
  mandatoryModules: number;
}

export const DEFAULT_PRICING_CATALOG: PricingCatalog = {
  version: {
    V1: 100,
    V2: 300,
    None: 0,
  },
  display: {
    Yes: 300,
    No: 0,
    None: 0,
  },
  wireless: {
    Yes: 700,
    No: 0,
    None: 0,
  },
  antenna: {
    baseSocket: 50,
    quality: {
      Normal: 200,
      Powerful: 700,
    },
    dbi: {
      '0dbi': 100,
      '6dbi': 150,
      '12dbi': 450,
    },
  },
  mandatoryModules: 700,
};

const STORAGE_KEY = 'speedabrakers_pricing_catalog_v2';

function loadInitialCatalog(): PricingCatalog {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PRICING_CATALOG,
        ...parsed,
        version: { ...DEFAULT_PRICING_CATALOG.version, ...(parsed.version || {}) },
        display: { ...DEFAULT_PRICING_CATALOG.display, ...(parsed.display || {}) },
        wireless: { ...DEFAULT_PRICING_CATALOG.wireless, ...(parsed.wireless || {}) },
        antenna: {
          ...DEFAULT_PRICING_CATALOG.antenna,
          ...(parsed.antenna || {}),
          quality: {
            ...DEFAULT_PRICING_CATALOG.antenna.quality,
            ...(parsed.antenna?.quality || {}),
          },
          dbi: {
            ...DEFAULT_PRICING_CATALOG.antenna.dbi,
            ...(parsed.antenna?.dbi || {}),
          },
        },
        mandatoryModules:
          typeof parsed.mandatoryModules === 'number'
            ? parsed.mandatoryModules
            : DEFAULT_PRICING_CATALOG.mandatoryModules,
      };
    }
  } catch (err) {
    console.warn('Failed to load custom pricing catalog from localStorage:', err);
  }

  return {
    ...DEFAULT_PRICING_CATALOG,
    version: { ...DEFAULT_PRICING_CATALOG.version },
    display: { ...DEFAULT_PRICING_CATALOG.display },
    wireless: { ...DEFAULT_PRICING_CATALOG.wireless },
    antenna: {
      ...DEFAULT_PRICING_CATALOG.antenna,
      quality: { ...DEFAULT_PRICING_CATALOG.antenna.quality },
      dbi: { ...DEFAULT_PRICING_CATALOG.antenna.dbi },
    },
  };
}

// In-memory catalog with optional local storage persistence
let activePricingCatalog: PricingCatalog = loadInitialCatalog();

const listeners = new Set<(catalog: PricingCatalog) => void>();

export function getPricingCatalog(): PricingCatalog {
  return activePricingCatalog;
}

export function updatePricingCatalog(newCatalog: Partial<PricingCatalog>): PricingCatalog {
  activePricingCatalog = {
    ...activePricingCatalog,
    ...newCatalog,
    version: {
      ...activePricingCatalog.version,
      ...(newCatalog.version || {}),
    },
    display: {
      ...activePricingCatalog.display,
      ...(newCatalog.display || {}),
    },
    wireless: {
      ...activePricingCatalog.wireless,
      ...(newCatalog.wireless || {}),
    },
    antenna: {
      ...activePricingCatalog.antenna,
      ...(newCatalog.antenna || {}),
      quality: {
        ...activePricingCatalog.antenna.quality,
        ...(newCatalog.antenna?.quality || {}),
      },
      dbi: {
        ...activePricingCatalog.antenna.dbi,
        ...(newCatalog.antenna?.dbi || {}),
      },
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activePricingCatalog));
  } catch (err) {
    console.warn('Failed to persist pricing catalog to localStorage:', err);
  }

  // Persist to centralized Firestore config/pricing
  savePricingCatalogToFirestore(activePricingCatalog).catch((err) => {
    console.warn('Could not persist pricing to Firestore (check admin privileges):', err);
  });

  listeners.forEach((listener) => listener(activePricingCatalog));
  return activePricingCatalog;
}

export function resetPricingCatalog(): PricingCatalog {
  activePricingCatalog = JSON.parse(JSON.stringify(DEFAULT_PRICING_CATALOG));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear pricing catalog from localStorage:', err);
  }

  savePricingCatalogToFirestore(DEFAULT_PRICING_CATALOG).catch((err) => {
    console.warn('Could not reset pricing in Firestore:', err);
  });

  listeners.forEach((listener) => listener(activePricingCatalog));
  return activePricingCatalog;
}

// Automatically subscribe to real-time updates from Firestore config/pricing
try {
  subscribePricingCatalogFromFirestore((remoteCatalog) => {
    if (remoteCatalog && typeof remoteCatalog === 'object') {
      activePricingCatalog = {
        ...activePricingCatalog,
        ...(remoteCatalog as Partial<PricingCatalog>),
        version: {
          ...activePricingCatalog.version,
          ...((remoteCatalog as any).version || {}),
        },
        display: {
          ...activePricingCatalog.display,
          ...((remoteCatalog as any).display || {}),
        },
        wireless: {
          ...activePricingCatalog.wireless,
          ...((remoteCatalog as any).wireless || {}),
        },
        antenna: {
          ...activePricingCatalog.antenna,
          ...((remoteCatalog as any).antenna || {}),
          quality: {
            ...activePricingCatalog.antenna.quality,
            ...((remoteCatalog as any).antenna?.quality || {}),
          },
          dbi: {
            ...activePricingCatalog.antenna.dbi,
            ...((remoteCatalog as any).antenna?.dbi || {}),
          },
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activePricingCatalog));
      } catch {
        // ignore storage warning
      }

      listeners.forEach((listener) => listener(activePricingCatalog));
    }
  });
} catch (err) {
  console.warn('Firestore pricing catalog listener setup:', err);
}

export function subscribePricingCatalog(listener: (catalog: PricingCatalog) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePricingCatalog(): PricingCatalog {
  const [catalog, setCatalog] = useState<PricingCatalog>(() => getPricingCatalog());

  useEffect(() => {
    return subscribePricingCatalog((updated) => {
      setCatalog({ ...updated });
    });
  }, []);

  return catalog;
}

// Proxied PRICING_CATALOG for static call compatibility
export const PRICING_CATALOG: PricingCatalog = new Proxy({} as PricingCatalog, {
  get(_target, prop: keyof PricingCatalog) {
    return activePricingCatalog[prop];
  },
});

export const formatINR = (val: number): string => {
  return `₹${applyPsychologicalPricing(val).toLocaleString('en-IN')}`;
};

export const formatRawINR = (val: number): string => {
  return `₹${(val || 0).toLocaleString('en-IN')}`;
};

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

/**
 * Applies psychological pricing (charm pricing) to a calculated total.
 * E.g., a total of ₹200 becomes ₹199, and two ₹200 items (₹400) become ₹399 ("total - 1").
 * When amount is 0, returns 0.
 */
export const applyPsychologicalPricing = (amount: number): number => {
  if (amount <= 0) return 0;
  return Math.max(0, Math.round(amount) - 1);
};

export const calculateRawTotalPrice = (
  currentUpperBoxes: UpperBoxConfig[],
  currentSlots: LowerSlotConfig[],
  currentAntennaTypes?: Record<number, AntennaDbiType | undefined>,
  catalog: PricingCatalog = activePricingCatalog
): number => {
  let total = 0;

  // Version price: V1, V2, None
  const versionBox = currentUpperBoxes.find(
    (b) => b.label.toLowerCase() === 'version'
  );
  if (versionBox?.value === 'V1') total += catalog.version.V1;
  else if (versionBox?.value === 'V2') total += catalog.version.V2;

  // Display price: Yes
  const displayBox = currentUpperBoxes.find(
    (b) => b.label.toLowerCase() === 'display'
  );
  if (displayBox?.value === 'Yes') total += catalog.display.Yes;

  // Wireless price: Yes
  const wirelessBox = currentUpperBoxes.find(
    (b) => b.label.toLowerCase() === 'wireless'
  );
  if (wirelessBox?.value === 'Yes') total += catalog.wireless.Yes;

  // Antenna prices:
  // Base antenna = baseSocket (when status is 'Yes' or 'Conf')
  // Normal module = baseSocket + Normal quality
  // Powerful module = baseSocket + Powerful quality
  // Plus dBi Type price when selected
  currentSlots.forEach((slot) => {
    const val = slot.value.toLowerCase();
    if (val === 'yes' || val === 'conf') {
      total += catalog.antenna.baseSocket;
    } else if (val === 'normal') {
      total += catalog.antenna.baseSocket + catalog.antenna.quality.Normal;
    } else if (val === 'powerful') {
      total += catalog.antenna.baseSocket + catalog.antenna.quality.Powerful;
    }

    if (val !== 'none') {
      const dbi = currentAntennaTypes ? currentAntennaTypes[slot.id] : undefined;
      if (dbi && dbi in catalog.antenna.dbi) {
        total += catalog.antenna.dbi[dbi as keyof typeof catalog.antenna.dbi];
      }
    }
  });

  return total;
};

export const calculateTotalPrice = (
  currentUpperBoxes: UpperBoxConfig[],
  currentSlots: LowerSlotConfig[],
  currentAntennaTypes?: Record<number, AntennaDbiType | undefined>,
  catalog: PricingCatalog = activePricingCatalog
): number => {
  const rawTotal = calculateRawTotalPrice(
    currentUpperBoxes,
    currentSlots,
    currentAntennaTypes,
    catalog
  );
  return applyPsychologicalPricing(rawTotal);
};


