import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, HelpCircle, AlertCircle, Sparkles, Volume2, Keyboard } from 'lucide-react';
import { Product } from '../types';
import { Language, translations } from '../translations';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  productList: Product[];
  lang?: Language;
}

export default function BarcodeScanner({ onScan, productList, lang = 'ru' }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-viewport";

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  // Web Audio Context-based Beep sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(950, audioCtx.currentTime); // Crisp Scanner Beep

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn("Audio feedback not supported yet or requires interaction: ", e);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    playBeep();
    
    // Find product name for visual feedback
    const foundProduct = productList.find(p => p.barcode === barcode);
    if (foundProduct) {
      setFlashMessage(`${t('scannerSuccess')}: ${foundProduct.name}`);
    } else {
      setFlashMessage(`${t('scannerNotFound')}: ${barcode}`);
    }

    setTimeout(() => {
      setFlashMessage(null);
    }, 2500);

    onScan(barcode);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeScanned(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const stopCamera = async () => {
    if (html5QrcodeRef.current) {
      if (html5QrcodeRef.current.isScanning) {
        try {
          await html5QrcodeRef.current.stop();
        } catch (err) {
          console.error("Погрешность остановки камеры:", err);
        }
      }
      html5QrcodeRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    // Give react time to mount the DOM element
    setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode(scannerId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              // Narrow box for linear barcodes
              const boxWidth = Math.min(width * 0.85, 300);
              const boxHeight = Math.min(height * 0.4, 130);
              return { width: boxWidth, height: boxHeight };
            },
            aspectRatio: 1.7777778 // 16:9 widescreen
          },
          (decodedText) => {
            handleBarcodeScanned(decodedText);
          },
          () => {
            // normal failure during scanning (no barcode in frame)
          }
        );
      } catch (err: any) {
        console.error("Ошибка при старте сканера камеры:", err);
        setCameraError(
          lang === 'ky' 
            ? "Камераны иштетүүгө мүмкүн болбоду. Браузерден уруксаттарды текшериңиз же симуляторду колдонуңуз."
            : "Не удалось запустить камеру. Проверьте права доступа в браузере или используйте симулятор ниже."
        );
        setIsCameraActive(false);
      }
    }, 150);
  };

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(err => console.error("Unmount camera stop err:", err));
      }
    };
  }, []);

  // Filter items for Simulator Search
  const filteredSimulatorProducts = productList.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('scanTitle')}</h3>
            <p className="text-[11px] text-slate-500">{t('scanSubtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => isCameraActive ? stopCamera() : startCamera()}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            isCameraActive 
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-100'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          {isCameraActive ? t('btnCamOff') : t('btnCamOn')}
        </button>
      </div>

      {/* FLASH MESSAGE FOR POSITIVE SCAN */}
      {flashMessage && (
        <div className={`p-3 text-center text-xs font-semibold rounded-lg animate-bounce transition-all ${
          flashMessage.includes('не найден') || flashMessage.includes('былбоду') || flashMessage.includes('табылган жок')
            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <div className="flex items-center justify-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{flashMessage}</span>
          </div>
        </div>
      )}

      {/* CAMERA VIEWER AREA */}
      {isCameraActive && (
        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-emerald-300 bg-slate-950 flex flex-col justify-center items-center h-48 sm:h-56">
          <div id={scannerId} className="w-full h-full bg-black"></div>
          
          {/* Scanning Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            <div className="flex justify-between">
              <div className="border-t-4 border-l-4 border-emerald-500 w-6 h-6 rounded-tl"></div>
              <div className="border-t-4 border-r-4 border-emerald-500 w-6 h-6 rounded-tr"></div>
            </div>
            {/* Red Laser Line */}
            <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.7)] animate-[pulse_1s_infinite]"></div>
            <div className="flex justify-between">
              <div className="border-b-4 border-l-4 border-emerald-500 w-6 h-6 rounded-bl"></div>
              <div className="border-b-4 border-r-4 border-emerald-500 w-6 h-6 rounded-br"></div>
            </div>
          </div>
          
          <div className="absolute bottom-2 text-[10px] text-white/80 bg-slate-900/80 px-2 py-0.5 rounded-full pointer-events-none">
            {t('cameraGuide')}
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-rose-700 leading-relaxed">
            {cameraError}
          </div>
        </div>
      )}

      {/* MANUAL BARCODE INPUT */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Keyboard className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t('manualScanPlaceholder')}
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 placeholder-slate-400"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 rounded-xl transition-all cursor-pointer font-medium"
        >
          {t('btnInputShort')}
        </button>
      </form>

      {/* RAPID SIMULATOR PANEL */}
      <div className="mt-1 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 font-bold" />
            <h4 className="text-xs font-bold text-slate-700">{t('simHeader')}</h4>
          </div>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" title={lang === 'ky' ? "Корзинага кошуу үчүн каалаган товарды тандаңыз." : "Нажмите на любой товар, чтобы имитировать мгновенный 'писк' сканера."} />
        </div>
        
        <p className="text-[11px] text-slate-500 leading-normal mb-3">
          {t('simDescription')}
        </p>

        {/* Search simulation items */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-3 h-3" />
          </span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* Grid of simulator chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
          {filteredSimulatorProducts.map(product => (
            <button
              key={product.id}
              onClick={() => handleBarcodeScanned(product.barcode)}
              className="group text-left p-2 bg-white hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 rounded-lg shadow-sm transition-all text-[11px] cursor-pointer flex flex-col justify-between min-h-[54px] hover:-translate-y-0.5"
            >
              <div className="font-medium text-slate-700 truncate line-clamp-1 group-hover:text-emerald-800" title={product.name}>
                {product.name}
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px]">
                <span className="text-emerald-600 font-semibold">{product.price} сом</span>
                <span className="font-mono text-slate-400 group-hover:text-slate-600 bg-slate-50 group-hover:bg-emerald-100 px-1 py-0.2 rounded">
                  {product.barcode.slice(-5)}
                </span>
              </div>
            </button>
          ))}
          {filteredSimulatorProducts.length === 0 && (
            <div className="text-center col-span-full py-3 text-[11px] text-slate-400">
              {lang === 'ky' ? 'Товарлар табылган жок' : 'Товары не найдены'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

