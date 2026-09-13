import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Tag,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Percent,
  IndianRupee,
  Layers,
  Sparkles,
  Radio,
  Tv,
  Wifi,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sliders,
  DollarSign,
} from 'lucide-react';
import {
  ProductStockRecord,
  FirestorePromoCodeRecord,
  savePromoCodeToFirestore,
  deletePromoCodeFromFirestore,
  togglePromoCodeActiveInFirestore,
  subscribePromoCodes,
  fetchAllPromoCodesFromFirestore,
  DEFAULT_PRODUCT_STOCK,
} from '../lib/firebase';
import {
  getPricingCatalog,
  updatePricingCatalog,
  resetPricingCatalog,
  formatINR,
  PricingCatalog,
  DEFAULT_PRICING_CATALOG,
} from '../utils/pricing';

interface AdminCanvasProps {
  currentAdminUser: string | null;
  onBackToConfig: () => void;
  onLogout: () => void;
  stockMap: Record<string, boolean>;
  onStockUpdated: (stockMap: Record<string, boolean>) => void;
}

const AdminCanvasComponent: React.FC<AdminCanvasProps> = ({
  currentAdminUser,
  onBackToConfig,
  onLogout,
  stockMap,
  onStockUpdated,
}) => {
  const { t } = useTranslation();
  // Active Tab: 'pricing' | 'stock' | 'promos'
  const [activeTab, setActiveTab] = useState<'pricing' | 'stock' | 'promos'>('pricing');

  // Pricing Form State (Local in-code state, editable by admin)
  const [pricingForm, setPricingForm] = useState<PricingCatalog>(() => {
    const current = getPricingCatalog();
    return JSON.parse(JSON.stringify(current));
  });
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // Stock State (Local in-code state, editable by admin without Firestore)
  const [localStockList, setLocalStockList] = useState<ProductStockRecord[]>(() => {
    return DEFAULT_PRODUCT_STOCK.map((item) => ({
      ...item,
      inStock: stockMap[item.productId] !== undefined ? stockMap[item.productId] : item.inStock,
    }));
  });
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);

  // Promo Code State (Synced directly with Firestore database)
  const [promoList, setPromoList] = useState<FirestorePromoCodeRecord[]>([]);
  const [isPromoLoading, setIsPromoLoading] = useState<boolean>(true);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [promoErrorMsg, setPromoErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add Promo Form State
  const [newCode, setNewCode] = useState<string>('');
  const [newType, setNewType] = useState<'percent' | 'flat'>('percent');
  const [newValue, setNewValue] = useState<string>('10');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newMinOrder, setNewMinOrder] = useState<string>('0');
  const [newIsActive, setNewIsActive] = useState<boolean>(true);
  const [isSubmittingPromo, setIsSubmittingPromo] = useState<boolean>(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);


  // Sync local stock list if external stockMap changes
  useEffect(() => {
    setLocalStockList((prev) =>
      prev.map((item) => ({
        ...item,
        inStock: stockMap[item.productId] !== undefined ? stockMap[item.productId] : item.inStock,
      }))
    );
  }, [stockMap]);

  // Subscribe to real-time promo codes from Firestore
  useEffect(() => {
    setIsPromoLoading(true);
    const unsubscribe = subscribePromoCodes((list) => {
      setPromoList(list);
      setIsPromoLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    if (activeTab === 'promos') {
      setIsPromoLoading(true);
      try {
        const list = await fetchAllPromoCodesFromFirestore();
        setPromoList(list);
      } catch (err) {
        console.error('Manual refresh promo error:', err);
      } finally {
        setIsPromoLoading(false);
      }
    }
  };

  // Pricing Handlers
  const handlePricingChange = (path: string, valStr: string) => {
    const num = Math.max(0, parseInt(valStr, 10) || 0);
    setPricingForm((prev) => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      if (parts.length === 1) {
        copy[parts[0]] = num;
      } else if (parts.length === 2) {
        copy[parts[0]][parts[1]] = num;
      } else if (parts.length === 3) {
        copy[parts[0]][parts[1]][parts[2]] = num;
      }
      return copy;
    });
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingCatalog(pricingForm);
    setPricingSuccessMsg('Pricing catalog successfully updated across the entire shop.');
    setTimeout(() => setPricingSuccessMsg(null), 3500);
  };

  const handleResetPrices = () => {
    const reset = resetPricingCatalog();
    setPricingForm(JSON.parse(JSON.stringify(reset)));
    setPricingSuccessMsg('Pricing catalog restored to factory defaults.');
    setTimeout(() => setPricingSuccessMsg(null), 3500);
  };

  // Stock toggle handler (Local in-code state)
  const handleToggleStock = (product: ProductStockRecord) => {
    const nextState = !product.inStock;
    setStockSuccessMsg(null);

    const updatedList = localStockList.map((item) =>
      item.productId === product.productId ? { ...item, inStock: nextState } : item
    );
    setLocalStockList(updatedList);

    const updatedMap: Record<string, boolean> = {};
    for (const item of updatedList) {
      updatedMap[item.productId] = item.inStock;
    }
    onStockUpdated(updatedMap);

    setStockSuccessMsg(
      `"${product.productName}" updated to ${nextState ? 'IN STOCK' : 'OUT OF STOCK'}`
    );
    setTimeout(() => setStockSuccessMsg(null), 3000);
  };

  // Add promo code handler
  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoErrorMsg(null);
    setPromoSuccessMsg(null);

    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode || cleanCode.length < 3) {
      setPromoErrorMsg('Promo code must be at least 3 characters long (alphanumeric).');
      return;
    }

    const numVal = parseFloat(newValue);
    if (isNaN(numVal) || numVal <= 0) {
      setPromoErrorMsg('Please enter a valid positive discount value.');
      return;
    }

    if (newType === 'percent' && numVal > 100) {
      setPromoErrorMsg('Percentage discount cannot exceed 100%.');
      return;
    }

    const minOrderVal = parseFloat(newMinOrder) || 0;
    const label =
      newLabel.trim() ||
      `${cleanCode} (${newType === 'percent' ? `${numVal}% OFF` : `₹${numVal} OFF`})`;

    setIsSubmittingPromo(true);

    try {
      await savePromoCodeToFirestore({
        code: cleanCode,
        type: newType,
        value: numVal,
        label,
        minOrderValue: minOrderVal,
        active: newIsActive,
      });

      // Clear form
      setNewCode('');
      setNewValue('10');
      setNewLabel('');
      setNewMinOrder('0');
      setNewIsActive(true);

      setPromoSuccessMsg(`Promo code "${cleanCode}" saved to Firebase.`);
      setTimeout(() => setPromoSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to save promo code:', err);
      setPromoErrorMsg('Failed to save promo code to Firebase database.');
    } finally {
      setIsSubmittingPromo(false);
    }
  };

  // Delete promo code handler
  const handleDeletePromo = async (code: string) => {
    setDeletingCode(code);
    setPromoErrorMsg(null);
    setPromoSuccessMsg(null);

    try {
      await deletePromoCodeFromFirestore(code);
      setPromoList((prev) => prev.filter((p) => p.code !== code));
      setPromoSuccessMsg(`Promo code "${code}" removed from Firebase.`);
      setTimeout(() => setPromoSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete promo code:', err);
      setPromoErrorMsg(`Failed to delete promo code "${code}".`);
    } finally {
      setDeletingCode(null);
    }
  };

  // Toggle promo code active status
  const handleTogglePromoActive = async (promo: FirestorePromoCodeRecord) => {
    const nextActive = !promo.active;
    setPromoList((prev) =>
      prev.map((p) => (p.code === promo.code ? { ...p, active: nextActive } : p))
    );

    try {
      await togglePromoCodeActiveInFirestore(promo.code, nextActive);
    } catch (err) {
      console.error('Failed to toggle promo active state:', err);
      setPromoList((prev) =>
        prev.map((p) => (p.code === promo.code ? { ...p, active: promo.active } : p))
      );
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Categories definition for stock (Firmware excluded)
  const categoryConfig: Record<
    string,
    { title: string; description: string; icon: React.ReactNode }
  > = {
    display: {
      title: 'Display Hardware',
      description: 'OLED graphical screen module for real-time telemetry',
      icon: <Tv className="w-4 h-4 text-neutral-700" />,
    },
    wireless: {
      title: 'Wireless Modules',
      description: 'High-speed 5GHz wireless communications controller',
      icon: <Wifi className="w-4 h-4 text-neutral-700" />,
    },
    antenna_quality: {
      title: 'Antenna Quality Tiers',
      description: 'Normal (Standard range) & Powerful (+100m boost) grades',
      icon: <Sparkles className="w-4 h-4 text-neutral-700" />,
    },
    antenna_dbi: {
      title: 'Antenna Gain & Types',
      description: '0 dBi stub, 6 dBi omni-directional, 12 dBi high-gain',
      icon: <Radio className="w-4 h-4 text-neutral-700" />,
    },
  };

  const groupedProducts = localStockList.reduce<Record<string, ProductStockRecord[]>>((acc, item) => {
    const cat = item.category;
    if (cat === ('firmware' as any)) return acc;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div
      id="admin-canvas-root"
      className="flex flex-col h-full w-full bg-neutral-100/90 overflow-hidden select-none animate-in fade-in duration-150"
    >
      {/* Admin Workspace Toolbar */}
      <div
        id="admin-toolbar"
        className="px-3 sm:px-6 py-2.5 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs shrink-0 z-10"
      >
        {/* Navigation Tabs */}
        <div id="admin-tab-group" className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <motion.button
            id="tab-btn-price-editor"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-900/5'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <IndianRupee className="w-4 h-4 shrink-0 text-neutral-700" />
            <span>{t('admin.tabPrice', 'Price Editor')}</span>
          </motion.button>

          <motion.button
            id="tab-btn-product-stock"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-900/5'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Package className="w-4 h-4 shrink-0 text-neutral-700" />
            <span>{t('admin.tabStock', 'Product Stock')}</span>
          </motion.button>

          <motion.button
            id="tab-btn-promo-codes"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'promos'
                ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-900/5'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0 text-neutral-700" />
            <span>{t('admin.tabPromos', 'Promo Codes')}</span>
            <span className="text-[11px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded-full font-bold">
              {promoList.length}
            </span>
          </motion.button>
        </div>

        {/* Live Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeTab === 'promos' && (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Firestore Promos</span>
            </div>
          )}

          {activeTab === 'promos' && (
            <motion.button
              id="btn-admin-refresh"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualRefresh}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPromoLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </motion.button>
          )}

          <motion.button
            id="btn-admin-logout"
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
            title="Log out of admin session"
          >
            <span>{t('admin.logout', 'Log out')}</span>
          </motion.button>
        </div>
      </div>

      {/* Main Admin Scrollable Area */}
      <div id="admin-main-scrollable" className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Notification Banners */}
          {pricingSuccessMsg && (
            <div
              id="banner-pricing-success"
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pricingSuccessMsg}</span>
            </div>
          )}

          {stockSuccessMsg && (
            <div
              id="banner-stock-success"
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{stockSuccessMsg}</span>
            </div>
          )}

          {promoSuccessMsg && (
            <div
              id="banner-promo-success"
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{promoSuccessMsg}</span>
            </div>
          )}

          {promoErrorMsg && (
            <div
              id="banner-promo-error"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs animate-in fade-in"
            >
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{promoErrorMsg}</span>
            </div>
          )}

          {/* Animated Tab Content Panels */}
          <AnimatePresence mode="wait">
            {/* TAB 1: PRICE EDITOR */}
            {activeTab === 'pricing' && (
              <motion.form
                key="tab-pricing"
                id="form-price-editor"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onSubmit={handleSavePrices}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-neutral-800" />
                      <span>Product Pricing Editor</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                      Customize component prices. Updates apply immediately to configuration and invoices.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      id="btn-reset-default-prices"
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleResetPrices}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl border border-neutral-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </motion.button>

                    <motion.button
                      id="btn-save-prices"
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Save All Prices</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Group 1: Firmware Prices */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs overflow-hidden"
                >
                  <div className="px-4 py-3 bg-neutral-50/90 border-b border-neutral-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-700" />
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900">Firmware Base Prices</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        V1 Firmware Base Price (₹)
                      </label>
                      <input
                        id="input-price-version-v1"
                        type="number"
                        min="0"
                        value={pricingForm.version.V1}
                        onChange={(e) => handlePricingChange('version.V1', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        V2 Firmware Base Price (₹)
                      </label>
                      <input
                        id="input-price-version-v2"
                        type="number"
                        min="0"
                        value={pricingForm.version.V2}
                        onChange={(e) => handlePricingChange('version.V2', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Group 2: Core Hardware Add-ons & Assembly */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs overflow-hidden"
                >
                  <div className="px-4 py-3 bg-neutral-50/90 border-b border-neutral-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-700" />
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900">Core Modules & Assembly</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        0.96' OLED Screen (₹)
                      </label>
                      <input
                        id="input-price-display-yes"
                        type="number"
                        min="0"
                        value={pricingForm.display.Yes}
                        onChange={(e) => handlePricingChange('display.Yes', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        5GHz Wireless Module (₹)
                      </label>
                      <input
                        id="input-price-wireless-yes"
                        type="number"
                        min="0"
                        value={pricingForm.wireless.Yes}
                        onChange={(e) => handlePricingChange('wireless.Yes', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Fixed Base Price / Assembly (₹)
                      </label>
                      <input
                        id="input-price-mandatory-modules"
                        type="number"
                        min="0"
                        value={pricingForm.mandatoryModules}
                        onChange={(e) => handlePricingChange('mandatoryModules', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono font-bold text-neutral-900"
                        title="Fixed base hardware price added to every configuration"
                      />
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Mandatory core modules kit fixed price
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Group 3: Antenna Hardware & Gain Tiers */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs overflow-hidden"
                >
                  <div className="px-4 py-3 bg-neutral-50/90 border-b border-neutral-200 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-neutral-700" />
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900">Antenna Socket & Radiators</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Base Antenna Socket Mount per Slot (₹)
                      </label>
                      <input
                        id="input-price-antenna-socket"
                        type="number"
                        min="0"
                        value={pricingForm.antenna.baseSocket}
                        onChange={(e) => handlePricingChange('antenna.baseSocket', e.target.value)}
                        className="w-full sm:w-1/2 px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                      />
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <h4 className="text-xs font-bold text-neutral-800 mb-2">Module Quality Tiers (₹)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Normal Module (+₹)
                          </label>
                          <input
                            id="input-price-antenna-quality-normal"
                            type="number"
                            min="0"
                            value={pricingForm.antenna.quality.Normal}
                            onChange={(e) => handlePricingChange('antenna.quality.Normal', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Powerful Module (+₹)
                          </label>
                          <input
                            id="input-price-antenna-quality-powerful"
                            type="number"
                            min="0"
                            value={pricingForm.antenna.quality.Powerful}
                            onChange={(e) => handlePricingChange('antenna.quality.Powerful', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <h4 className="text-xs font-bold text-neutral-800 mb-2">Antenna Gain / dBi Radiators (₹)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            0 dBi Internal Stub (+₹)
                          </label>
                          <input
                            id="input-price-antenna-dbi-0"
                            type="number"
                            min="0"
                            value={pricingForm.antenna.dbi['0dbi']}
                            onChange={(e) => handlePricingChange('antenna.dbi.0dbi', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            6 dBi Omni-Directional (+₹)
                          </label>
                          <input
                            id="input-price-antenna-dbi-6"
                            type="number"
                            min="0"
                            value={pricingForm.antenna.dbi['6dbi']}
                            onChange={(e) => handlePricingChange('antenna.dbi.6dbi', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            12 dBi High-Gain Booster (+₹)
                          </label>
                          <input
                            id="input-price-antenna-dbi-12"
                            type="number"
                            min="0"
                            value={pricingForm.antenna.dbi['12dbi']}
                            onChange={(e) => handlePricingChange('antenna.dbi.12dbi', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom Submit Bar */}
                <div className="flex justify-end pt-2">
                  <motion.button
                    id="btn-save-prices-bottom"
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Save All Prices</span>
                  </motion.button>
                </div>
              </motion.form>
            )}

            {/* TAB 2: PRODUCT STOCK AVAILABILITY */}
            {activeTab === 'stock' && (
              <motion.div
                key="tab-stock"
                id="section-product-stock"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 p-4 shadow-xs"
                >
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-neutral-800" />
                    <span>Hardware Component Stock Control</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    Change in-stock or out-of-stock status for hardware components. When marked out of stock, customers cannot select the item during configuration.
                  </p>
                </motion.div>

                <div className="space-y-4">
                  {Object.entries(categoryConfig).map(([catKey, config], idx) => {
                    const items = groupedProducts[catKey] || [];
                    if (items.length === 0) return null;

                    return (
                      <motion.div
                        key={catKey}
                        id={`category-group-${catKey}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-neutral-50/90 border-b border-neutral-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-neutral-200/70 text-neutral-800">
                              {config.icon}
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                                {config.title}
                              </h3>
                              <p className="text-[11px] text-neutral-500 hidden sm:block">
                                {config.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-600 font-semibold bg-neutral-200/60 px-2 py-0.5 rounded-md">
                            {items.filter((i) => i.inStock).length}/{items.length} In Stock
                          </span>
                        </div>

                        <div className="divide-y divide-neutral-100">
                          {items.map((product) => {
                            return (
                              <div
                                key={product.productId}
                                id={`stock-row-${product.productId}`}
                                className={`p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                                  product.inStock ? 'hover:bg-neutral-50/50' : 'bg-rose-50/20'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-3 h-3 rounded-full shrink-0 transition-all ${
                                      product.inStock
                                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                                        : 'bg-rose-500 ring-4 ring-rose-100'
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                                      {product.productName}
                                    </h4>
                                    <span className="text-[10px] text-neutral-400 font-mono">
                                      {product.productId}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold transition-colors ${
                                      product.inStock
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                                    }`}
                                  >
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                  </span>

                                  <motion.button
                                    id={`btn-toggle-stock-${product.productId}`}
                                    type="button"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => handleToggleStock(product)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs border ${
                                      product.inStock
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                                    }`}
                                  >
                                    {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                                  </motion.button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 3: PROMO CODES (FIREBASE SYNCED) */}
            {activeTab === 'promos' && (
              <motion.div
                key="tab-promos"
                id="section-promo-codes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Add New Promo Card */}
                <motion.div
                  id="card-add-promo"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                        Add New Promo Code
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Instantly synced with Firebase Firestore database
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddPromo} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Code Input */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Promo Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="input-new-promo-code"
                          type="text"
                          required
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          placeholder="e.g. FESTIVE20"
                          className="w-full px-3 py-2 text-xs sm:text-sm font-mono uppercase bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        />
                      </div>

                      {/* Discount Type */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Type
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                          <button
                            id="btn-promo-type-percent"
                            type="button"
                            onClick={() => setNewType('percent')}
                            className={`flex items-center justify-center gap-1 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              newType === 'percent'
                                ? 'bg-white text-neutral-900 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <Percent className="w-3 h-3" />
                            <span>Percent %</span>
                          </button>
                          <button
                            id="btn-promo-type-flat"
                            type="button"
                            onClick={() => setNewType('flat')}
                            className={`flex items-center justify-center gap-1 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              newType === 'flat'
                                ? 'bg-white text-neutral-900 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <IndianRupee className="w-3 h-3" />
                            <span>Flat ₹</span>
                          </button>
                        </div>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Discount Value ({newType === 'percent' ? '%' : '₹'}) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="input-new-promo-value"
                          type="number"
                          required
                          min="1"
                          max={newType === 'percent' ? 100 : 50000}
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder={newType === 'percent' ? 'e.g. 15' : 'e.g. 300'}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        />
                      </div>

                      {/* Min Order Value */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Min Order (₹)
                        </label>
                        <input
                          id="input-new-promo-min-order"
                          type="number"
                          min="0"
                          value={newMinOrder}
                          onChange={(e) => setNewMinOrder(e.target.value)}
                          placeholder="0 for none"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Label & Active Option */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Description / Label (Optional)
                        </label>
                        <input
                          id="input-new-promo-label"
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="e.g. Festive Seasonal Special Discount"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                          <input
                            id="checkbox-new-promo-active"
                            type="checkbox"
                            checked={newIsActive}
                            onChange={(e) => setNewIsActive(e.target.checked)}
                            className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                          />
                          <span>Active</span>
                        </label>

                        <motion.button
                          id="btn-submit-add-promo"
                          type="submit"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={isSubmittingPromo}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                        >
                          {isSubmittingPromo ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Promo</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </motion.div>

                {/* Promo Codes List Card */}
                <motion.div
                  id="card-promo-list"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs overflow-hidden"
                >
                  <div className="px-4 py-3 bg-neutral-50/90 border-b border-neutral-200 flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-neutral-700" />
                      <span>Database Promo Codes ({promoList.length})</span>
                    </h3>
                    <span className="text-xs text-neutral-500 font-medium">
                      Pulled directly from Firestore
                    </span>
                  </div>

                  {isPromoLoading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-neutral-400 mx-auto mb-2" />
                      <p className="text-xs text-neutral-600 font-medium">Syncing promo codes from database...</p>
                    </div>
                  ) : promoList.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 text-xs sm:text-sm">
                      No promo codes found in database. Create one using the form above.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      <AnimatePresence>
                        {promoList.map((promo) => {
                          const isDeleting = deletingCode === promo.code;
                          const isCopied = copiedCode === promo.code;

                          return (
                            <motion.div
                              key={promo.code}
                              id={`promo-item-${promo.code}`}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.16 }}
                              className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                                promo.active ? 'hover:bg-neutral-50/50' : 'bg-neutral-50/60 opacity-70'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <motion.button
                                  id={`btn-copy-promo-${promo.code}`}
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCopyCode(promo.code)}
                                  className="group font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-md bg-neutral-900 text-white tracking-wider shrink-0 shadow-2xs flex items-center gap-1.5 hover:bg-black cursor-pointer transition-colors"
                                  title="Click to copy promo code"
                                >
                                  <span>{promo.code}</span>
                                  {isCopied ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                                  )}
                                </motion.button>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                                      {promo.label}
                                    </h4>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                                      {promo.type === 'percent' ? `${promo.value}% OFF` : `₹${promo.value} FLAT`}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-500 mt-0.5">
                                    Min Order: {promo.minOrderValue > 0 ? formatINR(promo.minOrderValue) : 'No minimum'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {/* Toggle Active Button */}
                                <motion.button
                                  id={`btn-toggle-promo-active-${promo.code}`}
                                  type="button"
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleTogglePromoActive(promo)}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border transition-colors shadow-2xs ${
                                    promo.active
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                                  }`}
                                  title={promo.active ? 'Click to deactivate' : 'Click to activate'}
                                >
                                  {promo.active ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Inactive</span>
                                    </>
                                  )}
                                </motion.button>

                                {/* Remove / Delete Promo Button */}
                                <motion.button
                                  id={`btn-delete-promo-${promo.code}`}
                                  type="button"
                                  disabled={isDeleting}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleDeletePromo(promo.code)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-bold border border-rose-200 hover:border-rose-300 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                                  title={`Permanently delete promo code ${promo.code} from Firebase`}
                                >
                                  {isDeleting ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>Remove</span>
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const AdminCanvas = React.memo(AdminCanvasComponent);

