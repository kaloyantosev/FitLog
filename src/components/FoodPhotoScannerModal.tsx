'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Utensils, 
  Flame, 
  Zap, 
  Droplets,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';

interface FoodPhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealRecognized: (meal: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => void;
  mealType: string;
}

export default function FoodPhotoScannerModal({
  isOpen,
  onClose,
  onMealRecognized,
  mealType,
}: FoodPhotoScannerModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setImageSrc(null);
      setAiAnalysisResult(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    setImageSrc(null);
    setAiAnalysisResult(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.warn('Camera access denied or unavailable:', e);
      setIsCameraActive(false);
      setErrorMsg('Няма достъп до камерата. Моля, качете снимка от устройството си.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setImageSrc(base64);
      stopCamera();
      analyzeFoodImage(base64);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageSrc(base64);
      stopCamera();
      analyzeFoodImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFoodImage = async (base64: string) => {
    setLoading(true);
    setErrorMsg(null);
    setAiAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/food-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Неуспешен анализ на снимката на ястието.');
      } else {
        setAiAnalysisResult(data);
      }
    } catch (err) {
      setErrorMsg('Мрежова грешка при стартиране на AI анализ на храната.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    if (!aiAnalysisResult) return;
    onMealRecognized({
      foodName: aiAnalysisResult.dishName || 'AI Сканирано ястие',
      calories: aiAnalysisResult.totalCalories || 0,
      protein: aiAnalysisResult.totalProtein || 0,
      carbs: aiAnalysisResult.totalCarbs || 0,
      fats: aiAnalysisResult.totalFats || 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-1 border border-border rounded-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Разпознаване на Храна от Снимка
              </h2>
              <p className="text-xs text-text-muted">
                Снимайте или качете снимка на ястие за автоматично изчисляване на макронутриенти и калории
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-surface-2 text-text-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls: Snap vs Upload */}
        {!imageSrc && !isCameraActive && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="p-5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-border flex flex-col items-center justify-center gap-2 text-center transition-all group active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center text-white group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">Снимай с Камера</span>
              <span className="text-[10px] text-text-muted">Директна снимка на чинията</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-border flex flex-col items-center justify-center gap-2 text-center transition-all group active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center text-white group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">Качи Снимка</span>
              <span className="text-[10px] text-text-muted">Избери от галерия или файл</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Camera Live View */}
        {isCameraActive && (
          <div className="space-y-3">
            <div className="relative w-full h-64 rounded-2xl bg-black overflow-hidden border border-border flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 border-2 border-purple-400/50 rounded-2xl pointer-events-none"></div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-surface-2 text-text-secondary text-xs"
              >
                Отказ
              </button>
              <button
                type="button"
                onClick={captureCameraSnapshot}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 shadow-md active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Снимай & Анализирай
              </button>
            </div>
          </div>
        )}

        {/* Selected Image & Analysis State */}
        {imageSrc && (
          <div className="space-y-4">
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-border bg-black">
              <img src={imageSrc} alt="Food Snapshot" className="w-full h-full object-cover" />

              {/* Reticle Scanner Line when loading */}
              {loading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse absolute top-1/2 shadow-[0_0_12px_rgba(168,85,247,0.9)]"></div>
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                  <span className="text-xs font-mono font-semibold text-white">AI Vision: Разпознаване на съставките и порциите...</span>
                </div>
              )}
            </div>

            {!loading && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                    setAiAnalysisResult(null);
                  }}
                  className="text-xs text-text-muted hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Снимай друго ястие
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* AI Breakdown Result */}
        {aiAnalysisResult && (
          <div className="p-5 rounded-2xl bg-surface-2 border border-purple-500/30 space-y-4 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-mono">
                  Разпознато от AI Vision
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{aiAnalysisResult.dishName}</h3>
              <p className="text-xs text-text-muted mt-0.5">{aiAnalysisResult.description}</p>
            </div>

            {/* Total Macro Card */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono p-3 rounded-xl bg-surface-3 border border-border">
              <div>
                <div className="text-[10px] text-orange-400 uppercase">Калории</div>
                <div className="text-base font-bold text-white">{aiAnalysisResult.totalCalories}</div>
              </div>
              <div>
                <div className="text-[10px] text-blue-400 uppercase">Протеин</div>
                <div className="text-base font-bold text-white">{aiAnalysisResult.totalProtein}г</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 uppercase">Въглехидрати</div>
                <div className="text-base font-bold text-white">{aiAnalysisResult.totalCarbs}г</div>
              </div>
              <div>
                <div className="text-[10px] text-amber-400 uppercase">Мазнини</div>
                <div className="text-base font-bold text-white">{aiAnalysisResult.totalFats}г</div>
              </div>
            </div>

            {/* Identified Food Components */}
            {aiAnalysisResult.items && aiAnalysisResult.items.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Разбивка на съставките:
                </div>
                {aiAnalysisResult.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-surface-3/80 border border-border/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary">{item.name} ({item.portion})</span>
                    <span className="text-white font-bold">{item.calories} kcal <span className="text-text-muted text-[10px]">({item.protein}г П)</span></span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddMeal}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Добави в Хранителния Дневник
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
