import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Check, Clipboard, AlertCircle, FileCode, ArrowRight, FileUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { parseImportInput, ParsedImportResult } from '../../utils/invoiceCode';

interface ImportModalProps {
  onClose: () => void;
  onApply: (parsed: ParsedImportResult) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onApply }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>('');
  const [copiedFromClipboard, setCopiedFromClipboard] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus and select input on mount
    inputRef.current?.focus();

    const handleModalPaste = (e: ClipboardEvent) => {
      // If user is already focused on the input, let native paste work naturally
      if (document.activeElement === inputRef.current) return;
      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        e.preventDefault();
        const trimmed = text.trim();
        setInputValue(trimmed);
        setLoadedFileName(null);
        setErrorMsg(null);
        setCopiedFromClipboard(true);
        setTimeout(() => setCopiedFromClipboard(false), 1800);
      }
    };

    window.addEventListener('paste', handleModalPaste);
    return () => window.removeEventListener('paste', handleModalPaste);
  }, []);

  const parsedResult: ParsedImportResult | null = React.useMemo(() => {
    if (!inputValue.trim()) return null;
    return parseImportInput(inputValue);
  }, [inputValue]);

  const processFile = (file: File) => {
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const trimmed = content.trim();
        const res = parseImportInput(trimmed);
        if (res) {
          setInputValue(res.invoiceNumber || res.itemCode);
          setLoadedFileName(file.name);
          setErrorMsg(null);
        } else {
          setErrorMsg(t('modals.import.fileParseError', { defaultValue: 'Could not find a valid Speedabraker configuration or code in "{{fileName}}".', fileName: file.name }));
        }
      }
    };
    reader.onerror = () => {
      setErrorMsg(t('modals.import.fileReadError', 'Could not read the selected file.'));
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      window.focus();
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputValue(text.trim());
          setLoadedFileName(null);
          setErrorMsg(null);
          setCopiedFromClipboard(true);
          setTimeout(() => setCopiedFromClipboard(false), 1800);
          return;
        }
      }
      setErrorMsg(t('modals.import.clipboardEmpty', 'Clipboard was empty or contained no readable text.'));
    } catch {
      // Direct clipboard reading is blocked by browser permissions policy (especially inside sandboxed iframes)
      inputRef.current?.focus();
      inputRef.current?.select();
      setErrorMsg(t('modals.import.clipboardRestricted', 'Browser restricted automatic clipboard reading. Press Ctrl+V (or ⌘V) to paste directly.'));
    }
  };

  const handleApply = () => {
    if (!parsedResult) {
      setErrorMsg(t('modals.import.invalidPrompt', 'Please enter a valid 3-character item code, full invoice ID, or upload a .sbs file.'));
      return;
    }
    onApply(parsedResult);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && parsedResult) {
      handleApply();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <motion.div
      id="import-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4"
    >
      <motion.div
        id="import-dialog"
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-md w-full relative text-left"
      >
        {/* Close Button */}
        <motion.button
          id="btn-close-import-modal"
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          title={t('common.close', 'Close')}
        >
          <X className="w-4 h-4" />
        </motion.button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200">
            <Upload className="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {t('modals.import.title', 'Import Configuration')}
            </h3>
            <p className="text-xs text-neutral-500">
              {t('modals.import.subtitle', 'Upload a .sbs file or enter an item code / invoice ID')}
            </p>
          </div>
        </div>

        {/* Drag and Drop File Upload Area */}
        <div
          id="dropzone-sbs-file"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3.5 mb-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? 'border-neutral-900 bg-neutral-100/90 scale-[1.01]'
              : loadedFileName
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-100 hover:border-neutral-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".sbs,.json,text/plain,application/json,*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          {loadedFileName ? (
            <div className="flex items-center gap-2 text-emerald-800">
              <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-mono font-semibold truncate max-w-[240px]">
                {loadedFileName}
              </span>
              <span className="text-[10px] bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                {t('modals.import.loaded', 'Loaded')}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-neutral-700">
                <FileUp className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-semibold">{t('modals.import.dropFile', 'Drop your .sbs or .json file here')}</span>
                <span className="text-neutral-400 text-xs">{t('modals.import.orBrowse', 'or browse')}</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {t('modals.import.formatTip', 'Supports standard and custom .sbs or .json configuration files')}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="h-px bg-neutral-200 flex-1" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">
            {t('modals.import.orEnterManually', 'or enter code manually')}
          </span>
          <div className="h-px bg-neutral-200 flex-1" />
        </div>

        {/* Input & Paste Section */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
            <label htmlFor="import-code-input">{t('modals.import.codeLabel', 'Item Code or Invoice ID')}</label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 hover:text-neutral-950 font-medium hover:underline cursor-pointer"
            >
              {copiedFromClipboard ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">{t('modals.import.pasted', 'Pasted!')}</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3 h-3 text-neutral-500" />
                  <span>{t('modals.import.pasteClipboard', 'Paste clipboard')}</span>
                  <span className="text-[10px] font-mono font-semibold px-1 py-0.2 bg-neutral-100 border border-neutral-300 rounded text-neutral-500">
                    Ctrl+V
                  </span>
                </>
              )}
            </motion.button>
          </div>

          <div className="relative">
            <input
              id="import-code-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setLoadedFileName(null);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('modals.import.placeholder', 'e.g. 7KF or SBS-7KF-8K2X4P')}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono tracking-wider text-neutral-900 placeholder:text-neutral-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all uppercase"
              autoComplete="off"
              spellCheck={false}
            />
            {inputValue && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setInputValue('');
                  setLoadedFileName(null);
                  setErrorMsg(null);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
                title={t('common.clear', 'Clear')}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Validation / Error Feedback */}
        {errorMsg && (
          <div className="mb-4">
            <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errorMsg}
            </p>
          </div>
        )}

        {!parsedResult && inputValue.trim() && (
          <div className="mb-4 bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {t('modals.import.unrecognizedPrompt', 'Unrecognized format. Enter a 3-character item code (e.g. 7KF) or a full invoice ID (e.g. SBS-7KF-8K2X4P).')}
            </p>
          </div>
        )}

        {!inputValue.trim() && !errorMsg && (
          <div className="mb-4 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-500 flex items-start gap-2">
            <FileCode className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <span className="font-semibold text-neutral-700">{t('modals.import.tip', 'Tip')}:</span> {t('modals.import.tipText', 'Item code applies hardware configuration directly. Full invoice ID also unlocks and displays the complete bill view.')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <motion.button
            id="btn-cancel-import"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-300 cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </motion.button>
          <motion.button
            id="btn-confirm-import"
            type="button"
            whileHover={parsedResult ? { scale: 1.02 } : undefined}
            whileTap={parsedResult ? { scale: 0.98 } : undefined}
            onClick={handleApply}
            disabled={!parsedResult}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              parsedResult
                ? 'bg-neutral-900 hover:bg-black text-white active:scale-98'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <span>{parsedResult?.type === 'invoice' ? t('modals.import.applyAndViewBill', 'Apply & View Bill') : t('modals.import.applyConfig', 'Apply Configuration')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

