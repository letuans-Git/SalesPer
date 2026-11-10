import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle,
  ExternalLink,
  Apple,
} from 'lucide-react';
import { usePWAInstall } from '../services/usePWAInstall';
import { useLanguage } from '../services/i18n';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { language } = useLanguage();
  const { isInstallable, isInstalled, isIOS, isAndroid, isMobile, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside standalone PWA mode, show nothing or quiet badge
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowGuide(true);
    }
  };

  const buttonLabel =
    language === 'vi'
      ? isIOS
        ? 'Cài đặt iOS'
        : isAndroid
        ? 'Cài App Android'
        : 'Cài đặt App'
      : isIOS
      ? 'Install on iOS'
      : isAndroid
      ? 'Install App'
      : 'Install App';

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isInstalling}
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 hover:text-white transition-all cursor-pointer shadow-sm shrink-0 active:scale-95 ${className}`}
        title={
          language === 'vi'
            ? 'Cài đặt ứng dụng lên màn hình chính điện thoại iOS / Android hoặc máy tính'
            : 'Install application to iOS / Android Home Screen or Desktop'
        }
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
        <span className="hidden sm:inline font-medium">{buttonLabel}</span>
        <span className="sm:hidden font-medium">{language === 'vi' ? 'Cài App' : 'Install'}</span>
      </button>

      {/* Cross-Browser & Mobile Installation Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'vi' ? 'Cài Đặt App Lên Điện Thoại' : 'Install App on Mobile'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'vi'
                      ? 'Mở nhanh toàn màn hình trên iOS Safari & Android'
                      : 'Quick full-screen access on iOS Safari & Android'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* iOS Guide */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Apple className="w-4 h-4 text-slate-300" />
                  <span>{language === 'vi' ? 'Dành cho iPhone / iPad (iOS Safari)' : 'For iPhone / iPad (iOS Safari)'}</span>
                </div>
                <ol className="space-y-2 text-slate-300 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      {language === 'vi' ? (
                        <>
                          Bấm nút <strong>Chia sẻ</strong> (<Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> biểu tượng ô vuông có mũi tên lên) ở thanh công cụ dưới Safari.
                        </>
                      ) : (
                        <>
                          Tap the <strong>Share</strong> button (<Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> square with arrow) on Safari toolbar.
                        </>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      {language === 'vi' ? (
                        <>
                          Cuộn xuống và chọn <strong>&ldquo;Thêm vào MH chính&rdquo;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> Add to Home Screen).
                        </>
                      ) : (
                        <>
                          Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />).
                        </>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      {language === 'vi'
                        ? 'Bấm "Thêm" (Add) ở góc trên bên phải. Biểu tượng Chinfon BI sẽ xuất hiện trên màn hình điện thoại.'
                        : 'Tap "Add" in the top-right corner. The Chinfon BI icon will appear on your Home Screen.'}
                    </span>
                  </li>
                </ol>
              </div>

              {/* Android Guide */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'vi' ? 'Dành cho điện thoại Android (Chrome / Samsung Internet)' : 'For Android (Chrome / Samsung Internet)'}</span>
                </div>
                <ol className="space-y-2 text-slate-300 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      {language === 'vi'
                        ? 'Bấm vào biểu tượng menu (3 dấu chấm dọc ⋮) ở góc trên bên phải trình duyệt Chrome.'
                        : 'Tap the menu icon (3 vertical dots ⋮) in top right corner of Chrome.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      {language === 'vi'
                        ? 'Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính" (Install app / Add to Home screen).'
                        : 'Select "Install app" or "Add to Home screen".'}
                    </span>
                  </li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {language === 'vi' ? 'Đã Hiểu & Đóng' : 'Got It & Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
