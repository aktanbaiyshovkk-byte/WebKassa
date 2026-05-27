import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, ArrowUpDown, ChevronDown, Trash2, Edit2, Check, X, Tag, Barcode, Layers, Settings, RefreshCcw } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/initialProducts';
import { translations } from '../translations';

interface InventoryManagerProps {
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  lang: 'ru' | 'ky';
}

export default function InventoryManager({ products, onUpdateProducts, lang }: InventoryManagerProps) {
  const t = (key: string) => {
    return translations[key]?.[lang] || translations[key]?.['ru'] || key;
  };

  const getTranslatedCategory = (cat: string) => {
    if (cat === 'Все категории' || cat === 'Все') {
      return lang === 'ky' ? 'Бардык категориялар' : 'Все категории';
    }
    const mapper: { [key: string]: { ru: string; ky: string } } = {
      'Молочные продукты': { ru: 'Молочные продукты', ky: 'Сүт азыктары' },
      'Бакалея': { ru: 'Бакалея', ky: 'Бакалея' },
      'Хлебобулочные': { ru: 'Хлебобулочные изделия', ky: 'Нан азыктары' },
      'Напитки': { ru: 'Напитки', ky: 'Сусундуктар' },
      'Кондитерские': { ru: 'Кондитерские изделия', ky: 'Таттуулар' },
      'Замороженные': { ru: 'Замороженные полуфабрикаты', ky: 'Тоңдурулган азыктар' },
      'Фрукты/Овощи': { ru: 'Фрукты и Овощи', ky: 'Жашылча-жемиштер' },
      'Мясные/Колбасы': { ru: 'Мясные и колбасные изделия', ky: 'Эт жана колбасалар' }
    };
    return mapper[cat]?.[lang] || cat;
  };

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'available'>('all');
  
  // Sort state
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Custom non-blocking modal states
  const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
  const [customAlertMsg, setCustomAlertMsg] = useState<string | null>(null);

  // Modal active states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Forms state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    costPrice: 0,
    barcode: '',
    category: 'Молочные продукты',
    stock: 0,
    minStock: 5,
    unit: 'шт'
  });

  // Rapid Stock Ingress adjustment
  const [quickStockId, setQuickStockId] = useState<string | null>(null);
  const [quickStockVal, setQuickStockVal] = useState<string>('');

  // Auto Generate EAN13 barcode
  const generateRandomBarcode = () => {
    // 460 represents Russia prefix, then 9 random numbers, and standard EAN13 calculation
    let code = "460";
    for (let i = 0; i < 9; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    
    // Checksum calculation to complete EAN13 strictly
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return code + checksum.toString();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      price: 100,
      costPrice: 60,
      barcode: generateRandomBarcode(),
      category: 'Бакалея',
      stock: 20,
      minStock: 5,
      unit: 'шт'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      costPrice: product.costPrice,
      barcode: product.barcode,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit
    });
    setShowEditModal(true);
  };

  // CRUD Actions
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      setCustomAlertMsg(lang === 'ky' 
        ? "Сураныч, атын жазып жана штрих-кодду көрсөтүңүз!" 
        : "Пожалуйста, заполните название и штрих-код!");
      return;
    }

    // Check duplicate barcode
    const dup = products.find(p => p.barcode === formData.barcode);
    if (dup) {
      setCustomAlertMsg(lang === 'ky'
        ? `Ката: [${formData.barcode}] штрих-коду менен товар базада бар (${dup.name}). Штрих-код уникалдуу болушу керек!`
        : `Ошибка: Товар со штрих-кодом [${formData.barcode}] уже заведен в систему (${dup.name}). Штрих-код должен быть уникальным!`);
      return;
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now().toString().slice(-4),
      name: formData.name,
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      barcode: formData.barcode,
      category: formData.category,
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      unit: formData.unit
    };

    onUpdateProducts([...products, newProduct]);
    setShowAddModal(false);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!formData.name || !formData.barcode) {
      setCustomAlertMsg(lang === 'ky' 
        ? "Сураныч, товардын атын жана штрих-кодду толтуруңуз!" 
        : "Пожалуйста, заполните имя и штрих-код!");
      return;
    }

    // Check duplicate barcode on other items
    const dup = products.find(p => p.barcode === formData.barcode && p.id !== selectedProduct.id);
    if (dup) {
      setCustomAlertMsg(lang === 'ky'
        ? `Ката: [${formData.barcode}] штрих-коду башка товарга тиешелүү (${dup.name})!`
        : `Ошибка: Штрих-код [${formData.barcode}] занят другим товаром (${dup.name})!`);
      return;
    }

    const updated = products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          name: formData.name,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice),
          barcode: formData.barcode,
          category: formData.category,
          stock: Number(formData.stock),
          minStock: Number(formData.minStock),
          unit: formData.unit
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    setProductPendingDelete(p);
  };

  // Quick inline stock correction
  const handleQuickStockSave = (productId: string) => {
    const parsedVal = parseFloat(quickStockVal);
    if (isNaN(parsedVal) || parsedVal < 0) {
      setCustomAlertMsg(lang === 'ky'
        ? "Калдыкты өзгөртүү үчүн туура санды киргизиңиз!"
        : "Введите валидное число для указания остатка!");
      return;
    }

    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: parsedVal };
      }
      return p;
    });

    onUpdateProducts(updated);
    setQuickStockId(null);
    setQuickStockVal('');
  };

  // Handle Sort Toggle
  const handleSort = (field: 'name' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Process data with filtering, sorting
  let processedProducts = [...products];

  // Search filter
  if (searchQuery.trim()) {
    processedProducts = processedProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
    );
  }

  // Category filter
  if (selectedCategory !== 'Все категории') {
    processedProducts = processedProducts.filter(p => p.category === selectedCategory);
  }

  // Stock filter options
  if (stockFilter === 'low') {
    processedProducts = processedProducts.filter(p => p.stock <= p.minStock && p.stock > 0);
  } else if (stockFilter === 'out') {
    processedProducts = processedProducts.filter(p => p.stock <= 0);
  } else if (stockFilter === 'available') {
    processedProducts = processedProducts.filter(p => p.stock >= 1);
  }

  // Sorings
  if (sortBy !== 'none') {
    processedProducts.sort((a, b) => {
      let valA: any = a[sortBy as keyof typeof a];
      let valB: any = b[sortBy as keyof typeof b];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-6" id="inventory-manager-sec">
      
      {/* FILTER AND QUICK STATS ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Search bar and low stock options */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('searchProductPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-xs px-3.5 py-2 pr-8 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 cursor-pointer text-slate-600 font-medium"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{getTranslatedCategory(category)}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Stock remaining filter buttons */}
          <div className="inline-flex bg-slate-50 p-1 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                stockFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'hover:bg-slate-100/50'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setStockFilter('available')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-emerald-700 ${
                stockFilter === 'available' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:bg-slate-100/50'
              }`}
            >
              {t('filterAvailable')}
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-amber-700 ${
                stockFilter === 'low' ? 'bg-white text-amber-800 shadow-sm' : 'hover:bg-slate-100/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('filterLow')}
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-rose-700 ${
                stockFilter === 'out' ? 'bg-white text-rose-800 shadow-sm' : 'hover:bg-slate-100/50'
              }`}
            >
              {t('filterOutOfStock')}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleOpenAdd}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('addInventoryItem')}
          </button>
        </div>
      </div>

      {/* INVENTORY TABLE VIEW */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[500px] overflow-y-auto">
        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr className="text-slate-500 font-bold uppercase tracking-wider">
              {/* Sequence numbering column starting from one explicitly labelled */}
              <th className="p-3.5 pl-5 text-slate-500 w-16 text-center select-none">{t('tblNo')} (от 1)</th>
              <th className="p-3.5 pl-2 cursor-pointer text-slate-600 hover:bg-slate-100 transition-colors flex-1" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  {t('tblName')}
                  <ArrowUpDown className="w-3.5 h-3.5 stroke-[2]" />
                </div>
              </th>
              <th className="p-3.5">{lang === 'ky' ? 'Штрих-код' : 'Штрих-код'}</th>
              <th className="p-3.5">{t('tblCategory')}</th>
              <th className="p-3.5 cursor-pointer text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => handleSort('price')}>
                <div className="flex items-center gap-1">
                  {t('tblPrice')} (сом)
                  <ArrowUpDown className="w-3.5 h-3.5 stroke-[2]" />
                </div>
              </th>
              <th className="p-3.5 text-center text-slate-500">{lang === 'ky' ? 'Өздүк баасы (закупка)' : 'Закупка (Себестоимость)'}</th>
              <th className="p-3.5 cursor-pointer text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => handleSort('stock')}>
                <div className="flex items-center gap-1">
                  {t('tblStock')}
                  <ArrowUpDown className="w-3.5 h-3.5 stroke-[2]" />
                </div>
              </th>
              <th className="p-3.5 text-right pr-5">{t('tblActions')}</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {processedProducts.map((product, index) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock <= product.minStock && !isOutOfStock;
              const isEditingQuickStock = quickStockId === product.id;

              return (
                <tr 
                  key={product.id} 
                  className={`hover:bg-slate-50/55 transition-colors ${
                    isOutOfStock ? 'bg-rose-50/10' : isLowStock ? 'bg-amber-50/10' : ''
                  }`}
                >
                  {/* Sequence number column starting from 1 */}
                  <td className="p-3.5 pl-5 font-mono text-slate-400 font-bold text-center border-none w-16 select-none bg-slate-50/40">
                    {index + 1}
                  </td>

                  {/* Name with sequence index prefix starting from 1 with visual badge */}
                  <td className="p-3.5 pl-2 font-semibold text-slate-900 border-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-indigo-600 bg-indigo-50/75 border border-indigo-100 font-mono text-[9.5px] px-1.5 py-0.5 rounded-md select-none font-black">
                        № {index + 1}
                      </span>
                      <span className="font-bold text-slate-800">{product.name}</span>
                      <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded select-none">
                        / {product.unit === 'шт' ? (lang === 'ky' ? 'даана' : 'шт') : (product.unit === 'кг' ? (lang === 'ky' ? 'кг' : 'кг') : product.unit)}
                      </span>
                    </div>
                  </td>

                  {/* Barcode */}
                  <td className="p-3.5 whitespace-nowrap font-mono text-slate-500 border-none">
                    <div className="flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{product.barcode}</span>
                    </div>
                  </td>

                  {/* Category badge */}
                  <td className="p-3.5 whitespace-nowrap text-slate-500 border-none">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/50">
                      {getTranslatedCategory(product.category)}
                    </span>
                  </td>

                  {/* Retail retail price (SOM currency) */}
                  <td className="p-3.5 font-bold text-slate-800 border-none">
                    {product.price} сом
                  </td>

                  {/* Profit markup/cost price */}
                  <td className="p-3.5 text-center text-slate-500 border-none font-medium">
                    {product.costPrice} сом
                  </td>

                  {/* Remaining stocks */}
                  <td className="p-3.5 border-none">
                    {isEditingQuickStock ? (
                      <div className="flex items-center gap-1">
                        <input
                           type="number"
                           step="0.01"
                           value={quickStockVal}
                           onChange={(e) => setQuickStockVal(e.target.value)}
                           className="w-16 px-1.5 py-1 text-xs border border-violet-400 rounded outline-none focus:ring-1 focus:ring-violet-400"
                           placeholder={product.stock.toString()}
                           autoFocus
                        />
                        <button
                          onClick={() => handleQuickStockSave(product.id)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setQuickStockId(null)}
                          className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Interactive stock text click triggers fast adjust inline */}
                        <div 
                          onClick={() => { 
                            setQuickStockId(product.id); 
                            setQuickStockVal(product.stock.toString()); 
                          }}
                          className={`font-mono font-bold px-2 py-0.5 rounded cursor-pointer hover:underline flex items-center gap-1 ${
                            isOutOfStock 
                              ? 'text-rose-700 bg-rose-50' 
                              : isLowStock 
                              ? 'text-amber-700 bg-amber-50' 
                              : 'text-slate-800 bg-slate-50 hover:bg-slate-100'
                          }`}
                          title={lang === 'ky' ? 'Калдыкты бат өзгөртүү үчүн басыңыз' : 'Кликните для быстрого редактирования остатка'}
                        >
                          <span>{product.stock} {product.unit === 'шт' ? (lang === 'ky' ? 'даана' : 'шт') : (product.unit === 'кг' ? (lang === 'ky' ? 'кг' : 'кг') : product.unit)}</span>
                        </div>
                        
                        {/* Helper alert warning indicators */}
                        {isOutOfStock && <span className="text-[10px] text-rose-500 font-semibold">{lang === 'ky' ? 'Түгөндү!' : 'Закончился!'}</span>}
                        {isLowStock && <span className="text-[10px] text-amber-500 font-semibold" title={lang === 'ky' ? 'Калдык коопсуздук лимитинен аз калды' : 'Меньше рекомендуемого лимита безопасности'}>{lang === 'ky' ? 'Заказ кылуу керек' : 'Пора заказать'}</span>}
                      </div>
                    )}
                  </td>

                  {/* Action buttons (CRUD options) */}
                  <td className="p-3.5 text-right pr-5 border-none whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                        title={t('editBtn')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title={t('deleteBtn')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {processedProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-slate-200" />
                    <p className="text-xs font-semibold">{lang === 'ky' ? 'Кампада товар табылган жок' : 'Список складов пуст или отфильтрован'}</p>
                    <p className="text-[11px] text-slate-500">{lang === 'ky' ? 'Башка издөө сөзүн жазып көрүңүз же жаңы товар кошуңуз.' : 'Попробуйте ввести другие критерии поиска или добавьте товар.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* QUICK GUIDE FOR WAREHOUSE */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3.5 items-start">
        <Settings className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-slate-800">
            {lang === 'ky' ? 'Жолдо калдыктарды тез оңдоо' : 'Быстрая регулировка остатков на ходу'}
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {lang === 'ky' 
              ? 'Сиз каалаган товардын "Учурдагы калдык" тилкесиндеги сандын үстүнө басып, модалдык терезени ачпастан эле калдыкты тез эле өзгөртө аласыз! Бул инвентаризация (кабыл алуу же жокко чыгаруу) учурунда убакытты абдан үнөмдөйт.' 
              : 'Вы можете кликнуть прямо по значению в столбце "Текущий остаток" у любого товара, чтобы мгновенно скорректировать цифру без открытия модальных окон! Это экономит время при ревизиях (приемке или списании товара).'}
          </p>
        </div>
      </div>

      {/* MODAL: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.21s_ease-out]">
            <div className="bg-indigo-600 p-4.5 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Plus className="w-5 h-5" />
                {t('addModalTitle')}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
              
              {/* Product name */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {t('inputItemName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={lang === 'ky' ? "Мисалы: Сүт Натиже 3.2% 1л" : "Например: Пряники имбирные 300г"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              {/* Barcode with custom generator shortcut */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    {t('inputBarcode')} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, barcode: generateRandomBarcode() })}
                    className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    {t('generateBarcode')}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={lang === 'ky' ? "Кол менен же автоматтык" : "Вручную или сгенерированный"}
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              {/* Dual row category + unit */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Category drop */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {t('inputCategory')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c} value={c}>{getTranslatedCategory(c)}</option>
                    ))}
                  </select>
                </div>

                {/* Unit type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ky' ? 'Өлчөө бирдиги' : 'Единица измерения'}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="шт">{lang === 'ky' ? 'даана (шт.)' : 'штуки (шт.)'}</option>
                    <option value="кг">{lang === 'ky' ? 'килограмм (кг)' : 'килограммы (кг)'}</option>
                    <option value="уп">{lang === 'ky' ? 'таңгак (уп.)' : 'упаковки (уп.)'}</option>
                    <option value="л">{lang === 'ky' ? 'литр (л.)' : 'литры (л.)'}</option>
                  </select>
                </div>

              </div>

              {/* Price rows pricing */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                
                {/* Sale Retail price */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t('inputPrice')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full text-xs font-bold text-indigo-700 px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Purchasing Wholesale costPrice */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ky' ? 'Закупка баасы (сом)' : 'Себестоимость закупки (сом)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full text-xs text-slate-600 px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                    required
                  />
                </div>

              </div>

              {/* Stock and Limits settings */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Current Stock */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {t('inputStock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Danger Stock threshold */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1" title={t('minStockDesc')}>
                    {t('inputMinStock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    required
                  />
                </div>

              </div>

              {/* Actions submit buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {t('addProductSubmit')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.21s_ease-out]">
            <div className="bg-slate-800 p-4.5 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 ml-0.5" />
                {t('editModalTitle')}: {selectedProduct.name}
              </h3>
              <button 
                onClick={() => { setShowEditModal(false); setSelectedProduct(null); }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
              
              {/* Product name */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {t('inputItemName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              {/* Barcode with generator shortcut */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    {t('inputBarcode')} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, barcode: generateRandomBarcode() })}
                    className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    {lang === 'ky' ? 'Жаңы код түзүү' : 'Генерировать новый'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              {/* Select Category + Unit */}
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {t('inputCategory')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c} value={c}>{getTranslatedCategory(c)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ky' ? 'Өлчөө бирдиги' : 'Единица измерения'}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="шт">{lang === 'ky' ? 'даана (шт.)' : 'штуки (шт.)'}</option>
                    <option value="кг">{lang === 'ky' ? 'килограмм (кг)' : 'килограммы (кг)'}</option>
                    <option value="уп">{lang === 'ky' ? 'таңгак (уп.)' : 'упаковки (уп.)'}</option>
                    <option value="л">{lang === 'ky' ? 'литр (л.)' : 'литры (л.)'}</option>
                  </select>
                </div>

              </div>

              {/* Price pricing */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t('inputPrice')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full text-xs font-bold text-indigo-700 px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'ky' ? 'Закупка баасы (сом)' : 'Себестоимость закупки (сом)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full text-xs text-slate-600 px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

              </div>

              {/* Stock settings */}
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {t('inputStock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {t('inputMinStock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    required
                  />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedProduct(null); }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {t('editProductSubmit')}
                </button>
              </div>

            </form>
          </div>
        </div>

      )}

      {/* CUSTOM ALERT MODAL - Iframe safe */}
      {customAlertMsg && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col p-5 gap-4 animate-[scaleIn_0.18s_ease-out]">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-505 animate-bounce" />
              <span>{lang === 'ky' ? 'Кабарлоо' : 'Внимание'}</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              {customAlertMsg}
            </p>

            <button
              onClick={() => setCustomAlertMsg(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              ОК
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE MODAL - Iframe safe */}
      {productPendingDelete && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-[scaleIn_0.18s_ease-out]">
            <div className="bg-rose-600 p-4 text-white flex justify-between items-center select-none font-bold">
              <h4 className="text-xs font-bold uppercase tracking-wider">{lang === 'ky' ? 'Товарды өчүрүү' : 'Удаление товара'}</h4>
              <button 
                onClick={() => setProductPendingDelete(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {lang === 'ky'
                  ? `Сиз чын эле "${productPendingDelete.name}" товарын өчүргүңүз келеби? Бул аракетти артка кайтаруу мүмкүн эмес.`
                  : `Вы действительно хотите навсегда удалить товар "${productPendingDelete.name}"? Это действие невозможно отменить.`}
              </p>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setProductPendingDelete(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProducts(products.filter(item => item.id !== productPendingDelete.id));
                    setProductPendingDelete(null);
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
