export interface UpperBoxConfig {
  id: string;
  label: string;
  value: string;
}

export interface LowerSlotConfig {
  id: number;
  label: string;
  value: string;
}

export type StepId = 'firmware' | 'display' | 'wireless' | 'antennas' | 'quality' | 'type';

export type AntennaDbiType = '0dbi' | '6dbi' | '12dbi';

export interface AppliedPromo {
  code: string;
  tierId: string;
  type: 'percent' | 'flat';
  value: number;
  label: string;
  discountAmount: number;
}

export interface StepConfig {
  id: StepId;
  name: string;
  question: string;
  description: string;
  getValue: (
    boxes: UpperBoxConfig[],
    slotsList?: LowerSlotConfig[],
    antennaTypes?: Record<number, AntennaDbiType | undefined>
  ) => string;
}
