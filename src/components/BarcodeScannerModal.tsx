'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Camera, 
  X, 
  Search, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Plus, 
  RotateCcw,
  Package
} from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => void;
  mealType: string;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onProductFound,
  mealType,
}: BarcodeScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [servingGrams, setServingGrams] = useState<number>(100);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Popular Bulgarian, Lidl & Kaufland sample barcodes for quick testing
  const sampleBarcodes = [
    { label: '💛 Lidl Milbona Protein Пудинг (200г)', code: '4056489115792' },
    { label: '💛 Lidl Pilos Котидж Сирене (200г)', code: '20317379' },
    { label: '💛 Lidl Pilos Кисело мляко 2% (400г)', code: '20140236' },
    { label: '💛 Lidl Dulano Пуешко филе (100г)', code: '4056489370016' },
    { label: '❤️ Kaufland K-Classic Skyr (500г)', code: '4337185489027' },
    { label: '❤️ Kaufland K-Classic Cottage (200г)', code: '4337185361002' },
    { label: '❤️ Kaufland K-Classic Извара (250г)', code: '4337185124010' },
    { label: '🇧🇬 Верея Кисело мляко 2% (400г)', code: '3800000600021' },
    { label: '🇧🇬 Olympus Котидж Сирене (200г)', code: '5201509001321' },
    { label: '🇧🇬 Булгареа Нискомаслена Извара (250г)', code: '3800214420019' },
    { label: '🇧🇬 Бор Чвор Скир 0% (350г)', code: '3800030501145' },
    { label: '🇧🇬 Биосет Овесени ядки фини (500г)', code: '3800206540022' },
  ];

  // Start Camera scanning
  useEffect(() => {
    if (!isOpen || activeTab !== 'CAMERA') {
      stopCamera();
      return;
    }

    let isSubscribed = true;

    async function startCameraScanner() {
      setErrorMsg(null);
      try {
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        if (videoRef.current) {
          setCameraActive(true);
          await codeReader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, err) => {
              if (result && isSubscribed) {
                const text = result.getText();
                handleLookupBarcode(text);
              }
            }
          );
        }
      } catch (err: any) {
        console.warn('Camera error:', err);
        setCameraActive(false);
        setErrorMsg('Няма достъп до камерата. Можете да въведете баркода ръчно или да изберете примерен продукт отдолу.');
      }
    }

    startCameraScanner();

    return () => {
      isSubscribed = false;
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        // Stop stream
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setCameraActive(false);
  };

  const handleLookupBarcode = async (code: string) => {
    if (!code || loading) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Продуктът не е намерен в базата данни. Опитайте с ръчно въвеждане.');
        setScannedProduct(null);
      } else {
        setScannedProduct(data);
        setServingGrams(data.packageGrams || 100);
      }
    } catch (err) {
      setErrorMsg('Мрежова грешка при търсене на продукта.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScannedFood = () => {
    if (!scannedProduct) return;
    const ratio = servingGrams / 100;
    const p100 = scannedProduct.per100g;

    const scaled = {
      foodName: `${scannedProduct.productName}${scannedProduct.brand ? ` (${scannedProduct.brand})` : ''} - ${servingGrams}г`,
      calories: Math.round(p100.calories * ratio),
      protein: parseFloat((p100.protein * ratio).toFixed(1)),
      carbs: parseFloat((p100.carbs * ratio).toFixed(1)),
      fats: parseFloat((p100.fats * ratio).toFixed(1)),
    };

    onProductFound(scaled);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-1 border border-border rounded-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Баркод Скенер (България, Lidl, Kaufland)
              </h2>
              <p className="text-xs text-text-muted">
                Сканирайте баркод за автоматично извличане на калории и макроси
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg bg-surface-2 text-text-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-surface-2 p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('CAMERA')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'CAMERA' ? 'bg-white text-black shadow-sm' : 'text-text-muted hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Скенер с Камера На Живо
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('MANUAL');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'MANUAL' ? 'bg-white text-black shadow-sm' : 'text-text-muted hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Ръчен Код / Български & Lidl / Kaufland
          </button>
        </div>

        {/* Live Camera View */}
        {activeTab === 'CAMERA' && (
          <div className="space-y-3">
            <div className="relative w-full h-56 rounded-2xl bg-black overflow-hidden border border-border flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Viewfinder Overlay Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-52 h-32 border-2 border-blue-400/70 rounded-xl relative">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>

                  {/* Scanning Laser Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                </div>
              </div>

              {!cameraActive && !errorMsg && (
                <div className="absolute inset-0 bg-surface-2/90 flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="w-8 h-8 text-text-muted mb-2 animate-bounce" />
                  <span className="text-xs text-text-secondary">Зареждане на достъп до камерата...</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center text-text-muted font-mono">
              Позиционирайте баркода вътре в рамката. Камерата сканира автоматично.
            </p>
          </div>
        )}

        {/* Manual Barcode / Sample Tester */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookupBarcode(manualCode);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Въведете цифри от баркода (напр. 4056489115792)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm font-mono text-white focus:outline-none focus:border-white/40"
              />
              <button
                type="submit"
                disabled={!manualCode.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Търси
              </button>
            </form>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Кликнете за бърз тест с продукти от Lidl, Kaufland и български марки:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleBarcodes.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setManualCode(item.code);
                      handleLookupBarcode(item.code);
                    }}
                    className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="text-white font-medium truncate">{item.label}</span>
                    <span className="text-[10px] text-text-muted font-mono ml-2">{item.code.slice(0, 6)}...</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-center gap-3 text-xs text-text-secondary font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            Търсене в българската, Lidl & Kaufland база данни...
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Found Product Result Card */}
        {scannedProduct && (
          <div className="p-4 rounded-2xl bg-surface-2 border border-emerald-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-3 border border-border flex items-center justify-center text-white shrink-0 overflow-hidden">
                  {scannedProduct.imageUrl ? (
                    <img src={scannedProduct.imageUrl} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                    Намерен продукт
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{scannedProduct.productName}</h3>
                  {scannedProduct.brand && (
                    <p className="text-xs text-text-muted">{scannedProduct.brand}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Serving Size: Exact Grams Input, Slider & "Цялото" Option */}
            <div className="p-3.5 rounded-xl bg-surface-3 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary font-medium">Колко грама изядохте?</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="3000"
                    value={servingGrams}
                    onChange={(e) => setServingGrams(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2.5 py-1 text-right font-mono font-bold text-sm bg-surface-1 border border-border rounded-lg text-white focus:outline-none focus:border-white/50"
                  />
                  <span className="text-xs text-text-muted font-bold">г</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="10"
                max="1000"
                step="5"
                value={servingGrams}
                onChange={(e) => setServingGrams(parseInt(e.target.value) || 100)}
                className="w-full accent-blue-500 cursor-pointer"
              />

              {/* Quick Gram Buttons + "Цялото" button */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {scannedProduct.packageGrams && (
                  <button
                    type="button"
                    onClick={() => setServingGrams(scannedProduct.packageGrams)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      servingGrams === scannedProduct.packageGrams
                        ? 'bg-emerald-500 text-black shadow'
                        : 'bg-surface-2 text-emerald-400 hover:bg-surface-1 border border-emerald-500/30'
                    }`}
                  >
                    ⭐ Цялото ({scannedProduct.packageGrams}г)
                  </button>
                )}
                {!scannedProduct.packageGrams && (
                  <button
                    type="button"
                    onClick={() => setServingGrams(400)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-2 text-emerald-400 hover:bg-surface-1 border border-emerald-500/30"
                  >
                    ⭐ Цялото (400г)
                  </button>
                )}
                <button type="button" onClick={() => setServingGrams(50)} className={`px-2 py-1 rounded-lg text-[11px] font-mono ${servingGrams === 50 ? 'bg-white text-black font-bold' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>50г</button>
                <button type="button" onClick={() => setServingGrams(100)} className={`px-2 py-1 rounded-lg text-[11px] font-mono ${servingGrams === 100 ? 'bg-white text-black font-bold' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>100г</button>
                <button type="button" onClick={() => setServingGrams(150)} className={`px-2 py-1 rounded-lg text-[11px] font-mono ${servingGrams === 150 ? 'bg-white text-black font-bold' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>150г</button>
                <button type="button" onClick={() => setServingGrams(200)} className={`px-2 py-1 rounded-lg text-[11px] font-mono ${servingGrams === 200 ? 'bg-white text-black font-bold' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>200г</button>
                <button type="button" onClick={() => setServingGrams(250)} className={`px-2 py-1 rounded-lg text-[11px] font-mono ${servingGrams === 250 ? 'bg-white text-black font-bold' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>250г</button>
                <button type="button" onClick={() => setServingGrams(500)} className={`px-2 py-1 rounded-lg text-[11px] font-mono ${servingGrams === 500 ? 'bg-white text-black font-bold' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>500г</button>
              </div>
            </div>

            {/* Calculated Macros for Chosen Grams */}
            {(() => {
              const ratio = servingGrams / 100;
              const p100 = scannedProduct.per100g;
              const cal = Math.round(p100.calories * ratio);
              const p = (p100.protein * ratio).toFixed(1);
              const c = (p100.carbs * ratio).toFixed(1);
              const f = (p100.fats * ratio).toFixed(1);

              return (
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xl bg-surface-3 border border-border">
                    <div className="text-[10px] text-text-muted uppercase">Калории</div>
                    <div className="text-sm font-bold text-white mt-0.5">{cal}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-3 border border-border">
                    <div className="text-[10px] text-blue-400 uppercase">Протеин</div>
                    <div className="text-sm font-bold text-white mt-0.5">{p}г</div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-3 border border-border">
                    <div className="text-[10px] text-emerald-400 uppercase">Въглехидрати</div>
                    <div className="text-sm font-bold text-white mt-0.5">{c}г</div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-3 border border-border">
                    <div className="text-[10px] text-amber-400 uppercase">Мазнини</div>
                    <div className="text-sm font-bold text-white mt-0.5">{f}г</div>
                  </div>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={handleAddScannedFood}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Добави в Хранителния Дневник
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
