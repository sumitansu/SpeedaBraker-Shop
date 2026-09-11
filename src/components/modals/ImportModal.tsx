import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Check, Clipboard, AlertCircle, FileCode, ArrowRight } from 'lucide-react';
import { parseImportInput, ParsedImportResult, decodeBoughtItemCode } from '../../utils/invoiceCode';

interface ImportModalProps {
  onClose: () => void;
  onApply: (parsed: ParsedImportResult) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onApply }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [copiedFromClipboard, setCopiedFromClipboard] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const parsedResult: ParsedImportResult | null = React.useMemo(() => {
    if (!inputValue.trim()) return null;
    return parseImportInput(inputValue);
  }, [inputValue]);

  const decodedSpec = React.useMemo(() => {
    if (!parsedResult) return null;
    try {
      return decodeBoughtItemCode(parsedResult.itemCode);
    } catch {
      return null;
    }
  }, [parsedResult]);

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputValue(text.trim());
          setErrorMsg(null);
          setCopiedFromClipboard(true);
          setTimeout(() => setCopiedFromClipboard(false), 1800);
          return;
        }
      }
      setErrorMsg('Clipboard was empty or access was denied.');
    } catch {
      setErrorMsg('Unable to access clipboard. Please paste manually into the field.');
    }
  };

  const handleApply = () => {
    if (!parsedResult) {
      setErrorMsg('Please enter a valid 3-character item code or full invoice ID.');
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
    <div
      id="import-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        id="import-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-5 sm:p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150 relative text-left"
      >
        {/* Close Button */}
        <button
          id="btn-close-import-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200">
            <Upload className="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Import Configuration
            </h3>
            <p className="text-xs text-neutral-500">
              Enter an item code or full invoice ID to restore configuration
            </p>
          </div>
        </div>

        {/* Input & Paste Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
            <label htmlFor="import-code-input">Item Code or Invoice ID</label>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 font-medium hover:underline cursor-pointer"
            >
              {copiedFromClipboard ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Pasted!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3 h-3 text-neutral-500" />
                  <span>Paste from clipboard</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              id="import-code-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 7KF or SBS-7KF-8K2X4P"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono tracking-wider text-neutral-900 placeholder:text-neutral-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all uppercase"
              autoComplete="off"
              spellCheck={false}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setErrorMsg(null);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Detected Preview / Validation Feedback */}
        <div className="min-h-[64px] mb-4">
          {parsedResult && decodedSpec ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {parsedResult.type === 'invoice'
                    ? 'Full Invoice ID Detected'
                    : 'Configuration Item Code Detected'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {parsedResult.type === 'invoice' ? (
                  <>
                    Applies hardware config (<span className="font-semibold">{decodedSpec.version}</span>
                    , Display <span className="font-semibold">{decodedSpec.display ? 'Yes' : 'No'}</span>
                    , Wireless <span className="font-semibold">{decodedSpec.wireless ? 'Yes' : 'No'}</span>
                    , {decodedSpec.slots.filter((s) => s.active).length} Antennas) and{' '}
                    <span className="font-bold underline">opens bill invoice section</span>.
                  </>
                ) : (
                  <>
                    Applies hardware config (<span className="font-semibold">{decodedSpec.version}</span>
                    , Display <span className="font-semibold">{decodedSpec.display ? 'Yes' : 'No'}</span>
                    , Wireless <span className="font-semibold">{decodedSpec.wireless ? 'Yes' : 'No'}</span>
                    , {decodedSpec.slots.filter((s) => s.active).length} Antennas).
                  </>
                )}
              </p>
            </div>
          ) : inputValue.trim() ? (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Unrecognized format. Enter a 3-character item code (e.g.{' '}
                <span className="font-mono font-bold">7KF</span>) or a full invoice ID (e.g.{' '}
                <span className="font-mono font-bold">SBS-7KF-8K2X4P</span>).
              </p>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-500 flex items-start gap-2">
              <FileCode className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-semibold text-neutral-700">Tip:</span> Item code applies
                hardware configuration directly. Full invoice ID also unlocks and displays the complete
                bill view.
              </p>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            id="btn-cancel-import"
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-import"
            type="button"
            onClick={handleApply}
            disabled={!parsedResult}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              parsedResult
                ? 'bg-neutral-900 hover:bg-black text-white active:scale-98'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <span>{parsedResult?.type === 'invoice' ? 'Apply & View Bill' : 'Apply Configuration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
