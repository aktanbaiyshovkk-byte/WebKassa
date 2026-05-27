import React, { useState } from 'react';
import { Store, SystemLog } from '../types';
import { Language } from '../translations';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Users, 
  Package, 
  Receipt, 
  Wallet, 
  ArrowRight, 
  User, 
  Calendar, 
  Grid2X2, 
  Activity, 
  CheckCircle2, 
  X,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface PortalScreenProps {
  stores: Store[];
  onSelectStore: (storeId: string) => void;
  onCreateStore: (name: string, ownerName: string, populateDemo: boolean) => void;
  onEnterSuperAdmin: () => void;
  onLogoutSuperAdmin?: () => void;
  lang: Language;
}

export default function PortalScreen({
  stores,
  onSelectStore,
  onCreateStore,
  onEnterSuperAdmin,
  onLogoutSuperAdmin,
  lang
}: PortalScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [populateDemo, setPopulateDemo] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Local inline translations for multi-store keys
  const phrases = {
    title: {
      ru: 'Облачная Сеть Касс POS',
      ky: 'Булуттук POS Кассалар Тармагы'
    },
    subtitle: {
      ru: 'Войдите в терминал своего магазина или зарегистрируйте новую торговую точку',
      ky: 'Дүкөнүңүздүн терминалына кириңиз же жаңы соода түйүнүн каттаңыз'
    },
    searchPlaceholder: {
      ru: 'Поиск магазина по названию или владельцу...',
      ky: 'Дүкөндү аты же ээси боюнча издөө...'
    },
    btnRegister: {
      ru: 'Регистрация магазина',
      ky: 'Дүкөндү каттоо'
    },
    btnSuperAdmin: {
      ru: 'Панель Владельца Системы (Суперадмин)',
      ky: 'Тутумдун ээсинин панели (Суперадмин)'
    },
    owner: {
      ru: 'Владелец: ',
      ky: 'Ээси: '
    },
    created: {
      ru: 'Создан: ',
      ky: 'Түзүлгөн: '
    },
    online: {
      ru: 'В системе',
      ky: 'Тутумда'
    },
    offline: {
      ru: 'Офлайн',
      ky: 'Офлайн'
    },
    blocked: {
      ru: 'Заблокирован',
      ky: 'Блоктолгон'
    },
    statsProducts: {
      ru: 'товаров',
      ky: 'товар'
    },
    statsSales: {
      ru: 'чеков',
      ky: 'чек'
    },
    statsDebtors: {
      ru: 'долгов',
      ky: 'карыз'
    },
    btnEnter: {
      ru: 'Войти в кассу',
      ky: 'Кассага кирүү'
    },
    modalTitle: {
      ru: 'Регистрация магазина в системе',
      ky: 'Дүкөндү тутумда каттоо'
    },
    modalDesc: {
      ru: 'Создайте изолированную базу данных для вашей торговой точки. Вы сможете добавлять кассиров, управлять складом и вести учет долгов.',
      ky: 'Өзүңүздүн соода түйүнүңүз үчүн өзүнчө маалымат базасын түзүңүз. Сиз кассирлерди кошуп, складды башкарып жана карыздарды эсептей аласыз.'
    },
    labelStoreName: {
      ru: 'Название магазина / Торговой точки',
      ky: 'Дүкөндүн / Соода түйүнүнүн аты'
    },
    placeholderStoreName: {
      ru: 'Например, "Мини-маркет Ала-Тоо"',
      ky: 'Мисалы, "Ала-Тоо мини-маркети"'
    },
    labelOwnerName: {
      ru: 'ФИО Владельца / Директора',
      ky: 'Ээсинин / Директорунун аты-жөнү'
    },
    placeholderOwnerName: {
      ru: 'Например, Асан Садыков',
      ky: 'Мисалы, Асан Садыков'
    },
    labelDemo: {
      ru: 'Заполнить стартовым каталогом товаров (для теста)',
      ky: 'Баштапкы товарлардын каталогу менен толтуруу (тест үчүн)'
    },
    btnCancel: {
      ru: 'Отмена',
      ky: 'Жокко чыгаруу'
    },
    btnSubmit: {
      ru: 'Создать точку',
      ky: 'Түйүндү түзүү'
    },
    noStores: {
      ru: 'Магазины не найдены по вашему запросу',
      ky: 'Сиздин сурооңуз боюнча дүкөндөр табылган жок'
    },
    storesRegistered: {
      ru: 'Всего филиалов:',
      ky: 'Жалпы филиалдар:'
    },
    allSafeSecure: {
      ru: 'Данные каждого магазина изолированы системой безопасности POS-Cloud.',
      ky: 'Ар бир дүкөндүн маалыматтары POS-Cloud коопсуздук тутуму менен корголгон.'
    }
  };

  const tLocal = (key: keyof typeof phrases) => {
    return phrases[key]?.[lang] || key;
  };

  // Filter stores
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const nameTrim = newStoreName.trim();
    const ownerTrim = newOwnerName.trim();

    if (!nameTrim) {
      setErrorMsg(lang === 'ky' ? 'Дүкөндүн атын жазыңыз!' : 'Укажите название магазина!');
      return;
    }
    if (!ownerTrim) {
      setErrorMsg(lang === 'ky' ? 'Директордун атын жазыңыз!' : 'Укажите ФИО владельца магазина!');
      return;
    }

    // Check unique name duplicate
    if (stores.some(s => s.name.toLowerCase() === nameTrim.toLowerCase())) {
      setErrorMsg(lang === 'ky' ? 'Мындай дүкөн мурунтан эле катталган!' : 'Магазин с таким названием уже зарегистрирован!');
      return;
    }

    onCreateStore(nameTrim, ownerTrim, populateDemo);
    
    // Reset state & close
    setNewStoreName('');
    setNewOwnerName('');
    setPopulateDemo(true);
    setShowCreateModal(false);
  };

  return (
    <div id="portal-root-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

      {/* TOP PORTAL HEADER */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-md sm:text-lg font-black tracking-wider text-slate-100 uppercase">POS Multi-Cloud</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{tLocal('title')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Platform Statistics badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-slate-400 font-semibold">{tLocal('storesRegistered')}</span>
            <span className="text-[11px] text-emerald-400 font-black font-mono">{stores.length}</span>
          </div>

          {/* Master Owner System Settings Button */}
          <button
            id="btn-superadmin-dashboard"
            onClick={onEnterSuperAdmin}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white border border-indigo-500/30 text-[10px] sm:text-xs font-black rounded-xl shadow-lg shadow-indigo-700/10 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{tLocal('btnSuperAdmin')}</span>
          </button>

          {onLogoutSuperAdmin && (
            <button
              id="btn-portal-logout"
              onClick={onLogoutSuperAdmin}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Выйти на экран шлюза авторизации"
            >
              <span>Выйти</span>
            </button>
          )}
        </div>
      </header>

      {/* PORTAL MAIN AREA */}
      <main className="max-w-7xl mx-auto w-full my-auto py-8 sm:py-10 flex flex-col gap-6">
        
        {/* Welcome Section */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black tracking-widest uppercase mb-1">
            ✨ Multi-Tenant Enterprise Solution
          </div>
          <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight text-white leading-tight">
            {lang === 'ky' ? 'Дүкөндөрдүн булуттуу башкаруу тутуму' : 'Булуттук Кассалардын Башкаруу Системасы'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {tLocal('subtitle')}
          </p>
        </div>

        {/* Search and Action Bar */}
        <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-2xl max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center gap-3 shadow-inner">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-[50%] translate-y-[-50%] w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder={tLocal('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-850/80 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
            />
          </div>

          <button
            id="btn-register-store-portal"
            onClick={() => {
              setErrorMsg('');
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>{tLocal('btnRegister')}</span>
          </button>
        </div>

        {/* STORES LISTING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto w-full mt-2">
          {filteredStores.length > 0 ? (
            filteredStores.map(store => {
              const outstandingDebt = store.debtors.reduce((sum, d) => sum + d.totalDebt, 0);
              const storeOnline = store.isCurrentlyOnline;
              const isBlocked = store.isBlocked;

              return (
                <div
                  key={store.id}
                  id={`store-card-${store.id}`}
                  className={`bg-slate-900/50 border rounded-2xl p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 relative group overflow-hidden ${
                    isBlocked 
                      ? 'border-rose-950/40 bg-zinc-950/20 opacity-75' 
                      : 'border-slate-900 hover:bg-slate-900/80 hover:border-slate-800'
                  }`}
                >
                  {/* Neon top highlight bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                    isBlocked ? 'bg-rose-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60 group-hover:opacity-100'
                  }`} />

                  {/* Card upper part */}
                  <div>
                    <div className="flex justify-between items-start mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-slate-100 ${
                          isBlocked ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-450'
                        }`}>
                          {store.name.charAt(0)}
                        </div>
                        <div className="max-w-[140px] sm:max-w-[180px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-bold text-white truncate">{store.name}</h3>
                            {store.code && (
                              <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/20" title="Код доступа филиала">
                                Код: {store.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-600" />
                            <span>{tLocal('owner')}{store.ownerName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Online Status / Blocked Banner */}
                      {isBlocked ? (
                        <span className="text-[8px] tracking-wide font-extrabold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                          🔐 {tLocal('blocked')}
                        </span>
                      ) : storeOnline ? (
                        <span className="text-[8px] tracking-wide font-extrabold uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm animate-pulse">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <span>{tLocal('online')}</span>
                        </span>
                      ) : (
                        <span className="text-[8px] tracking-wide font-extrabold uppercase bg-slate-800 text-slate-500 border border-slate-700/50 px-1.5 py-0.5 rounded-lg">
                          {tLocal('offline')}
                        </span>
                      )}
                    </div>

                    {/* Meta details */}
                    <p className="text-[9px] text-slate-500 flex items-center gap-1 mb-4">
                      <Calendar className="w-3 h-3 text-slate-650" />
                      <span>{tLocal('created')}{new Date(store.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'ky-KG')}</span>
                    </p>

                    {/* Bento Mini-Stats Box */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/50 border border-slate-900/60 rounded-xl p-2.5 mb-5 select-none text-center">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{tLocal('statsProducts')}</p>
                        <p className="text-[12px] text-slate-300 font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5">
                          <Package className="w-3 h-3 text-indigo-400" />
                          {store.products.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{tLocal('statsSales')}</p>
                        <p className="text-[12px] text-slate-300 font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5">
                          <Receipt className="w-3 h-3 text-cyan-400" />
                          {store.transactions.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{tLocal('statsDebtors')}</p>
                        <p className="text-[12px] text-slate-300 font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5">
                          <Wallet className="w-3 h-3 text-rose-400" />
                          {store.debtors.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enter Button action */}
                  {isBlocked ? (
                    <div className="w-full py-2 bg-slate-900 border border-slate-850 rounded-xl text-center text-slate-650 font-extrabold text-[11px] uppercase tracking-wide select-none">
                      🔒 Соода түйүнү жабык / Филиал заблокирован
                    </div>
                  ) : (
                    <button
                      id={`btn-enter-store-${store.id}`}
                      onClick={() => onSelectStore(store.id)}
                      className="w-full py-2 px-3.5 bg-slate-925 hover:bg-emerald-500 text-slate-350 hover:text-slate-950 border border-slate-800 hover:border-emerald-400 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:border-slate-700 hover:scale-[1.01]"
                    >
                      <span>{tLocal('btnEnter')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl p-10 text-center text-slate-500">
              <Building2 className="w-10 h-10 text-slate-750 mx-auto mb-2.5 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-400 mb-1">{tLocal('noStores')}</p>
              <p className="text-[10px] text-slate-600 font-medium">{lang === 'ky' ? 'Башка аталыш менен издеп көрүңүз же жаңы соода түйүнүн түзүңүз' : 'Попробуйте изменить поисковый запрос или зарегистрируйте новую точку'}</p>
            </div>
          )}
        </div>

        {/* Cloud Security Indicator banner */}
        <div className="max-w-md mx-auto w-full bg-slate-950/40 border border-slate-900/60 p-3 rounded-xl flex items-center justify-center gap-2.5 text-center">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
            {tLocal('allSafeSecure')}
          </p>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full text-center py-3 text-slate-600 text-[10px] border-t border-slate-950/80">
        <p>© 2026 POS Multi-Cloud Terminal • Разработано в Google AI Studio • Версия 1.4.0 (Сеть)</p>
      </footer>

      {/* CREATE NEW TENANT STORE DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[95%] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-slate-100">{tLocal('modalTitle')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              {tLocal('modalDesc')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Store Name Input */}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                  {tLocal('labelStoreName')}
                </label>
                <input
                  type="text"
                  placeholder={tLocal('placeholderStoreName')}
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Owner/Director Input */}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                  {tLocal('labelOwnerName')}
                </label>
                <input
                  type="text"
                  placeholder={tLocal('placeholderOwnerName')}
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Demo Pre-population switch */}
              <div className="flex items-center gap-2.5 p-2 bg-slate-950/60 border border-slate-850 rounded-xl select-none">
                <input
                  type="checkbox"
                  id="populateDemo-check"
                  checked={populateDemo}
                  onChange={(e) => setPopulateDemo(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-850 rounded outline-none focus:ring-0 cursor-pointer"
                />
                <label htmlFor="populateDemo-check" className="text-[10px] font-bold text-slate-400 leading-tight cursor-pointer">
                  {tLocal('labelDemo')}
                </label>
              </div>

              {/* Error Display */}
              {errorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5 leading-snug">
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {tLocal('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {tLocal('btnSubmit')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
