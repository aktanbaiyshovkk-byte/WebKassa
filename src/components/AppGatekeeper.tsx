import React, { useState } from 'react';
import { ShieldAlert, Building2, KeyRound, Languages, Check, ArrowRight, HelpCircle } from 'lucide-react';
import { Store } from '../types';
import { Language } from '../translations';

interface AppGatekeeperProps {
  stores: Store[];
  onUnlockSuperAdmin: () => void;
  onEnterStore: (storeId: string) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export default function AppGatekeeper({
  stores,
  onUnlockSuperAdmin,
  onEnterStore,
  lang,
  onLangChange
}: AppGatekeeperProps) {
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const localPhrases = {
    title: {
      ru: 'Веб-Касса Cloud POS',
      ky: 'Cloud POS Веб-Кассасы'
    },
    subtitle: {
      ru: 'Авторизация в единую сеть терминалов самообслуживания и учета',
      ky: 'Бирдиктүү эсепке алуу жана терминалдар тармагына кирүү'
    },
    cardHeader: {
      ru: 'ВХОД В СИСТЕМУ',
      ky: 'ТУТУМГА КИРҮҮ'
    },
    inputLabel: {
      ru: 'Код филиала или PIN суперадмина',
      ky: 'Филиалдын коду же суперадминдин PIN-коду'
    },
    inputPlaceholder: {
      ru: 'Введите 101, 102, 103 или код...',
      ky: '101, 102, 103 же кодду киргизиңиз...'
    },
    btnSubmit: {
      ru: 'Открыть терминал',
      ky: 'Терминалды ачуу'
    },
    errorInvalid: {
      ru: 'Указанный код доступа не зарегистрирован в POS-Cloud!',
      ky: 'Көрсөтүлгөн кирүү коду POS-Cloud тутумунда катталган эмес!'
    },
    hintHeader: {
      ru: 'Памятка учетных записей для теста:',
      ky: 'Тест үчүн колдонуучу коддордун тизмеси:'
    },
    hintAdmin: {
      ru: 'Мастер-PIN суперадминистратора: 7777 (доступ ко всему порталу и аналитике)',
      ky: 'Суперадминистратордун मास्टर-PINи: 7777 (жалпы порталга жана аналитикага өтүү)'
    },
    hintStore1: {
      ru: 'Мини-маркет "Ала-Тоо" (Код: 101)',
      ky: 'Мини-маркет "Ала-Тоо" (Коду: 101)'
    },
    hintStore2: {
      ru: 'Фоновая точка "Фрунзе Экспресс" (Код: 102)',
      ky: 'Фонодук түйүн "Фрунзе Экспресс" (Коду: 102)'
    },
    hintStore3: {
      ru: 'Иммерсивный филиал "Оомат" (Код: 103)',
      ky: 'Иммерсивдүү филиал "Оомат" (Коду: 103)'
    },
    footerLic: {
      ru: 'Безопасность данных гарантирована сквозной контейнерной изоляцией баз данных.',
      ky: 'Маалыматтардын коопсуздугу маалымат базаларынын контейнердик изоляциясы менен кепилденет.'
    }
  };

  const tLocal = (key: keyof typeof localPhrases) => {
    return localPhrases[key]?.[lang] || key;
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const codeClean = accessCode.trim().toLowerCase();

    if (!codeClean) {
      setErrorMsg(lang === 'ky' ? 'Кодду киргизиңиз!' : 'Пожалуйста, введите код доступа!');
      return;
    }

    // 1. Check Superadmin unlock
    if (codeClean === '7777' || codeClean === 'adminadmin') {
      onUnlockSuperAdmin();
      return;
    }

    // 2. Check stores codes
    const matchingStore = stores.find(s => {
      const matchId = s.id.toLowerCase() === codeClean;
      const matchCode = s.code && s.code.toLowerCase() === codeClean;
      // Also fallback: partial store name matching if they type exactly lowercase name digits
      const matchNameLower = s.name.toLowerCase().includes(codeClean) && codeClean.length >= 3;
      return matchId || matchCode || matchNameLower;
    });

    if (matchingStore) {
      if (matchingStore.isBlocked) {
        setErrorMsg(lang === 'ky' ? 'Бул соода түйүнү бөгөттөлгөн!' : 'Этот филиал временно заблокирован управляющей компанией!');
        return;
      }
      onEnterStore(matchingStore.id);
    } else {
      setErrorMsg(tLocal('errorInvalid'));
    }
  };

  const handleQuickFill = (code: string) => {
    setAccessCode(code);
    setErrorMsg(null);
  };

  return (
    <div id="gatekeeper-layout" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* GATEKEEPER TOP HEADER */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-200 uppercase">{tLocal('title')}</h1>
            <p className="text-[10px] text-slate-500 font-medium">{tLocal('subtitle')}</p>
          </div>
        </div>
        
        {/* Languages changer */}
        <div className="flex items-center bg-slate-900 border border-slate-850 p-1 rounded-xl">
          <button
            onClick={() => onLangChange('ru')}
            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              lang === 'ru' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => onLangChange('ky')}
            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              lang === 'ky' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            КЫР
          </button>
        </div>
      </header>

      {/* CORE GATE CARD */}
      <main className="max-w-xl mx-auto w-full my-auto py-8 flex flex-col gap-6 items-center">
        
        <div className="text-center max-w-sm mb-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center shadow-inner mb-3">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{lang === 'ky' ? 'Авторизация тутуму' : 'Система авторизации'}</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {lang === 'ky' 
              ? 'Жеке кассалык терминалдарга кирүү үчүн коопсуз шлюз' 
              : 'Безопасный шлюз для входа в изолированные торговые терминалы'}
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-3xl p-5 sm:p-6 w-full shadow-xl">
          
          <div className="text-center mb-4">
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono">
              ⚡ {tLocal('cardHeader')}
            </span>
          </div>

          <form onSubmit={handleGateSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 text-center">
                {tLocal('inputLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={20}
                  placeholder={tLocal('inputPlaceholder')}
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center font-bold text-sm tracking-wide text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10.5px] font-bold flex items-center gap-2 leading-relaxed justify-center">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{tLocal('btnSubmit')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Interactive Testing Hints */}
        <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-4 w-full text-indigo-200 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-extrabold mb-2 uppercase tracking-wide font-mono text-[9px]">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{tLocal('hintHeader')}</span>
          </div>
          <div className="space-y-2.5 font-medium text-slate-450 selection:bg-transparent">
            {/* Quick click helper triggers */}
            <button
              onClick={() => handleQuickFill('7777')}
              className="w-full text-left font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 border border-slate-800/20 hover:border-indigo-500/20 hover:bg-indigo-950/25 p-1.5 rounded-lg w-full text-left"
            >
              <span className="bg-indigo-500/20 text-indigo-300 font-mono px-1 py-0.5 rounded border border-indigo-500/30">7777</span>
              <span className="truncate">{tLocal('hintAdmin')}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-900/50">
              <button
                onClick={() => handleQuickFill('101')}
                className="text-left font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 border border-slate-800/20 hover:border-emerald-500/25 hover:bg-emerald-950/15 p-1.5 rounded-lg"
              >
                <span className="bg-emerald-500/25 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/10">101</span>
                <span className="truncate text-[10px]">{tLocal('hintStore1')}</span>
              </button>

              <button
                onClick={() => handleQuickFill('102')}
                className="text-left font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 border border-slate-800/20 hover:border-emerald-500/25 hover:bg-emerald-950/15 p-1.5 rounded-lg"
              >
                <span className="bg-emerald-500/25 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/10">102</span>
                <span className="truncate text-[10px]">{tLocal('hintStore2')}</span>
              </button>

              <button
                onClick={() => handleQuickFill('103')}
                className="text-left font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 border border-slate-800/20 hover:border-emerald-500/25 hover:bg-emerald-950/15 p-1.5 rounded-lg"
              >
                <span className="bg-emerald-500/25 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/10">103</span>
                <span className="truncate text-[10px]">{tLocal('hintStore3')}</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-2xl mx-auto w-full text-center py-2 text-slate-600 text-[10px] border-t border-slate-950/80">
        <p>{tLocal('footerLic')}</p>
      </footer>

    </div>
  );
}
