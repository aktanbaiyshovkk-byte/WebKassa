import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Receipt, ArrowLeftRight, Trash2, Calendar, FileText, Activity, AlertCircle, RefreshCcw, Sparkles, X } from 'lucide-react';
import { SaleTransaction, Product } from '../types';
import { translations } from '../translations';

interface SalesHistoryProps {
  transactions: SaleTransaction[];
  products: Product[];
  onRefundTransaction: (transactionId: string) => void;
  lang?: 'ru' | 'ky';
}

export default function SalesHistory({ transactions, products, onRefundTransaction, lang = 'ru' }: SalesHistoryProps) {
  const [filterPayment, setFilterPayment] = useState<'all' | 'cash' | 'card' | 'qr' | 'debt'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refundPendingTrx, setRefundPendingTrx] = useState<SaleTransaction | null>(null);

  // Local helper for translations
  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang];
    }
    return key;
  };

  // Summary Metrics calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalCost = transactions.reduce((sum, t) => sum + t.totalCostPrice, 0);
  const totalProfit = totalRevenue - totalCost;
  const salesCount = transactions.length;

  // Best selling products calculation
  const productSalesMap: { [name: string]: { qty: number; totalRev: number; unit: string } } = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { qty: 0, totalRev: 0, unit: item.unit };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].totalRev += item.price * item.quantity;
    });
  });

  const bestSellers = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesPayment = filterPayment === 'all' || t.paymentMethod === filterPayment;
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPayment && matchesSearch;
  });

  // Handle process refund safely with feedback
  const handleRefund = (tObj: SaleTransaction) => {
    setRefundPendingTrx(tObj);
  };

  return (
    <div className="flex flex-col gap-6" id="sales-history-sec">
      
      {/* ANALYTICS SUMMARY CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'ky' ? 'Жалпы выручка' : 'Общая выручка'}
            </span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              {totalRevenue.toLocaleString('ru-RU')} сом
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Profit markup */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'ky' ? 'Таза киреше (прибыль)' : 'Чистая прибыль'}
            </span>
            <span className="text-lg font-extrabold text-indigo-700 font-mono">
              {totalProfit.toLocaleString('ru-RU')} сом
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Sales count */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">
              {lang === 'ky' ? 'Сатуулардын саны' : 'Количество продаж'}
            </span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              {salesCount} {lang === 'ky' ? 'чек' : 'чеков'}
            </span>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Average ticket receipt */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-medium">{t('avgReceiptCheck')}</span>
            <span className="text-lg font-extrabold text-amber-700 font-mono">
              {salesCount > 0 ? (totalRevenue / salesCount).toFixed(1) : '0'} сом
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* MID SECTION: BEST SELLERS GRAPH & DETAILED LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TRANSACTIONS LIST AND SEARCH (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('historyHeaderTitle')}</h3>
              <p className="text-[11px] text-slate-400">{t('historyHeaderSubtitle')}</p>
            </div>

            {/* Payment method selector filter */}
            <div className="relative">
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as any)}
                className="appearance-none bg-slate-50 border border-slate-200 text-[11px] px-3 py-1.5 pr-7 rounded-lg outline-none cursor-pointer text-slate-600 font-bold"
              >
                <option value="all">{lang === 'ky' ? 'Бардык төлөмдөр' : 'Все оплаты'}</option>
                <option value="cash">{lang === 'ky' ? 'Накталай төлөм' : 'Наличные'}</option>
                <option value="card">{lang === 'ky' ? 'Карта менен' : 'Карта'}</option>
                <option value="qr">{lang === 'ky' ? 'СБП QR менен' : 'СБП QR'}</option>
                <option value="debt">{lang === 'ky' ? 'Карызга (Долг)' : 'В долг'}</option>
              </select>
            </div>
          </div>

          {/* Quick transaction lookup input search */}
          <div className="relative">
            <input
              type="text"
              placeholder={lang === 'ky' ? "Чек номери же товардын аты боюнча издөө..." : "Поиск по ID чека или ключевому слову товара..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>

          {/* TRANSACTIONS ACCORDION LOGS */}
          <div className="flex flex-col gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredTransactions.map(tObj => {
              const displayTime = new Date(tObj.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
              const displayDate = new Date(tObj.timestamp).toLocaleDateString('ru-RU');

              return (
                <div key={tObj.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:border-slate-200 transition-all">
                  
                  {/* Transaction core Header row */}
                  <div className="bg-slate-50 p-3 h-14 flex items-center justify-between text-xs border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-bold">
                        {tObj.id}
                      </span>
                      <div className="text-slate-500 text-[11px] line-clamp-1">
                        <span>{displayDate} {lang === 'ky' ? 'саат' : 'в'} {displayTime}</span>
                        <span className="mx-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-600 ml-1.5">
                          {tObj.paymentMethod === 'cash' ? (lang === 'ky' ? 'Накталай' : 'Наличные') :
                           tObj.paymentMethod === 'card' ? (lang === 'ky' ? 'Карта' : 'Карта') :
                           tObj.paymentMethod === 'qr' ? 'СБП QR' : (lang === 'ky' ? 'КАРЫЗГА' : 'В ДОЛГ')}
                        </span>
                        {tObj.paymentMethod === 'debt' && tObj.debtorName && (
                          <span className="mx-1 px-1.5 py-0.2 rounded text-[10px] bg-red-50 text-red-600 border border-red-100/50 font-bold ml-1.5 select-none" title={`Номер телефона: ${tObj.debtorPhone || '-'}`}>
                            👤 {tObj.debtorName}
                          </span>
                        )}
                        {tObj.cashierName && (
                          <span className="mx-1 px-2 py-0.5 rounded text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100/50 ml-1.5 uppercase font-bold tracking-wide">
                            {tObj.cashierName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 text-sm font-mono">
                        {tObj.totalPrice.toFixed(2)} сом
                      </span>
                      
                      {/* Return/Refund trigger button */}
                      <button
                        onClick={() => handleRefund(tObj)}
                        className="p-1 px-2 text-[10px] bg-slate-100 text-rose-600 hover:bg-rose-50 rounded font-bold cursor-pointer transition-colors"
                        title={lang === 'ky' ? 'Кайтарууну тариздөө' : 'Оформить возврат'}
                      >
                        {lang === 'ky' ? 'Кайтаруу' : 'Возврат'}
                      </button>
                    </div>
                  </div>

                  {/* Transaction items details */}
                  <div className="p-3 bg-white divide-y divide-slate-100/50 flex flex-col gap-1.5">
                    {tObj.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] py-1">
                        <span className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]" title={item.productName}>
                          {item.productName}
                        </span>
                        <span className="font-mono text-slate-500">
                          {item.quantity} {item.unit === 'шт' ? (lang === 'ky' ? 'даана' : 'шт') : (item.unit === 'кг' ? (lang === 'ky' ? 'кг' : 'кг') : item.unit)} x {item.price} сом = <strong className="text-slate-700">{(item.price * item.quantity).toFixed(0)} сом</strong>
                        </span>
                      </div>
                    ))}
                    
                    {/* Markup profit insight */}
                    <div className="text-[10px] border-t border-slate-100 pt-2 text-slate-400 flex justify-between">
                      <span>{lang === 'ky' ? 'Транзакциялык өздүк наркы:' : 'Транзакционная себестоимость:'} {tObj.totalCostPrice} сом</span>
                      <span className="text-indigo-600 font-semibold font-mono">
                        {lang === 'ky' ? 'Үстөк баа (Маржа):' : 'Наценка (Маржа):'} +{(tObj.totalPrice - tObj.totalCostPrice).toFixed(1)} сом
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <div className="py-14 text-center text-slate-400 flex flex-col items-center gap-2">
                <Receipt className="w-8 h-8 text-slate-200" />
                <p className="text-xs font-semibold">
                  {lang === 'ky' ? 'Кассалык чектердин тарыхы бош' : 'История кассовых чеков пуста'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {lang === 'ky' ? 'Чектерди архивден көрүү үчүн "Касса" бөлүмүнөн сатууларды жасаңыз.' : 'Оформите продажи во вкладке "Касса", чтобы они отобразились в архиве.'}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: BEST SELLING ANALYTICS CHART & MOST POPULAR ITEMS (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'ky' ? 'Эң көп сатылган товарлар' : 'Топ-ходовых товаров'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'ky' ? 'Сатуу көлөмү эң жогору болгон продуктулар' : 'Продукты с максимальным объемом продаж'}
            </p>
          </div>

          {/* CUSTOM BESPOKE ANALYTICAL CHART PROGRESS BARS */}
          <div className="flex flex-col gap-4 mt-2">
            {bestSellers.map((item, index) => {
              // Find max qty sold to calculate scale proportions
              const maxUnits = bestSellers[0]?.qty || 1;
              const percentWidth = (item.qty / maxUnits) * 100;
              
              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={item.name}>
                      {index + 1}. {item.name}
                    </span>
                    <span className="font-mono text-slate-500">
                      <strong>{item.qty}</strong> {item.unit === 'шт' ? (lang === 'ky' ? 'даана' : 'шт') : (item.unit === 'кг' ? (lang === 'ky' ? 'кг' : 'кг') : item.unit)} (<span className="text-emerald-600">{(item.totalRev).toFixed(0)} сом</span>)
                    </span>
                  </div>
                  
                  {/* Styled Horizontal Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-indigo-600' :
                        index === 1 ? 'bg-teal-500' :
                        index === 2 ? 'bg-emerald-500' :
                        index === 3 ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {bestSellers.length === 0 && (
              <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <Activity className="w-8 h-8 text-slate-200" />
                <p className="text-xs font-semibold">
                  {lang === 'ky' ? 'Аналитика үчүн маалымат жетишсиз' : 'Недостаточно данных для аналитики'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ky' ? 'Диаграмманы куруу үчүн бир нече товар сатып өткөрүңүз.' : 'Продайте несколько товаров для построения диаграммы.'}
                </p>
              </div>
            )}
          </div>

          {/* STORE MANAGEMENT HIGHLIGHTS GREETINGS */}
          <div className="mt-2 bg-gradient-to-r from-indigo-50 to-indigo-100/50 p-4 rounded-xl border border-indigo-100 flex gap-3.5 items-start">
            <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 leading-normal text-[11px]">
              <h4 className="font-bold text-indigo-900">
                {lang === 'ky' ? 'Дүкөн боюнча маалымат' : 'Инсайт магазина'}
              </h4>
              <p className="text-indigo-800">
                {lang === 'ky' ? 'Рентабелдүүлүк (активдүү ROI):' : 'Рентабельность (активный ROI):'} <strong className="font-extrabold">{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%</strong>
              </p>
              <p className="text-indigo-700/85 mt-1">
                {lang === 'ky' 
                  ? 'Кирешени туура сактоо үчүн берүүчүлөрдөн өз убагында сатып алууларды жасап, "Учет склада" бөлүмүнөн минималдуу калдыктарды көзөмөлдөңүз.'
                  : 'Для сохранения прибыли вовремя делайте закупку у поставщиков и следите за минимальными остатками во вкладке "Учет склада".'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* CUSTOM CONFIRM REFUND MODAL - Iframe safe */}
      {refundPendingTrx && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-[scaleIn_0.18s_ease-out]">
            <div className="bg-amber-600 p-4 text-white flex justify-between items-center select-none font-bold">
              <h4 className="text-xs font-bold uppercase tracking-wider">{lang === 'ky' ? 'Чек кайтаруу' : 'Возврат чека'}</h4>
              <button 
                onClick={() => setRefundPendingTrx(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="text-xs text-slate-700 leading-relaxed font-semibold">
                <p className="mb-2">
                  {lang === 'ky'
                    ? `Чек боюнча КАЙТАРУУНУ кабыл алууга ишенесизби ${refundPendingTrx.id}?`
                    : `Вы уверены, что хотите оформить ВОЗВРАТ по чеку ${refundPendingTrx.id}?`}
                </p>
                <p className="text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-bold">
                  {lang === 'ky' ? `Кайтаруу суммасы: ${refundPendingTrx.totalPrice} сом.` : `Сумма возврата: ${refundPendingTrx.totalPrice} сом.`}
                </p>
                <p className="mt-2 text-slate-500 text-[11px] font-normal leading-normal">
                  {lang === 'ky'
                    ? 'Бул чектеги товарлар автоматтык түрдө складга кайтарылат.'
                    : 'Все товары из этого чека будут автоматически возвращены на баланс склада.'}
                </p>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setRefundPendingTrx(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  onClick={() => {
                    onRefundTransaction(refundPendingTrx.id);
                    setRefundPendingTrx(null);
                  }}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer font-bold"
                >
                  {lang === 'ky' ? 'Кайтаруу' : 'Оформить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

