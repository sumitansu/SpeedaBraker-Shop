import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Receipt, Check } from 'lucide-react';

import { UpperBoxConfig, LowerSlotConfig, StepId, StepConfig, AntennaDbiType } from './types';
import { calculateTotalPrice } from './utils/pricing';
import { useAnimatedPrice } from './hooks/useAnimatedPrice';

import { Header } from './components/Header';
import { TopStatusGrid } from './components/TopStatusGrid';
import { BillCanvas } from './components/BillCanvas';
import { ConfirmResetModal } from './components/modals/ConfirmResetModal';
import { AntennaInfoModal } from './components/modals/AntennaInfoModal';
import { WirelessWarningModal } from './components/modals/WirelessWarningModal';
import { OneAntennaWarningModal } from './components/modals/OneAntennaWarningModal';
import { JumpQuestionModal } from './components/modals/JumpQuestionModal';
import { V1AntennaLimitModal } from './components/modals/V1AntennaLimitModal';
import { V1DowngradeAntennaModal } from './components/modals/V1DowngradeAntennaModal';
import { AddUnconfiguredAntennaModal } from './components/modals/AddUnconfiguredAntennaModal';
import { AddAndConfigureAntennaModal } from './components/modals/AddAndConfigureAntennaModal';
import { CustomizeAntennaModal } from './components/modals/CustomizeAntennaModal';
import { ImportModal } from './components/modals/ImportModal';

import { FirmwareStep } from './components/steps/FirmwareStep';
import { DisplayStep } from './components/steps/DisplayStep';
import { WirelessStep } from './components/steps/WirelessStep';
import { AntennaStep } from './components/steps/AntennaStep';
import { AntennaQualityStep } from './components/steps/AntennaQualityStep';
import { AntennaTypeStep } from './components/steps/AntennaTypeStep';
import {
  generateInvoiceNumber,
  generateRandomCustomerCode,
  generateOrderDetailsJson,
  downloadSbsFile,
  parseImportInput,
  decodeBoughtItemCode,
  ParsedImportResult,
} from './utils/invoiceCode';

export default function App() {
  const initialUpperBoxes: UpperBoxConfig[] = [
    { id: 'box-version', label: 'Version', value: 'None' },
    { id: 'box-display', label: 'Display', value: 'None' },
    { id: 'box-wireless', label: 'Wireless', value: 'None' },
  ];

  const initialSlots: LowerSlotConfig[] = [
    { id: 1, label: 'Antenna', value: 'None' },
    { id: 2, label: 'Antenna', value: 'None' },
    { id: 3, label: 'Antenna', value: 'None' },
    { id: 4, label: 'Antenna', value: 'None' },
  ];

  const initialAntennaDbiTypes: Record<number, AntennaDbiType | undefined> = {};

  const [upperBoxes, setUpperBoxes] = useState<UpperBoxConfig[]>(initialUpperBoxes);
  const [slots, setSlots] = useState<LowerSlotConfig[]>(initialSlots);
  const [antennaDbiTypes, setAntennaDbiTypes] = useState<Record<number, AntennaDbiType | undefined>>(initialAntennaDbiTypes);
  const [currentStep, setCurrentStep] = useState<StepId>('firmware');

  // Modals
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [activeAntennaModal, setActiveAntennaModal] = useState<'v1' | 'v2' | null>(null);
  const [showJumpModal, setShowJumpModal] = useState<boolean>(false);
  const [showWirelessWarningModal, setShowWirelessWarningModal] = useState<boolean>(false);
  const [showOneAntennaWarningModal, setShowOneAntennaWarningModal] = useState<boolean>(false);
  const [v1LimitModalSlot, setV1LimitModalSlot] = useState<number | null>(null);
  const [showV1DowngradeModal, setShowV1DowngradeModal] = useState<boolean>(false);
  const [unconfiguredModalSlot, setUnconfiguredModalSlot] = useState<number | null>(null);
  const [unconfiguredTypeModalData, setUnconfiguredTypeModalData] = useState<{
    slotId: number;
    initialTierId?: AntennaDbiType;
  } | null>(null);
  const [customizeSlotId, setCustomizeSlotId] = useState<number | null>(null);
  const [showBillCanvas, setShowBillCanvas] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importNotification, setImportNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Active antenna count
  const activeAntennaCount = useMemo(() => {
    return slots.filter((s) => s.value.toLowerCase() !== 'none').length;
  }, [slots]);

  // Current values
  const currentVersion = upperBoxes.find((b) => b.label.toLowerCase() === 'version')?.value || 'None';
  const currentDisplay = upperBoxes.find((b) => b.label.toLowerCase() === 'display')?.value || 'None';
  const currentWireless = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value || 'None';

  // Navigation validation guard: question must be answered to move to next
  const isCurrentStepAnswered = useMemo(() => {
    switch (currentStep) {
      case 'firmware':
        return currentVersion !== 'None';
      case 'display':
        return currentDisplay !== 'None';
      case 'wireless':
        return currentWireless !== 'None';
      case 'antennas':
        return activeAntennaCount > 0;
      case 'quality': {
        const activeSlots = slots.filter((s) => s.value.toLowerCase() !== 'none');
        return (
          activeSlots.length > 0 &&
          activeSlots.every((s) => s.value === 'Normal' || s.value === 'Powerful')
        );
      }
      case 'type': {
        const activeSlots = slots.filter((s) => s.value.toLowerCase() !== 'none');
        return (
          activeSlots.length > 0 &&
          activeSlots.every((s) => Boolean(antennaDbiTypes[s.id]))
        );
      }
      default:
        return false;
    }
  }, [currentStep, currentVersion, currentDisplay, currentWireless, activeAntennaCount, slots, antennaDbiTypes]);

  const isNextDisabled = !isCurrentStepAnswered;

  const nextButtonTitle = useMemo(() => {
    if (!isNextDisabled) return undefined;
    switch (currentStep) {
      case 'firmware':
        return 'Please select a firmware version first';
      case 'display':
        return 'Please answer the display question first';
      case 'wireless':
        return 'Please answer the wireless control question first';
      case 'antennas':
        return 'Please select the number of antennas first';
      case 'quality':
        return 'Please configure module quality for all active antennas first';
      case 'type':
        return 'Please select antenna type for all active antennas first';
      default:
        return 'Please answer the current question first';
    }
  }, [isNextDisabled, currentStep]);

  // Total price & animated values
  const totalPrice = useMemo(() => {
    return calculateTotalPrice(upperBoxes, slots, antennaDbiTypes);
  }, [upperBoxes, slots, antennaDbiTypes]);

  const { displayValue: animatedPrice, diff: priceDiff, direction: priceDirection } = useAnimatedPrice(totalPrice);

  // Steps configuration
  const STEPS: StepConfig[] = useMemo(
    () => [
      {
        id: 'firmware',
        name: 'Firmware',
        question: 'Which firmware version?',
        description: 'Choose V1 or V2 firmware base',
        getValue: (boxes) => boxes.find((b) => b.label.toLowerCase() === 'version')?.value || 'None',
      },
      {
        id: 'display',
        name: 'Display',
        question: 'Do you want display?',
        description: "0.96' OLED operating mode screen",
        getValue: (boxes) => boxes.find((b) => b.label.toLowerCase() === 'display')?.value || 'None',
      },
      {
        id: 'wireless',
        name: 'WiFi Control',
        question: 'Do you want wireless control?',
        description: '5GHz Wi-Fi web browser control',
        getValue: (boxes) => boxes.find((b) => b.label.toLowerCase() === 'wireless')?.value || 'None',
      },
      {
        id: 'antennas',
        name: 'Antenna Count',
        question: 'How many antennas?',
        description: 'Configure number of antennas (1–4)',
        getValue: (_boxes, slotsList) => {
          const count = slotsList ? slotsList.filter((s) => s.value.toLowerCase() !== 'none').length : 0;
          return count > 0 ? `${count} ${count === 1 ? 'Antenna' : 'Antennas'}` : 'None';
        },
      },
      {
        id: 'quality',
        name: 'Module Quality',
        question: 'Which antenna module quality?',
        description: 'Normal & Powerful modules',
        getValue: (_boxes, slotsList) => {
          if (!slotsList) return 'None';
          const active = slotsList.filter((s) => s.value.toLowerCase() !== 'none');
          if (active.length === 0) return 'None';
          const normalCount = active.filter((s) => s.value.toLowerCase() === 'normal').length;
          const powerfulCount = active.filter((s) => s.value.toLowerCase() === 'powerful').length;
          if (normalCount === active.length) return 'Normal';
          if (powerfulCount === active.length) return 'Powerful';
          if (normalCount + powerfulCount === 0) return 'Conf';
          if (normalCount + powerfulCount < active.length) return 'Incomplete';
          return 'Mixed';
        },
      },
      {
        id: 'type',
        name: 'Antenna Type',
        question: 'Which type of antenna?',
        description: '0 dBi, 6 dBi & 12 dBi options',
        getValue: (_boxes, slotsList, types) => {
          if (!slotsList) return 'None';
          const active = slotsList.filter((s) => s.value.toLowerCase() !== 'none');
          if (active.length === 0) return 'None';
          const currentTypes = types || antennaDbiTypes;
          const activeDbi = active.map((s) => currentTypes[s.id]).filter((d): d is AntennaDbiType => Boolean(d));
          if (activeDbi.length === 0) return 'None';
          if (activeDbi.length < active.length) return 'Incomplete';
          const all0 = activeDbi.every((d) => d === '0dbi');
          const all6 = activeDbi.every((d) => d === '6dbi');
          const all12 = activeDbi.every((d) => d === '12dbi');
          if (all0) return '0 dBi';
          if (all6) return '6 dBi';
          if (all12) return '12 dBi';
          return 'Mixed dBi';
        },
      },
    ],
    [antennaDbiTypes]
  );

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const currentStepConfig = STEPS[currentStepIndex] || STEPS[0];
  const previousStep = currentStepIndex > 0 ? STEPS[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < STEPS.length - 1 ? STEPS[currentStepIndex + 1] : null;

  // Direct V1 application helper
  const applyV1Firmware = (forceTwoAntennas: boolean = true) => {
    setUpperBoxes((prev) =>
      prev.map((box) => {
        if (box.label.toLowerCase() === 'version') {
          return { ...box, value: 'V1' };
        }
        if (box.label.toLowerCase() === 'wireless' && box.value === 'Yes') {
          return { ...box, value: 'No' };
        }
        return box;
      })
    );

    if (forceTwoAntennas) {
      setSlots((prev) =>
        prev.map((slot, idx) => {
          if (idx < 2) {
            return slot.value.toLowerCase() === 'none' ? { ...slot, value: 'Conf' } : slot;
          }
          return { ...slot, value: 'None' };
        })
      );
      setAntennaDbiTypes((prev) => {
        const copy = { ...prev };
        delete copy[3];
        delete copy[4];
        return copy;
      });
    } else {
      setSlots((prev) =>
        prev.map((slot, idx) => (idx >= 2 ? { ...slot, value: 'None' } : slot))
      );
      setAntennaDbiTypes((prev) => {
        const copy = { ...prev };
        delete copy[3];
        delete copy[4];
        return copy;
      });
    }
  };

  // Direct V2 application helper
  const applyV2Firmware = () => {
    setUpperBoxes((prev) =>
      prev.map((box) => (box.label.toLowerCase() === 'version' ? { ...box, value: 'V2' } : box))
    );
  };

  // Selection handler for firmware
  const handleSelectVersion = (version: 'V1' | 'V2') => {
    if (version === 'V2') {
      applyV2Firmware();
      setCurrentStep('display');
      return;
    }

    // Attempting to select V1
    if (currentVersion === 'V2') {
      const wirelessVal = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value;
      const hasWirelessMismatch = wirelessVal === 'Yes';
      const hasAntennaMismatch = activeAntennaCount !== 2;

      if (hasWirelessMismatch || hasAntennaMismatch) {
        setShowV1DowngradeModal(true);
      } else {
        // Both wireless is not yes and antennas are 2: direct switch without popup
        applyV1Firmware(true);
        setCurrentStep('display');
      }
    } else {
      // From None to V1
      applyV1Firmware(true);
      setCurrentStep('display');
    }
  };

  const handleConfirmDowngrade = () => {
    applyV1Firmware(true);
    setShowV1DowngradeModal(false);
  };

  const handleSelectDisplay = (val: 'Yes' | 'No') => {
    if (currentVersion === 'None') {
      setCurrentStep('firmware');
      return;
    }
    setUpperBoxes((prev) =>
      prev.map((box) => (box.label.toLowerCase() === 'display' ? { ...box, value: val } : box))
    );
    setCurrentStep('wireless');
  };

  const handleSelectWireless = (val: 'Yes' | 'No') => {
    if (currentVersion === 'None') {
      setCurrentStep('firmware');
      return;
    }
    if (val === 'Yes') {
      setUpperBoxes((prev) =>
        prev.map((box) => {
          if (box.label.toLowerCase() === 'version' && box.value === 'V1') {
            return { ...box, value: 'V2' };
          }
          if (box.label.toLowerCase() === 'wireless') {
            return { ...box, value: 'Yes' };
          }
          return box;
        })
      );
    } else {
      setUpperBoxes((prev) =>
        prev.map((box) => (box.label.toLowerCase() === 'wireless' ? { ...box, value: val } : box))
      );
    }
    setCurrentStep('antennas');
  };

  const handleSetAntennaCount = (count: number) => {
    if (currentVersion === 'None') {
      setCurrentStep('firmware');
      return;
    }

    setSlots((prev) =>
      prev.map((slot, index) => {
        if (index < count) {
          // If this slot was already configured, preserve its quality!
          // Only newly activated unconfigured slots become 'Conf'
          if (slot.value.toLowerCase() !== 'none') {
            return slot;
          }
          return { ...slot, value: 'Conf' };
        }
        // Slot is eliminated
        return { ...slot, value: 'None' };
      })
    );

    // Clean up dBi ONLY for eliminated slots (slotId > count)
    // Preserves dBi for all surviving slots (<= count)!
    setAntennaDbiTypes((prev) => {
      const copy = { ...prev };
      let changed = false;
      for (let slotId = count + 1; slotId <= 4; slotId++) {
        if (slotId in copy) {
          delete copy[slotId];
          changed = true;
        }
      }
      return changed ? copy : prev;
    });

    // Automatically switch to next question step (quality)
    setCurrentStep('quality');
  };

  const handleUpgradeToV2FromAntenna = () => {
    applyV2Firmware();
  };

  const handleSetSlotQuality = (slotId: number, quality: 'Normal' | 'Powerful') => {
    const updated = slots.map((slot) => (slot.id === slotId ? { ...slot, value: quality } : slot));
    setSlots(updated);

    const configuredSlots = updated.filter((s) => s.value.toLowerCase() !== 'none');
    const allSelected =
      configuredSlots.length > 0 &&
      configuredSlots.every((s) => s.value === 'Normal' || s.value === 'Powerful');

    if (allSelected) {
      setTimeout(() => {
        setCurrentStep('type');
      }, 150);
    }
  };

  const handleSelectAntennaType = (slotId: number, dbiType: AntennaDbiType) => {
    setAntennaDbiTypes((prev) => ({
      ...prev,
      [slotId]: dbiType,
    }));
  };

  const handleOpenUnconfiguredModal = (slotId: number) => {
    if (currentVersion === 'V1' && slotId > 2) {
      setV1LimitModalSlot(slotId);
      return;
    }
    setUnconfiguredModalSlot(slotId);
  };

  const handleAddSlotQuality = (slotId: number, quality: 'Normal' | 'Powerful') => {
    const updated = slots.map((slot) => (slot.id === slotId ? { ...slot, value: quality } : slot));
    setSlots(updated);

    // Ensure any stale dBi for this slot is cleared:
    setAntennaDbiTypes((prev) => {
      if (!(slotId in prev)) return prev;
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
    setUnconfiguredModalSlot(null);

    const configuredSlots = updated.filter((s) => s.value.toLowerCase() !== 'none');
    const allSelected =
      configuredSlots.length > 0 &&
      configuredSlots.every((s) => s.value === 'Normal' || s.value === 'Powerful');

    if (allSelected) {
      setTimeout(() => {
        setCurrentStep('type');
      }, 150);
    }
  };

  // Top Status Grid Toggles
  const handleToggleUpperBox = (id: string) => {
    const targetBox = upperBoxes.find((b) => b.id === id);
    if (!targetBox) return;

    if (targetBox.label.toLowerCase() !== 'version' && currentVersion === 'None') {
      setCurrentStep('firmware');
      return;
    }

    if (targetBox.label.toLowerCase() === 'version') {
      if (currentVersion === 'None') {
        applyV1Firmware(true);
      } else if (currentVersion === 'V1') {
        applyV2Firmware();
      } else if (currentVersion === 'V2') {
        // Cycling V2 -> V1
        const wirelessVal = upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value;
        const hasWirelessMismatch = wirelessVal === 'Yes';
        const hasAntennaMismatch = activeAntennaCount !== 2;

        if (hasWirelessMismatch || hasAntennaMismatch) {
          setShowV1DowngradeModal(true);
        } else {
          applyV1Firmware(true);
        }
      }
      return;
    }

    // Toggle display or wireless
    setUpperBoxes((prev) => {
      const updated = prev.map((box) => {
        if (box.id !== id) return box;
        if (box.label.toLowerCase() === 'display') {
          return { ...box, value: box.value === 'Yes' ? 'No' : 'Yes' };
        }
        if (box.label.toLowerCase() === 'wireless') {
          return { ...box, value: box.value === 'Yes' ? 'No' : 'Yes' };
        }
        return box;
      });

      const newVer = updated.find((b) => b.label.toLowerCase() === 'version')?.value;
      const newWireless = updated.find((b) => b.label.toLowerCase() === 'wireless')?.value;

      return updated.map((box) => {
        if (
          targetBox.label.toLowerCase() === 'wireless' &&
          box.label.toLowerCase() === 'version' &&
          newVer === 'V1' &&
          newWireless === 'Yes'
        ) {
          return { ...box, value: 'V2' };
        }
        return box;
      });
    });
  };

  const handleToggleSlot = (id: number) => {
    if (currentVersion === 'None') {
      setCurrentStep('firmware');
      return;
    }

    setCustomizeSlotId(id);
  };

  const handleUpgradeToV2FromLimitModal = () => {
    applyV2Firmware();
    if (v1LimitModalSlot !== null) {
      const targetSlotId = v1LimitModalSlot;
      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.id <= targetSlotId && slot.value.toLowerCase() === 'none') {
            return { ...slot, value: 'Conf' };
          }
          return slot;
        })
      );
      setAntennaDbiTypes((prev) => {
        const copy = { ...prev };
        delete copy[targetSlotId];
        return copy;
      });
    }
    setV1LimitModalSlot(null);
  };

  const [customerCode, setCustomerCode] = useState<string>(() => generateRandomCustomerCode());

  const invoiceNumber = useMemo(() => {
    return generateInvoiceNumber(upperBoxes, slots, antennaDbiTypes, customerCode);
  }, [upperBoxes, slots, antennaDbiTypes, customerCode]);

  const handleDownloadInvoice = () => {
    const orderDetails = generateOrderDetailsJson(
      upperBoxes,
      slots,
      antennaDbiTypes,
      customerCode,
      invoiceNumber
    );
    downloadSbsFile(invoiceNumber, orderDetails);
  };

  const handleConfirmReset = () => {
    setUpperBoxes(initialUpperBoxes);
    setSlots(initialSlots);
    setAntennaDbiTypes(initialAntennaDbiTypes);
    setCurrentStep('firmware');
    setShowConfirmReset(false);
    setCustomizeSlotId(null);
    setShowBillCanvas(false);
    setCustomerCode(generateRandomCustomerCode());
  };

  const applyImportedConfiguration = (parsed: ParsedImportResult) => {
    try {
      const decoded = decodeBoughtItemCode(parsed.itemCode);

      // 1. Version, Display, Wireless
      const newUpperBoxes: UpperBoxConfig[] = [
        { id: 'box-version', label: 'Version', value: decoded.version },
        {
          id: 'box-display',
          label: 'Display',
          value: decoded.display ? 'Yes' : decoded.version !== 'None' ? 'No' : 'None',
        },
        {
          id: 'box-wireless',
          label: 'Wireless',
          value: decoded.wireless ? 'Yes' : decoded.version !== 'None' ? 'No' : 'None',
        },
      ];
      setUpperBoxes(newUpperBoxes);

      // 2. Slots (1 to 4)
      const newSlots: LowerSlotConfig[] = [1, 2, 3, 4].map((slotId) => {
        const decodedSlot = decoded.slots.find((s) => s.slotId === slotId);
        if (!decodedSlot || !decodedSlot.active) {
          return { id: slotId, label: 'Antenna', value: 'None' };
        }
        return {
          id: slotId,
          label: 'Antenna',
          value: decodedSlot.quality === 'powerful' ? 'Powerful' : 'Normal',
        };
      });
      setSlots(newSlots);

      // 3. Antenna dBi Types
      const newDbi: Record<number, AntennaDbiType | undefined> = {};
      decoded.slots.forEach((s) => {
        if (s.active && s.dbi) {
          newDbi[s.slotId] = s.dbi;
        }
      });
      setAntennaDbiTypes(newDbi);

      // 4. If full invoice ID provided, set customer code and open bill section
      if (parsed.type === 'invoice') {
        if (parsed.customerCode) {
          setCustomerCode(parsed.customerCode);
        }
        setShowBillCanvas(true);
        setImportNotification({
          message: `Invoice ${parsed.invoiceNumber || `SBS-${parsed.itemCode}-${parsed.customerCode}`} imported successfully!`,
          type: 'success',
        });
      } else {
        // If only code of item configuration then apply it
        setShowBillCanvas(false);
        if (decoded.version !== 'None') {
          setCurrentStep('type');
        }
        setImportNotification({
          message: `Configuration [${parsed.itemCode}] applied successfully!`,
          type: 'success',
        });
      }

      setShowImportModal(false);

      setTimeout(() => {
        setImportNotification(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to apply imported configuration', err);
    }
  };

  const handleImportClick = async () => {
    // 1. Try to fetch code or full invoice id from clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        const parsed = parseImportInput(clipText);
        if (parsed) {
          applyImportedConfiguration(parsed);
          return;
        }
      }
    } catch {
      // Clipboard read blocked, permission error, or not supported
    }

    // 2. If not found, open popup to add it manually
    setShowImportModal(true);
  };

  return (
    <div
      id="app-root"
      className="h-screen w-screen flex flex-col bg-neutral-100 text-neutral-900 select-none overflow-hidden font-sans"
    >
      {/* Import Notification Toast */}
      {importNotification && (
        <div
          id="import-notification-toast"
          className="fixed top-16 right-4 sm:right-6 z-50 bg-neutral-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{importNotification.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        showBillCanvas={showBillCanvas}
        onBackToConfig={() => setShowBillCanvas(false)}
        onDownloadInvoice={handleDownloadInvoice}
        invoiceNumber={invoiceNumber}
        onResetClick={() => setShowConfirmReset(true)}
        onImportClick={handleImportClick}
      />

      {/* Import Configuration / Invoice Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onApply={applyImportedConfiguration}
        />
      )}

      {/* Confirmation Reset Modal */}
      {showConfirmReset && (
        <ConfirmResetModal
          onClose={() => setShowConfirmReset(false)}
          onConfirm={handleConfirmReset}
        />
      )}

      {/* Antenna Info Modal (V1 requirement / V2 recommendation) */}
      {activeAntennaModal && (
        <AntennaInfoModal
          type={activeAntennaModal}
          onClose={() => setActiveAntennaModal(null)}
        />
      )}

      {/* 5GHz Wi-Fi Compatibility Warning Modal */}
      {showWirelessWarningModal && (
        <WirelessWarningModal onClose={() => setShowWirelessWarningModal(false)} />
      )}

      {/* 1 Antenna Recommendation Warning Modal */}
      {showOneAntennaWarningModal && (
        <OneAntennaWarningModal
          onClose={() => setShowOneAntennaWarningModal(false)}
          onSelectTwoAntennas={() => {
            handleSetAntennaCount(2);
            setShowOneAntennaWarningModal(false);
          }}
        />
      )}

      {/* Bug 1: V1 Antenna Limit Modal (Slot 3 or 4 attempted on V1) */}
      {v1LimitModalSlot !== null && (
        <V1AntennaLimitModal
          slotId={v1LimitModalSlot}
          onClose={() => setV1LimitModalSlot(null)}
          onUpgradeToV2={handleUpgradeToV2FromLimitModal}
        />
      )}

      {/* Bug 2: V1 Downgrade Antenna & Wireless Requirement Modal */}
      {showV1DowngradeModal && (
        <V1DowngradeAntennaModal
          currentAntennaCount={activeAntennaCount}
          hasWirelessEnabled={
            upperBoxes.find((b) => b.label.toLowerCase() === 'wireless')?.value === 'Yes'
          }
          onClose={() => setShowV1DowngradeModal(false)}
          onConfirmDowngrade={handleConfirmDowngrade}
        />
      )}

      {/* Add Unconfigured Antenna Modal (Step 5 Quality) */}
      {unconfiguredModalSlot !== null && (
        <AddUnconfiguredAntennaModal
          slotId={unconfiguredModalSlot}
          onClose={() => setUnconfiguredModalSlot(null)}
          onAddAsNormal={() => handleAddSlotQuality(unconfiguredModalSlot, 'Normal')}
          onAddAsPowerful={() => handleAddSlotQuality(unconfiguredModalSlot, 'Powerful')}
        />
      )}

      {/* Add & Configure Antenna Modal (Step 6 Type) */}
      {unconfiguredTypeModalData !== null && (
        <AddAndConfigureAntennaModal
          slotId={unconfiguredTypeModalData.slotId}
          initialTierId={unconfiguredTypeModalData.initialTierId}
          onClose={() => setUnconfiguredTypeModalData(null)}
          onConfirm={(slotId, quality, dbi) => {
            setSlots((prev) =>
              prev.map((slot) => (slot.id === slotId ? { ...slot, value: quality } : slot))
            );
            setAntennaDbiTypes((prev) => ({
              ...prev,
              [slotId]: dbi,
            }));
            setUnconfiguredTypeModalData(null);
          }}
        />
      )}

      {/* Customize Antenna Modal (from Upper 1/3 Status Canvas) */}
      {customizeSlotId !== null && (
        <CustomizeAntennaModal
          slotId={customizeSlotId}
          slotStatus={slots.find((s) => s.id === customizeSlotId)?.value || 'None'}
          currentDbi={antennaDbiTypes[customizeSlotId]}
          currentVersion={currentVersion}
          onClose={() => setCustomizeSlotId(null)}
          onActivate={(slotId) => {
            setSlots((prev) =>
              prev.map((slot) => {
                if (slot.id <= slotId && slot.value.toLowerCase() === 'none') {
                  return { ...slot, value: 'Conf' };
                }
                return slot;
              })
            );
          }}
          onDeactivate={(slotId) => {
            setSlots((prev) =>
              prev.map((slot) => (slot.id === slotId ? { ...slot, value: 'None' } : slot))
            );
            setAntennaDbiTypes((prev) => {
              const copy = { ...prev };
              delete copy[slotId];
              return copy;
            });
          }}
          onChangeQuality={(slotId, quality) => {
            setSlots((prev) =>
              prev.map((slot) => (slot.id === slotId ? { ...slot, value: quality } : slot))
            );
          }}
          onChangeDbi={(slotId, dbi) => {
            setAntennaDbiTypes((prev) => ({
              ...prev,
              [slotId]: dbi,
            }));
          }}
          onUpgradeToV2={(slotId) => {
            applyV2Firmware();
            setSlots((prev) =>
              prev.map((slot) => {
                if (slot.id <= slotId && slot.value.toLowerCase() === 'none') {
                  return { ...slot, value: 'Conf' };
                }
                return slot;
              })
            );
          }}
        />
      )}

      {/* Jump to Question Modal */}
      {showJumpModal && (
        <JumpQuestionModal
          steps={STEPS}
          currentStep={currentStep}
          currentVersion={currentVersion}
          upperBoxes={upperBoxes}
          slots={slots}
          antennaDbiTypes={antennaDbiTypes}
          onClose={() => setShowJumpModal(false)}
          onSelectStep={(stepId) => setCurrentStep(stepId)}
        />
      )}

      {/* Main Canvas Area */}
      <main id="main-canvas" className="flex-1 flex flex-col w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {showBillCanvas ? (
          <BillCanvas
            upperBoxes={upperBoxes}
            slots={slots}
            antennaDbiTypes={antennaDbiTypes}
            customerCode={customerCode}
            invoiceNumber={invoiceNumber}
            onDownloadInvoice={handleDownloadInvoice}
          />
        ) : (
          <>
            {/* Top 1/3 Canvas: Status Grid & Price Tag */}
            <TopStatusGrid
              upperBoxes={upperBoxes}
              slots={slots}
              antennaDbiTypes={antennaDbiTypes}
              onToggleUpperBox={handleToggleUpperBox}
              onToggleSlot={handleToggleSlot}
              animatedPrice={animatedPrice}
              priceDiff={priceDiff}
              priceDirection={priceDirection}
            />

        {/* Canvas Divider */}
        <div id="canvas-divider" className="w-full h-px bg-neutral-200 shrink-0" />

        {/* Lower 2/3 Canvas: Question Navigation & Active Step Content */}
        <section
          id="lower-two-thirds-canvas"
          className="flex-1 w-full bg-neutral-100/60 p-2 sm:p-3 lg:p-4 min-h-0 overflow-y-auto flex flex-col"
        >
          {/* Shared Fixed-Size Question Navigation Header */}
          <div
            id="question-nav-header"
            className="h-11 sm:h-12 w-full px-2 sm:px-4 flex items-center justify-between border-b border-neutral-200/80 shrink-0 bg-white/90 rounded-xl mb-2 sm:mb-3 backdrop-blur-xs shadow-2xs gap-2"
          >
            {/* Left: Previous Question */}
            <div className="flex-1 flex justify-start min-w-0">
              {previousStep ? (
                <button
                  id="btn-nav-previous"
                  type="button"
                  onClick={() => setCurrentStep(previousStep.id)}
                  className="h-8 sm:h-8.5 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 rounded-lg border border-neutral-300 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[120px]">{previousStep.name}</span>
                  <span className="sm:hidden">Back</span>
                </button>
              ) : null}
            </div>

            {/* Centre: Current Question Name / Click to Jump */}
            <div className="flex items-center justify-center shrink-0 px-1">
              <button
                id="btn-open-jump-modal"
                type="button"
                onClick={() => setShowJumpModal(true)}
                title="Click to jump to any question"
                className="h-8 sm:h-8.5 group flex items-center gap-1.5 px-3 sm:px-4 rounded-full bg-neutral-900 hover:bg-black text-white shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm font-black font-mono tracking-tight whitespace-nowrap">
                  {currentStepConfig.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
              </button>
            </div>

            {/* Right: Next Question or Bill Button */}
            <div className="flex-1 flex justify-end min-w-0">
              {nextStep ? (
                <button
                  id="btn-nav-next"
                  type="button"
                  disabled={isNextDisabled}
                  onClick={() => {
                    if (isNextDisabled) return;
                    setCurrentStep(nextStep.id);
                  }}
                  title={nextButtonTitle}
                  className={`h-8 sm:h-8.5 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all whitespace-nowrap ${
                    isNextDisabled
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-70'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer'
                  }`}
                >
                  <span className="hidden sm:inline truncate max-w-[120px]">{nextStep.name}</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                </button>
              ) : (
                <button
                  id="btn-nav-bill"
                  type="button"
                  disabled={isNextDisabled}
                  onClick={() => {
                    if (isNextDisabled) return;
                    setShowBillCanvas(true);
                  }}
                  title={isNextDisabled ? nextButtonTitle : 'Open Bill & Invoice'}
                  className={`h-8 sm:h-8.5 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-all whitespace-nowrap ${
                    isNextDisabled
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-70'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer shadow-sm hover:scale-[1.02]'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Bill</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Main Question Content View */}
          <div id="question-content-container" className="flex-1 w-full min-h-0 flex flex-col">
            {currentStep === 'firmware' && (
              <FirmwareStep
                currentVersion={currentVersion}
                onSelectVersion={handleSelectVersion}
                onOpenAntennaModal={(type) => setActiveAntennaModal(type)}
                onNextStep={() => setCurrentStep('display')}
              />
            )}

            {currentStep === 'display' && (
              <DisplayStep
                currentVersion={currentVersion}
                currentDisplay={currentDisplay}
                onSelectDisplay={handleSelectDisplay}
                onGoToFirmware={() => setCurrentStep('firmware')}
              />
            )}

            {currentStep === 'wireless' && (
              <WirelessStep
                currentVersion={currentVersion}
                currentWireless={currentWireless}
                onSelectWireless={handleSelectWireless}
                onOpenWirelessWarning={() => setShowWirelessWarningModal(true)}
                onGoToFirmware={() => setCurrentStep('firmware')}
              />
            )}

            {currentStep === 'antennas' && (
              <AntennaStep
                currentVersion={currentVersion}
                activeAntennaCount={activeAntennaCount}
                onSetAntennaCount={handleSetAntennaCount}
                onUpgradeToV2={handleUpgradeToV2FromAntenna}
                onOpenOneAntennaWarning={() => setShowOneAntennaWarningModal(true)}
                onGoToFirmware={() => setCurrentStep('firmware')}
              />
            )}

            {currentStep === 'quality' && (
              <AntennaQualityStep
                currentVersion={currentVersion}
                slots={slots}
                onSetSlotQuality={handleSetSlotQuality}
                onOpenUnconfiguredModal={handleOpenUnconfiguredModal}
                onGoToFirmware={() => setCurrentStep('firmware')}
                onGoToAntennas={() => setCurrentStep('antennas')}
              />
            )}

            {currentStep === 'type' && (
              <AntennaTypeStep
                currentVersion={currentVersion}
                slots={slots}
                antennaDbiTypes={antennaDbiTypes}
                onSelectAntennaType={handleSelectAntennaType}
                onOpenUnconfiguredModal={(slotId, tierId) => {
                  if (currentVersion === 'V1' && slotId > 2) {
                    setV1LimitModalSlot(slotId);
                    return;
                  }
                  setUnconfiguredTypeModalData({ slotId, initialTierId: tierId });
                }}
                onGoToFirmware={() => setCurrentStep('firmware')}
                onGoToAntennas={() => setCurrentStep('antennas')}
              />
            )}
          </div>
        </section>
      </>
    )}
  </main>
    </div>
  );
}
