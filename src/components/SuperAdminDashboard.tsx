import React, { useState } from 'react';
import { Store, SystemLog } from '../types';
import { Language } from '../translations';
import { 
  Building2, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp, 
  Receipt, 
  Users, 
  RotateCcw, 
  Sparkles, 
  Trash2, 
  Ban, 
  Unlock, 
  Play, 
  Terminal, 
  FolderSync, 
  Activity, 
  UserSquare2, 
  CheckCircle, 
  DatabaseBackup,
  Coins
} from 'lucide-react';

interface SuperAdminDashboardProps {
  stores: Store[];
  systemLogs: SystemLog[];
  onBackToPortal: () => void;
  onToggleBlockStore: (storeId: string) => void;
  onDeleteStore: (storeId: string) => void;
  onEnterStoreAsGuest: (storeId: string) => void;
  onSimulateBackgroundSale: (storeId: string) => void;
  lang: Language;
}

export default function SuperAdminDashboard({
  stores,
  systemLogs,
  onBackToPortal,
  onToggleBlockStore,
  onDeleteStore,
  onEnterStoreAsGuest,
  onSimulateBackgroundSale,
  lang
}: SuperAdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Local inline translations for super-admin dashboard
  const phrases = {
    panelTitle: {
      ru: 'Панель Мониторинга & Управления Сетью',
      ky: 'Тармак Мониторинги жана Башкаруу Панели'
    },
    panelSubtitle: {
      ru: 'Консоль Суперадмина платформных филиалов POS-Cloud в реальном времени',
      ky: 'Реалдуу убакытта POS-Cloud платформасынын суперадмин консолу'
    },
    btnBack: {
      ru: 'Вернуться в портал',
      ky: 'Порталга кайтуу'
    },
    metricStores: {
      ru: 'Зарегистрировано филиалов',
      ky: 'Катталган филиалдар'
    },
    metricRevenue: {
      ru: 'Общая выручка платформы',
      ky: 'Платформанын жалпы кирешеси'
    },
    metricCheques: {
      ru: 'Всего совершено продаж',
      ky: 'Бардык сатуулар саны'
    },
    metricOnline: {
      ru: 'В системе сейчас',
      ky: 'Азыр тутумда'
    },
    searchPlaceholder: {
      ru: 'Поиск по названию магазина, владельцу или ID...',
      ky: 'Дүкөндүн аты, ээси же ID боюнча издөө...'
    },
    thStore: {
      ru: 'Магазин / Филиал',
      ky: 'Дүкөн / Филиал'
    },
    thOwner: {
      ru: 'Управляющий',
      ky: 'Башкаруучу'
    },
    thTelemetry: {
      ru: 'Статистика (База данных)',
      ky: 'Статистика (Маалымат базасы)'
    },
    thFinance: {
      ru: 'Финансы точки',
      ky: 'Түйүндүн финансысы'
    },
    thActions: {
      ru: 'Действия администратора',
      ky: 'Администратордун аракеттери'
    },
    btnGuestLogin: {
      ru: 'Войти как Гость',
      ky: 'Конок катары кирүү'
    },
    btnSimulate: {
      ru: 'Симулировать продажу',
      ky: 'Сатууну симуляциялоо'
    },
    timelineTitle: {
      ru: 'Лента Системных Событий Сети (Live)',
      ky: 'Тармактын тутумдук аракеттеринин лентасы (Live)'
    },
    timelineSubtitle: {
      ru: 'Логирование действий кассиров, добавлений товаров и изменений по всем филиалам',
      ky: 'Бардык филиалдардагы кассирлердин, товар өзгөрүүлөрүнүн аракетин жазуу'
    },
    actionBlocked: {
      ru: 'Заблокировать филиал',
      ky: 'Филиалды бөгөттөө'
    },
    actionUnblocked: {
      ru: 'Разблокировать',
      ky: 'Бөгөттөн чыгаруу'
    },
    actionDelete: {
      ru: 'Удалить базу',
      ky: 'Маалымат базасын өчүрүү'
    },
    outstandingDebt: {
      ru: 'Долг по кассе:',
      ky: 'Кассадагы карыз:'
    },
    totalRev: {
      ru: 'Выручка:',
      ky: 'Кирешеси:'
    },
    logsEmpty: {
      ru: 'История системных логов пуста',
      ky: 'Системалык өзгөрүүлөрдүн тарыхы бош'
    }
  };

  const tLocal = (key: keyof typeof phrases) => {
    return phrases[key]?.[lang] || key;
  };

  // Filter stores
  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute Platform Totals
  const totalPlatformRevenue = stores.reduce((sum, s) => {
    return sum + s.transactions.reduce((tSum, t) => tSum + t.totalPrice, 0);
  }, 0);

  const totalPlatformTransactionsCount = stores.reduce((sum, s) => sum + s.transactions.length, 0);
  const onlineCount = stores.filter(s => s.isCurrentlyOnline && !s.isBlocked).length;

  return (
    <div id="superadmin-root-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      
      {/* Laser light animations */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button
            id="btn-superadmin-back-to-portal"
            onClick={onBackToPortal}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-500/10 text-rose-450 font-black px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest font-mono select-none">SYSTEM OWNER CONSOLE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
            <h1 className="text-md sm:text-lg font-black tracking-tight text-white uppercase">{tLocal('panelTitle')}</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{tLocal('panelSubtitle')}</p>
          </div>
        </div>

        <button
          onClick={onBackToPortal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0 hover:scale-[1.01]"
        >
          <RotateCcw className="w-4 h-4 text-emerald-500" />
          <span>{tLocal('btnBack')}</span>
        </button>
      </header>

      {/* CONTENT WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto w-full flex-1 py-8 flex flex-col gap-6">

        {/* METRICS PLATFORM TILES CARD */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Tile 1: Stores registered */}
          <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-2 right-2 p-1.5 bg-slate-950/60 rounded-lg text-indigo-400 border border-indigo-950/20">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tLocal('metricStores')}</span>
            <span className="text-2xl font-black font-mono tracking-tight text-white mt-1">{stores.length}</span>
            <span className="text-[10px] text-indigo-400 font-medium mt-1">✓ {stores.filter(s => s.isBlocked).length} заблокировано</span>
          </div>

          {/* Tile 2: Platform aggregate revenue */}
          <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-2 right-2 p-1.5 bg-slate-950/60 rounded-lg text-emerald-400 border border-emerald-950/20">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tLocal('metricRevenue')}</span>
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-400 mt-1">{totalPlatformRevenue.toLocaleString()} сом</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Средний чек: {(totalPlatformTransactionsCount > 0 ? parseFloat((totalPlatformRevenue / totalPlatformTransactionsCount).toFixed(1)) : 0)} сом</span>
          </div>

          {/* Tile 3: Sales completed count */}
          <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-2 right-2 p-1.5 bg-slate-950/60 rounded-lg text-cyan-400 border border-cyan-950/20">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tLocal('metricCheques')}</span>
            <span className="text-2xl font-black font-mono tracking-tight text-white mt-1">{totalPlatformTransactionsCount}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Сгенерировано фискальных записей</span>
          </div>

          {/* Tile 4: Active Online now */}
          <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-2 right-2 p-1.5 bg-slate-950/60 rounded-lg text-emerald-450 border border-emerald-950/20">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tLocal('metricOnline')}</span>
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-450 mt-1 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span>{onlineCount}</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-1">Филиалы с активными сессиями кассиров</span>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-xl flex items-center gap-2.5">
          <Search className="w-4.5 h-4.5 text-slate-500 ml-2" />
          <input
            type="text"
            placeholder={tLocal('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* STORES MANAGEMENT WORKSPACE GRID */}
        <div id="superadmin-grid-section" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 sm:p-5 overflow-hidden flex flex-col gap-4">
          
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wide">Мониторинг торговой деятельности сетей</span>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/25 px-2 py-0.5 rounded tracking-wide">
              {filtered.length} из {stores.length} точек
            </span>
          </div>

          <div className="overflow-x-auto select-none">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/30">
                  <th className="py-3 px-3.5">{tLocal('thStore')}</th>
                  <th className="py-3 px-3">{tLocal('thOwner')}</th>
                  <th className="py-3 px-3">{tLocal('thTelemetry')}</th>
                  <th className="py-3 px-3">{tLocal('thFinance')}</th>
                  <th className="py-3 px-3.5 text-right">{tLocal('thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-905">
                {filtered.map(store => {
                  const revenue = store.transactions.reduce((sum, t) => sum + t.totalPrice, 0);
                  const totalOutstandingDebt = store.debtors.reduce((sum, d) => sum + d.totalDebt, 0);
                  
                  return (
                    <tr
                      key={store.id}
                      id={`row-store-${store.id}`}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        store.isBlocked ? 'bg-zinc-950/20 opacity-80' : ''
                      }`}
                    >
                      {/* Column 1: Store info */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-100 ${
                            store.isCurrentlyOnline && !store.isBlocked ? 'bg-emerald-550 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {store.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-100">{store.name}</span>
                              {store.isBlocked ? (
                                <span className="text-[8px] font-black bg-rose-500/10 text-rose-500 px-1 rounded uppercase tracking-wide">BLOCKED</span>
                              ) : store.isCurrentlyOnline ? (
                                <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-450 px-1.5 py-0.2 rounded-full border border-emerald-500/15 flex items-center gap-0.5 animate-pulse">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                                  ON
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[9px] text-slate-550 font-mono">ID: {store.id} • Код для входа: {store.code || '101'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Owner profile */}
                      <td className="py-3.5 px-3">
                        <div>
                          <p className="text-slate-200 font-semibold">{store.ownerName}</p>
                          <p className="text-[9px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                            Создан: {new Date(store.createdAt).toLocaleDateString(lang === 'ru' ? 'ru' : 'ky')}
                          </p>
                        </div>
                      </td>

                      {/* Column 3: Stats database */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">📊 <strong className="text-slate-100 font-bold">{store.products.length}</strong> продуктов товаров</span>
                          <span className="flex items-center gap-1">📄 <strong className="text-slate-100 font-bold">{store.transactions.length}</strong> транзакций/чеков</span>
                          <span className="flex items-center gap-1">👥 <strong className="text-slate-100 font-bold">{store.debtors.length}</strong> должников долгов</span>
                        </div>
                      </td>

                      {/* Column 4: Revenue finances */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-emerald-400 font-black font-mono">{revenue.toLocaleString()} сом</span>
                          <span className="text-[10px] text-rose-400 font-mono">Карыз: {totalOutstandingDebt.toLocaleString()} сом</span>
                        </div>
                      </td>

                      {/* Column 5: Controls */}
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap max-w-[280px] ml-auto">
                          
                          {/* Force Background Sale Simulation */}
                          {!store.isBlocked && (
                            <button
                              id={`btn-simulate-sale-${store.id}`}
                              onClick={() => onSimulateBackgroundSale(store.id)}
                              className="px-2.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 border border-cyan-650 rounded-lg text-white text-[9px] font-black tracking-wide cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
                              title="Инициировать фоновую транзакцию в этой кассе (симулирует покупку товара, вносит прибыль и логирует)"
                            >
                              ⚡ Продажа (Sim)
                            </button>
                          )}

                          {/* Login as Guest directly */}
                          {!store.isBlocked && (
                            <button
                              id={`btn-guest-login-${store.id}`}
                              onClick={() => {
                                onEnterStoreAsGuest(store.id);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 border border-emerald-450 rounded-lg text-slate-950 text-[9px] font-black tracking-wide cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
                              title="Зайти в кассу магазина для удаленного надзора"
                            >
                              🔑 Войти в кассу
                            </button>
                          )}

                          {/* Toggle Block status */}
                          <button
                            id={`btn-toggle-block-${store.id}`}
                            onClick={() => onToggleBlockStore(store.id)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black tracking-wide transition-all cursor-pointer ${
                              store.isBlocked
                                ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white'
                                : 'bg-red-950/40 hover:bg-rose-950 text-rose-450 border-rose-950/50'
                            }`}
                          >
                            {store.isBlocked ? (lang === 'ky' ? 'Ачуу' : 'Разблокировать') : (lang === 'ky' ? 'Бөгөттөө' : 'Блокировать')}
                          </button>

                          {/* Delete Store */}
                          <button
                            id={`btn-delete-store-${store.id}`}
                            onClick={() => {
                              const ask = window.confirm(lang === 'ky' ? `Маалымат базасын толук өчүрүүнү каалайсызбы? Дүкөн: ${store.name}` : `Удалить базу данных магазина ${store.name}? Это действие необратимо!`);
                              if (ask) {
                                onDeleteStore(store.id);
                              }
                            }}
                            className="p-1.5 bg-[#180a0a] hover:bg-red-950 text-rose-500 hover:text-rose-400 border border-rose-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Стереть всю базу данных филиала"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* LOGS TIMELINE PANEL */}
        <div id="logs-timeline-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-2">
          
          <div className="lg:col-span-12 bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
            
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wide flex items-center gap-1.5">
                  <Terminal className="w-4.5 h-4.5 text-indigo-400" />
                  {tLocal('timelineTitle')}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{tLocal('timelineSubtitle')}</p>
              </div>
              <span className="text-[10px] font-mono bg-zinc-950 text-slate-500 font-bold px-2.5 py-1 rounded">
                Live Log Count: {systemLogs.length}
              </span>
            </div>

            {/* Timeline Stream Box */}
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin flex flex-col gap-2.5 pr-1.5">
              {systemLogs.length > 0 ? (
                systemLogs.map(log => {
                  
                  // Color helpers based on log action type
                  const colorMap = {
                    sale: 'text-emerald-400 border-emerald-950/20 bg-emerald-500/5',
                    repay: 'text-teal-400 border-teal-900/20 bg-teal-500/5',
                    refund: 'text-amber-400 border-amber-950/20 bg-amber-500/5',
                    product: 'text-indigo-400 border-indigo-950/20 bg-indigo-500/5',
                    user: 'text-cyan-400 border-cyan-950/20 bg-cyan-500/5',
                    system: 'text-rose-400 border-rose-950/20 bg-rose-500/5',
                    debt: 'text-rose-350 border-rose-900/25 bg-rose-500/5'
                  };

                  const currentStyle = colorMap[log.type] || 'text-slate-400 border-slate-800 bg-slate-900/20';

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border flex items-start sm:items-center justify-between gap-3 text-xs leading-relaxed transition-all hover:bg-slate-900/20 ${currentStyle}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                        {/* Time stamp */}
                        <span className="font-mono text-[9px] text-slate-500 whitespace-nowrap bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                          {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                        </span>
                        
                        {/* Shop badge logo */}
                        <div className="flex items-center gap-1.5 select-none shrink-0 pointer-events-none">
                          <span className="text-[10px] font-black uppercase tracking-wide bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-slate-900">
                            {log.storeName}
                          </span>
                        </div>

                        {/* Event text description */}
                        <p className="font-sans font-medium text-slate-200">
                          {log.action}
                        </p>
                      </div>

                      {/* Log Action Identifier badges */}
                      <span className="hidden sm:inline-block text-[8px] font-black font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-900">
                        {log.type}
                      </span>

                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-600">
                  <Activity className="w-8 h-8 text-slate-755 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-bold">{tLocal('logsEmpty')}</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full text-center py-4 text-slate-600 text-[10px] border-t border-slate-900">
        <p>© 2026 POS Multi-Cloud System Owner Dashboard • Разработано в Google AI Studio • Версия 1.4.0 (Сеть)</p>
      </footer>

    </div>
  );
}
