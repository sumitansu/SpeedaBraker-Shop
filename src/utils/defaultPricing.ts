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
