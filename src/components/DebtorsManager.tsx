import React, { useState } from 'react';
import { User, Phone, Plus, Search, ArrowDownLeft, ArrowUpRight, Check, Trash2, Calendar, DollarSign, X, Coins, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Debtor, DebtRecord, Product } from '../types';
import { translations } from '../translations';

interface DebtorsManagerProps {
  debtors: Debtor[];
  onUpdateDebtors: (updated: Debtor[]) => void;
  lang?: 'ru' | 'ky';
}

export default function DebtorsManager({ debtors, onUpdateDebtors, lang = 'ru' }: DebtorsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  // Modal / Form states
  const [showAddDebtorModal, setShowAddDebtorModal] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');

  // Non-blocking custom dialog states
  const [debtorPendingDelete, setDebtorPendingDelete] = useState<Debtor | null>(null);
  const [customDebtAlert, setCustomDebtAlert] = useState<string | null>(null);
  const [repayOverpayPending, setRepayOverpayPending] = useState<{ amount: number; comment: string } | null>(null);

  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmountInput, setRepayAmountInput] = useState('');
  const [repayComment, setRepayComment] = useState('');

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang];
    }
    return key;
  };

  // Calculations
  const totalOutstandingDebt = debtors.reduce((sum, d) => sum + d.totalDebt, 0);
  const activeDebtorsCount = debtors.filter(d => d.totalDebt > 0).length;
  const largestDebt = debtors.length > 0 ? Math.max(...debtors.map(d => d.totalDebt)) : 0;

  // Filters
  const filteredDebtors = debtors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (d.phone && d.phone.includes(searchQuery));
    const matchesActive = filterActiveOnly ? d.totalDebt > 0 : true;
    return matchesSearch && matchesActive;
  });

  // Create manual debtor
  const handleAddDebtorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtorName.trim()) {
      setCustomDebtAlert(lang === 'ky' ? 'Кардардын атын жазыңыз!' : 'Пожалуйста, введите имя должника!');
      return;
    }

    // Check check dupe
    const exists = debtors.some(d => d.name.toLowerCase() === newDebtorName.trim().toLowerCase());
    if (exists) {
      setCustomDebtAlert(lang === 'ky' ? 'Бул ат менен должник бар!' : 'Должник с таким именем уже существует!');
      return;
    }

    const newDebtor: Debtor = {
      id: 'DBT-' + Date.now(),
      name: newDebtorName.trim(),
      phone: newDebtorPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
      totalDebt: 0,
      history: []
    };

    const updated = [...debtors, newDebtor];
    onUpdateDebtors(updated);

    setNewDebtorName('');
    setNewDebtorPhone('');
    setShowAddDebtorModal(false);
    setSelectedDebtor(newDebtor);
  };

  // Main payment implementation
  const executeRepay = (amount: number, comment: string) => {
    if (!selectedDebtor) return;
    
    const newRecord: DebtRecord = {
      id: 'DEBT-REPAY-' + Date.now(),
      date: new Date().toISOString(),
      amount: -amount,
      type: 'repay',
      comment: comment.trim() || (lang === 'ky' ? 'Карызды төлөө' : 'Погашение долга')
    };

    const updatedDebtors = debtors.map(d => {
      if (d.id === selectedDebtor.id) {
        const updatedHistory = [...d.history, newRecord];
        const newTotal = parseFloat((d.totalDebt - amount).toFixed(2));
        return {
          ...d,
          history: updatedHistory,
          totalDebt: newTotal >= 0 ? newTotal : 0
        };
      }
      return d;
    });

    onUpdateDebtors(updatedDebtors);
    
    // Refresh detailed selectedDebtor view
    const refreshed = updatedDebtors.find(d => d.id === selectedDebtor.id);
    if (refreshed) {
      setSelectedDebtor(refreshed);
    }

    setRepayAmountInput('');
    setRepayComment('');
    setShowRepayModal(false);
    setRepayOverpayPending(null);
  };

  // Perform debt repayment
  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;

    const amount = parseFloat(repayAmountInput);
    if (isNaN(amount) || amount <= 0) {
      setCustomDebtAlert(lang === 'ky' ? 'Туура сумманы киргизиңиз!' : 'Введите корректную сумму больше нуля!');
      return;
    }

    if (amount > selectedDebtor.totalDebt) {
      setRepayOverpayPending({ amount, comment: repayComment });
      return;
    }

    executeRepay(amount, repayComment);
  };

  // Delete profile including active debts with confirmation
  const handleDeleteProfile = (id: string, name: string) => {
    const debtorToDelete = debtors.find(d => d.id === id);
    if (!debtorToDelete) return;
    setDebtorPendingDelete(debtorToDelete);
  };

  return (
    <div className="flex flex-col gap-6" id="debtors-dashboard-sec">
      
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'ky' ? 'Жалпы карыздардын суммасы' : 'Общая сумма долгов'}
            </span>
            <span className="text-lg font-extrabold text-rose-600 font-mono">
              {totalOutstandingDebt.toLocaleString('ru-RU')} сом
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'ky' ? 'Карызы бар адамдардын саны' : 'Активных должников'}
            </span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              {activeDebtorsCount} {lang === 'ky' ? 'адам' : 'клиентов'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'ky' ? 'Эң жогорку карыз' : 'Максимальный долг'}
            </span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              {largestDebt.toLocaleString('ru-RU')} сом
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CORE SPLIT SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SELECTION LIST (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {lang === 'ky' ? 'Карыз дептери (Тетрадь)' : 'Тетрадь должников'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'ky' ? 'Карыз алгандарды көзөмөлдөө жана карыздарды төлөө' : 'Регистрация клиентов под запись в долг и ведение взаиморасчетов'}
              </p>
            </div>
            <button
              onClick={() => setShowAddDebtorModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('debtorCreateNew')}</span>
            </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('debtorSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3.5 py-2 pl-9 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            
            <label className="flex items-center gap-2 text-xs text-slate-600 select-none cursor-pointer self-start sm:self-center">
              <input
                type="checkbox"
                checked={filterActiveOnly}
                onChange={() => setFilterActiveOnly(!filterActiveOnly)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>{lang === 'ky' ? 'Карызы барлар гана' : 'Только активный долг'}</span>
            </label>
          </div>

          {/* DEBTORS CARDS CONTAINER */}
          <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredDebtors.map(debtor => {
              const isSelected = selectedDebtor?.id === debtor.id;
              return (
                <div
                  key={debtor.id}
                  onClick={() => setSelectedDebtor(debtor)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/25 border-emerald-500 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      debtor.totalDebt > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {debtor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{debtor.name}</h4>
                      {debtor.phone ? (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{debtor.phone}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          {lang === 'ky' ? 'Телефон жазылган эмес' : 'Телефон не указан'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{lang === 'ky' ? 'Карызы' : 'Долг'}</p>
                      <p className={`font-mono font-bold text-sm ${
                        debtor.totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {debtor.totalDebt.toLocaleString('ru-RU')} сом
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(debtor.id, debtor.name);
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                      title={lang === 'ky' ? 'Өчүрүү' : 'Удалить профиль'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredDebtors.length === 0 && (
              <div className="py-14 text-center text-slate-400 flex flex-col items-center gap-2">
                <BookOpen className="w-8 h-8 text-slate-200" />
                <p className="text-xs font-semibold">{t('debtorEmptyList')}</p>
                <p className="text-[10px] text-slate-500">
                  {lang === 'ky' ? 'Карызы бар кардарлар азырынча жок же издөө боюнча табылган жок.' : 'Должники не найдены. Вы можете добавить нового кнопкой выше.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS & TIMELINE (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedDebtor ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              
              {/* Profile Header */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedDebtor.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ky' ? `Кошулган күнү: ${new Date(selectedDebtor.createdAt).toLocaleDateString()}` : `Начало учета: ${new Date(selectedDebtor.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
                
                {selectedDebtor.totalDebt > 0 && (
                  <button
                    onClick={() => setShowRepayModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('debtRepayBtn')}</span>
                  </button>
                )}
              </div>

              {/* Debt Figure */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">{t('totalDebtLbl')}</span>
                  <span className={`text-xl font-mono font-black ${selectedDebtor.totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedDebtor.totalDebt.toLocaleString('ru-RU')} сом
                  </span>
                </div>
                {selectedDebtor.totalDebt === 0 && (
                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                    {lang === 'ky' ? 'Карызы жок' : 'Закрыт'}
                  </span>
                )}
              </div>

              {/* Timeline Header */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('debtHistory')}</h4>
              </div>

              {/* Ledger timeline list */}
              <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                {selectedDebtor.history.map((record) => {
                  const displayDate = new Date(record.date).toLocaleDateString('ru-RU');
                  const displayTime = new Date(record.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                  const isBorrow = record.type === 'borrow';

                  return (
                    <div key={record.id} className="p-2.5 rounded-xl border border-slate-100/70 hover:border-slate-200/70 transition-all flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${isBorrow ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isBorrow ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 leading-snug">
                            {isBorrow 
                              ? (lang === 'ky' ? 'Товар алды' : 'Взят кредит (Товары)') 
                              : (lang === 'ky' ? 'Карызын төлөдү' : 'Внесена оплата')}
                          </p>
                          <p className="text-[10px] text-slate-400 block mt-0.5 leading-none">
                            {displayDate} в {displayTime} • <span className="italic">{record.comment}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`font-mono font-bold ${isBorrow ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isBorrow ? '+' : ''}{record.amount.toLocaleString('ru-RU')} сом
                      </span>
                    </div>
                  );
                })}

                {selectedDebtor.history.length === 0 && (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5 grayscale opacity-60">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                    <p className="text-[11px] font-semibold">{lang === 'ky' ? 'Журнал бош' : 'Взаиморасчетов еще не производилось'}</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 h-[340px]">
              <User className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold">
                {lang === 'ky' ? 'Кардар тандалган жок' : 'Должник не выбран'}
              </p>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                {lang === 'ky' ? 'Анын карыздар тарыхын көрүү жана төлөм кабыл алуу үчүн солдон тандаңыз.' : 'Выберите клиента из списка слева, чтобы посмотреть его историю платежей.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: ADD DEBTOR PROFILE */}
      {showAddDebtorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4">
          <form 
            onSubmit={handleAddDebtorSubmit}
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-[fadeIn_0.2s_ease-out]"
          >
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center">
              <h4 className="text-sm font-bold">{t('debtorCreateNew')}</h4>
              <button 
                type="button"
                onClick={() => setShowAddDebtorModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('debtorNameInput')}</label>
                <input
                  type="text"
                  required
                  placeholder="Мисалы: Асан Садыков"
                  value={newDebtorName}
                  onChange={(e) => setNewDebtorName(e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('debtorPhoneInput')}</label>
                <input
                  type="text"
                  placeholder="0555123456"
                  value={newDebtorPhone}
                  onChange={(e) => setNewDebtorPhone(e.target.value.replace(/[^0-9+() -]/g, ''))}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDebtorModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  {lang === 'ky' ? 'Кошуу' : 'Добавить'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: REPAY CREDIT */}
      {showRepayModal && selectedDebtor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4">
          <form 
            onSubmit={handleRepaySubmit}
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-[fadeIn_0.2s_ease-out]"
          >
            <div className="bg-emerald-750 px-5 py-4 text-white flex justify-between items-center">
              <h4 className="text-sm font-bold">{t('debtRepayBtn')} ({selectedDebtor.name})</h4>
              <button 
                type="button"
                onClick={() => setShowRepayModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 border border-slate-100/50">
                <span className="font-semibold block">{lang === 'ky' ? 'Азыркы жалпы карызы:' : 'Текущий долг клиента:'}</span>
                <span className="text-md font-mono font-black text-rose-600 mt-1 block">
                  {selectedDebtor.totalDebt.toLocaleString('ru-RU')} сом
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('debtRepayAmount')}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Сумма"
                    max={selectedDebtor.totalDebt}
                    value={repayAmountInput}
                    onChange={(e) => setRepayAmountInput(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 pl-8 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-mono font-bold"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono"> сом </span>
                </div>
                
                {/* Numeric quick shortcuts */}
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setRepayAmountInput(selectedDebtor.totalDebt.toString())}
                    className="text-[9px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 border border-transparent rounded px-2 py-1 font-bold transition-all"
                  >
                    {lang === 'ky' ? 'Баарын төлөө' : 'Погасить полностью'} ({selectedDebtor.totalDebt} сом)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">{lang === 'ky' ? 'Комментарий (опция)' : 'Комментарий (опция)'}</label>
                <input
                  type="text"
                  placeholder={lang === 'ky' ? 'Например, накталай кабыл алынды' : 'Например, получено наличными'}
                  value={repayComment}
                  onChange={(e) => setRepayComment(e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRepayModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  {lang === 'ky' ? 'Кабыл алуу' : 'Зачислить'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM ALERT MODAL - Iframe safe */}
      {customDebtAlert && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col p-5 gap-4 animate-[scaleIn_0.18s_ease-out]">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500 animate-pulse" />
              <span>{lang === 'ky' ? 'Кабарлоо' : 'Внимание'}</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              {customDebtAlert}
            </p>

            <button
              onClick={() => setCustomDebtAlert(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              ОК
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM OVERPAY CONFIRMATION MODAL - Iframe safe */}
      {repayOverpayPending && selectedDebtor && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col p-5 gap-4 animate-[scaleIn_0.18s_ease-out]">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-500 animate-pulse" />
              <span>{lang === 'ky' ? 'Балансты толтуруу' : 'Превышение долга'}</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              {lang === 'ky'
                ? `Киргизилген сумма карыздан чоң (${selectedDebtor.totalDebt} сом). Сдача катары калтырасызбы?`
                : `Введенная сумма превышает долг (${selectedDebtor.totalDebt} сом). Вы уверены, что хотите зачислить эту сумму?`}
            </p>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setRepayOverpayPending(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={() => {
                  executeRepay(repayOverpayPending.amount, repayOverpayPending.comment);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer font-bold"
              >
                {lang === 'ky' ? 'Зачислить' : 'Зачислить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE DEBTOR MODAL - Iframe safe */}
      {debtorPendingDelete && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-[scaleIn_0.18s_ease-out]">
            <div className="bg-rose-600 p-4 text-white flex justify-between items-center select-none font-bold">
              <h4 className="text-xs font-bold uppercase tracking-wider">{lang === 'ky' ? 'Профилди өчүрүү' : 'Удаление профиля'}</h4>
              <button 
                onClick={() => setDebtorPendingDelete(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="text-xs text-slate-750 leading-relaxed font-semibold">
                {debtorPendingDelete.totalDebt > 0 ? (
                  <p className="text-rose-600 border border-rose-100 bg-rose-50/50 p-3 rounded-xl mb-3 font-semibold">
                    {lang === 'ky'
                      ? `Эскертүү: "${debtorPendingDelete.name}" кардарынын ${debtorPendingDelete.totalDebt} сом карызы бар. Өчүрүү бул карызды эсептен чыгарып кечет.`
                      : `Внимание: У должника "${debtorPendingDelete.name}" есть активный долг ${debtorPendingDelete.totalDebt} сом. Удаление профиля аннулирует и спишет этот долг!`}
                  </p>
                ) : null}
                <p>
                  {lang === 'ky'
                    ? `Чын эле "${debtorPendingDelete.name}" профилин карыздар тизмесинен өчүргүңүз келеби? Бул аракетти артка кайтаруу мүмкүн эмес.`
                    : `Вы действительно хотите удалить профиль должника "${debtorPendingDelete.name}"? Это действие невозможно отменить.`}
                </p>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setDebtorPendingDelete(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  onClick={() => {
                    const updated = debtors.filter(d => d.id !== debtorPendingDelete.id);
                    onUpdateDebtors(updated);
                    setDebtorPendingDelete(null);
                    setSelectedDebtor(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer font-bold"
                >
                  {lang === 'ky' ? 'Өчүрүү' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
