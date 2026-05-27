import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, QrCode, ClipboardList, AlertTriangle, Printer, Sparkles, RefreshCw, X, Search, ChevronRight, BookOpen, UserCheck } from 'lucide-react';
import { Product, CartItem, SaleTransaction, Debtor } from '../types';
import { CATEGORIES } from '../data/initialProducts';
import { Language, translations } from '../translations';

interface CashRegisterProps {
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  onAddTransaction: (transaction: SaleTransaction) => void;
  scannedBarcode: string | null;
  onClearScannedBarcode: () => void;
  lang?: Language;
  debtors?: Debtor[];
}

export default function CashRegister({
  products,
  onUpdateProducts,
  onAddTransaction,
  scannedBarcode,
  onClearScannedBarcode,
  lang = 'ru',
  debtors = []
}: CashRegisterProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(lang === 'ky' ? 'Баардык категориялар' : 'Все категории');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr' | 'debt'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<SaleTransaction | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Debt-related checkout states
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>('');
  const [tempDebtorName, setTempDebtorName] = useState<string>('');
  const [tempDebtorPhone, setTempDebtorPhone] = useState<string>('');
  const [isNewDebtor, setIsNewDebtor] = useState<boolean>(false);
  
  // Weighted item modal state
  const [weightedItemToModal, setWeightedItemToModal] = useState<Product | null>(null);
  const [customWeightInput, setCustomWeightInput] = useState<string>('1.00');

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  const getTranslatedCategory = (cat: string) => {
    if (cat === 'Все категории' || cat === 'Баардык категориялар') {
      return lang === 'ky' ? 'Баардык категориялар' : 'Все категории';
    }
    return t(`cat_${cat}`) || cat;
  };

  useEffect(() => {
    setSelectedCategory(lang === 'ky' ? 'Баардык категориялар' : 'Все категории');
  }, [lang]);

  // Trigger when barcode is scanned by parent
  useEffect(() => {
    if (scannedBarcode) {
      const foundProduct = products.find(p => p.barcode === scannedBarcode);
      if (foundProduct) {
        addToCart(foundProduct);
      } else {
        alert(lang === 'ky' ? `Штрих-коду [${scannedBarcode}] болгон товар базадан табылган жок!` : `Товар со штрих-кодом [${scannedBarcode}] не заведен в базу склада!`);
      }
      onClearScannedBarcode();
    }
  }, [scannedBarcode]);

  // Calculations
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const changeValue = parseFloat(amountReceived) ? parseFloat(amountReceived) - totalPrice : 0;

  // Add Item safely
  const addToCart = (product: Product, customQty?: number) => {
    // Check stock limit
    const existing = cart.find(item => item.product.id === product.id);
    const existingQty = existing ? existing.quantity : 0;
    const requestedQty = customQty || (product.unit === 'кг' ? 0.5 : 1);
    const totalRequest = existingQty + requestedQty;

    if (totalRequest > product.stock) {
      alert(lang === 'ky' 
        ? `Кампада товар жетишсиз! Колдо бар: ${product.stock} ${product.unit}. Корзинада: ${totalRequest} ${product.unit}.`
        : `Недостаточно товара на складе! Доступно: ${product.stock} ${product.unit}. Запрошено в корзине: ${totalRequest} ${product.unit}.`
      );
      return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: parseFloat((item.quantity + requestedQty).toFixed(3)) }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: requestedQty }]);
    }
  };

  // Open popup to precisely enter weight for KG items
  const handleWeightedItemClick = (product: Product) => {
    setWeightedItemToModal(product);
    setCustomWeightInput('1.00');
  };

  const submitWeightedItem = () => {
    if (!weightedItemToModal) return;
    const weight = parseFloat(customWeightInput);
    if (isNaN(weight) || weight <= 0) {
      alert(lang === 'ky' ? "Сураныч, туура салмакты киргизиңиз" : "Пожалуйста, введите корректный вес");
      return;
    }
    
    // Check if enough stock
    const existing = cart.find(item => item.product.id === weightedItemToModal.id);
    const existingQty = existing ? existing.quantity : 0;
    if (existingQty + weight > weightedItemToModal.stock) {
      alert(lang === 'ky' 
        ? `Кампада товар жетишсиз! Калган запас: ${weightedItemToModal.stock} кг.`
        : `Недостаточно товара на складе! Оставшийся запас: ${weightedItemToModal.stock} кг.`
      );
      return;
    }

    addToCart(weightedItemToModal, weight);
    setWeightedItemToModal(null);
  };

  // Direct edit of qty
  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(c => c.product.id === productId);
    if (!item) return;

    const newQty = parseFloat((item.quantity + delta).toFixed(3));
    
    if (newQty <= 0) {
      // Remove
      setCart(cart.filter(c => c.product.id !== productId));
      return;
    }

    // Check stock
    if (newQty > item.product.stock) {
      alert(lang === 'ky' 
        ? `Кампада товар жетишсиз! Болгону: ${item.product.stock} ${item.product.unit}.`
        : `Недостаточно остатка на складе! Доступно всего: ${item.product.stock} ${item.product.unit}.`
      );
      return;
    }

    setCart(cart.map(c => 
      c.product.id === productId 
        ? { ...c, quantity: newQty } 
        : c
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // COMPLETE SALE
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(lang === 'ky' ? "Корзина бош!" : "Корзина пуста!");
      return;
    }

    // Validate that all items are still in stock before finalizing (double check)
    for (const item of cart) {
      const currentDbProduct = products.find(p => p.id === item.product.id);
      if (!currentDbProduct) {
        alert(lang === 'ky' ? `Ката: Товар ${item.product.name} кампада жок!` : `Ошибка: Товар ${item.product.name} больше не существует на складе!`);
        return;
      }
      if (currentDbProduct.stock < item.quantity) {
        alert(lang === 'ky' 
          ? `Ката! Товар ${item.product.name} өзгөрдү. Кампада болгону ${currentDbProduct.stock} калды, чекте ${item.quantity}. Азайтыңыз.`
          : `Ошибка! Товар ${item.product.name} был изменен. На складе осталось всего ${currentDbProduct.stock}, а в чеке ${item.quantity}. Сократите количество.`
        );
        return;
      }
    }

    if (paymentMethod === 'debt') {
      if (isNewDebtor) {
        if (!tempDebtorName.trim()) {
          alert(lang === 'ky' ? "Карыз алуучунун атын жазыңыз!" : "Пожалуйста, укажите имя должника!");
          return;
        }
      } else {
        if (!selectedDebtorId) {
          alert(lang === 'ky' ? "Карыз алуучуну тандаңыз же жаңы кошуңуз!" : "Пожалуйста, выберите должника или создайте нового!");
          return;
        }
      }
    }

    const totalCostPrice = cart.reduce((sum, item) => sum + (item.product.costPrice * item.quantity), 0);
    const roundedTotal = parseFloat(totalPrice.toFixed(2));
    const paidAmount = paymentMethod === 'cash' ? (parseFloat(amountReceived) || roundedTotal) : roundedTotal;
    const changeAmount = parseFloat((paidAmount - roundedTotal).toFixed(2));

    const finalDebtorName = paymentMethod === 'debt'
      ? (isNewDebtor ? tempDebtorName.trim() : (debtors.find(d => d.id === selectedDebtorId)?.name || ''))
      : undefined;

    const finalDebtorPhone = paymentMethod === 'debt'
      ? (isNewDebtor ? tempDebtorPhone.trim() : (debtors.find(d => d.id === selectedDebtorId)?.phone || ''))
      : undefined;

    const newTransaction: SaleTransaction = {
      id: "TRX-" + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        costPrice: item.product.costPrice,
        quantity: item.quantity,
        unit: item.product.unit
      })),
      totalPrice: roundedTotal,
      totalCostPrice: parseFloat(totalCostPrice.toFixed(2)),
      paymentMethod,
      amountReceived: paymentMethod === 'debt' ? 0 : paidAmount,
      change: paymentMethod === 'debt' ? 0 : (changeAmount >= 0 ? changeAmount : 0),
      debtorName: finalDebtorName,
      debtorPhone: finalDebtorPhone
    };

    // Update real stock levels on Server/Database state
    const updatedProductsList = products.map(p => {
      const soldItem = cart.find(c => c.product.id === p.id);
      if (soldItem) {
        return {
          ...p,
          // Subtract stock with proper fractional roundings
          stock: parseFloat((p.stock - soldItem.quantity).toFixed(3))
        };
      }
      return p;
    });

    onUpdateProducts(updatedProductsList);
    onAddTransaction(newTransaction);
    setLastTransaction(newTransaction);
    setShowReceiptModal(true);

    // Reset register checkout inputs
    setCart([]);
    setAmountReceived('');
    setSelectedDebtorId('');
    setTempDebtorName('');
    setTempDebtorPhone('');
    setIsNewDebtor(false);
  };

  // Filter catalog products
  const filteredProducts = products.filter(product => {
    const isAllLabel = selectedCategory === 'Все категории' || selectedCategory === 'Баардык категориялар';
    const matchesCategory = isAllLabel || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.barcode.includes(searchQuery);
    const matchesInStock = !onlyInStock || product.stock >= 1;
    return matchesCategory && matchesSearch && matchesInStock;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
      
      {/* LEFT AREA: CATALOG & SEARCH & SPEED ACCESSIBILITY (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* SEARCH AND FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder-sidebar"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick categories pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {['Все категории', ...CATEGORIES].map(cat => {
              const displayLabel = getTranslatedCategory(cat);
              const isSelected = selectedCategory === cat || (cat === 'Все категории' && (selectedCategory === 'Все категории' || selectedCategory === 'Баардык категориялар'));
              
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'Все категории' ? (lang === 'ky' ? 'Баардык категориялар' : 'Все категории') : cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-50'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                id="onlyInStockCheckbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>{t('onlyInStock')}</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {t('onStockCount')} {products.filter(p => p.stock >= 1).length} / {products.length}
            </span>
          </div>
        </div>

        {/* CATALOG GRID */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              {t('catalogTitle')}
              <span className="text-xs font-normal text-slate-400">
                ({filteredProducts.length} {lang === 'ky' ? 'наам' : 'наим.'})
              </span>
            </h3>
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory(lang === 'ky' ? 'Баардык категориялар' : 'Все категории'); }}
                className="text-xs text-emerald-600 hover:underline cursor-pointer"
              >
                {t('resetSearch')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredProducts.map((product, index) => {
              const isLowStock = product.stock <= product.minStock;
              const isOutOfStock = product.stock <= 0;
              
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (isOutOfStock) return;
                    if (product.unit === 'кг') {
                      handleWeightedItemClick(product);
                    } else {
                      addToCart(product);
                    }
                  }}
                  className={`relative p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between h-36 select-none ${
                    isOutOfStock 
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:bg-emerald-50/10 hover:border-emerald-200 border-slate-100 shadow-sm cursor-pointer hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    {/* Category Label */}
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                      {getTranslatedCategory(product.category)}
                    </span>
                    {/* Item Name */}
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug flex items-baseline gap-1">
                      <span className="text-emerald-700 font-mono text-[9px] bg-emerald-50 px-1 rounded select-none flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{product.name}</span>
                    </h4>
                  </div>

                  <div className="mt-3">
                    {/* Stock indicator badge */}
                    <div className="flex items-center gap-1 mb-1.5">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-rose-50 text-rose-700">
                          {t('outOfStock')}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-500" />
                          {t('stockQty')}: {product.stock} {product.unit}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {t('stockQty')}: <strong className="font-semibold text-slate-700">{product.stock} {product.unit}</strong>
                        </span>
                      )}
                    </div>

                    {/* Price and Add item indicator */}
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
                      <span className="text-xs font-bold text-slate-800">
                        {product.price} сом <span className="text-[10px] font-normal text-slate-400">/{product.unit}</span>
                      </span>
                      {!isOutOfStock && (
                        <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors">
                          <Plus className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium">{lang === 'ky' ? 'Бул категорияда товар табылган жок' : 'Товары в данной категории не найдены'}</p>
                <p className="text-[11px] text-slate-500">{lang === 'ky' ? 'Башка штрих-код же ат киргизип көрүңүз' : 'Попробуйте ввести другой штрих-код или название'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: CURRENT CART (RECEIPT SIMULATOR) & CHECKOUT (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* SHOPPING REGISTER CART */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden">
          
          {/* CART HEADER */}
          <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold">{t('cashReceipt')}</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] bg-slate-700 hover:bg-slate-600 hover:text-rose-200 px-2.5 py-1 rounded-md text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                {t('btnClear')}
              </button>
            )}
          </div>

          {/* LIST OF CART ITEMS */}
          <div className="p-4 bg-slate-50 border-b border-dashed border-slate-200 max-h-[300px] overflow-y-auto flex flex-col gap-2">
            {cart.map(item => {
              const itemTotal = item.product.price * item.quantity;
              
              return (
                <div 
                  key={item.product.id} 
                  className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-slate-800 truncate" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.product.price} сом x {item.quantity} {item.product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.product.unit === 'кг' ? -0.1 : -1)}
                        className="p-1 hover:bg-white text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-800 px-2 min-w-[36px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.product.unit === 'кг' ? 0.1 : 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 hover:bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Total cost for this product */}
                    <span className="text-xs font-bold text-slate-800 min-w-[62px] text-right font-mono">
                      {itemTotal.toFixed(2)} сом
                    </span>

                    {/* Trash Delete */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50/50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {cart.length === 0 && (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-1.5">
                <ShoppingCart className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-medium">{t('cartEmpty')}</p>
                <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                  {t('cartEmptyDetail')}
                </p>
              </div>
            )}
          </div>

          {/* CHECKOUT CALCULATORS & TOTALS */}
          <div className="p-4 bg-white flex flex-col gap-4">
            
            {/* Totals Summary */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{t('totalLinesCount')}:</span>
                <span className="font-semibold text-slate-700">{cart.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">{t('totalToPay')}:</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {totalPrice.toFixed(2)} сом
                </span>
              </div>
            </div>

            {/* If Cart Not Empty: Provide payment entry */}
            {cart.length > 0 && (
              <div className="flex flex-col gap-3">
                {/* PAYMENT METHOD SELECTOR */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                    {t('payMethod')}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('cash'); setAmountReceived(''); }}
                      className={`py-2 px-1.5 text-[10px] sm:text-xs font-semibold rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-700 font-bold'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      {t('cashPayment')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('card'); setAmountReceived(''); }}
                      className={`py-2 px-1.5 text-[10px] sm:text-xs font-semibold rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-700 font-bold'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {t('cardPayment')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('qr'); setAmountReceived(''); }}
                      className={`py-2 px-1.5 text-[10px] sm:text-xs font-semibold rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'qr'
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-700 font-bold'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      {t('qrPayment')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('debt'); setAmountReceived(''); }}
                      className={`py-2 px-1.5 text-[10px] sm:text-xs font-semibold rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'debt'
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-700 font-bold'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-slate-600 group-hover:text-emerald-500" />
                      <span>{lang === 'ky' ? 'Карызга' : 'В долг'}</span>
                    </button>
                  </div>
                </div>

                {/* DEBTOR SELECTOR FOR DEBT PAYMENT */}
                {paymentMethod === 'debt' && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-700">{t('debtorSelectOrCreate')}</span>
                      <div className="flex bg-slate-200/65 rounded-lg p-0.5 select-none text-[10px]">
                        <button
                          type="button"
                          onClick={() => setIsNewDebtor(false)}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${!isNewDebtor ? 'bg-white text-emerald-850 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          {lang === 'ky' ? 'Тизмеден тандоо' : 'Из списка'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsNewDebtor(true)}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer ${isNewDebtor ? 'bg-white text-emerald-850 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          {lang === 'ky' ? '+ Жаңы кошуу' : '+ Новый'}
                        </button>
                      </div>
                    </div>

                    {!isNewDebtor ? (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === 'ky' ? 'Кардарды тандаңыз' : 'Выберите клиента'}</label>
                        {debtors.length > 0 ? (
                          <select
                            value={selectedDebtorId}
                            onChange={(e) => setSelectedDebtorId(e.target.value)}
                            className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer focus:border-emerald-500"
                          >
                            <option value="">{lang === 'ky' ? '-- Кардар тандаңыз --' : '-- Выберите должника --'}</option>
                            {debtors.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name} {d.phone ? `(${d.phone})` : ''} — {lang === 'ky' ? 'карызы:' : 'карызы:'} {d.totalDebt} сом
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-center py-2 text-[11px] text-slate-500">
                            <p className="text-[10px] italic mb-1.5">{lang === 'ky' ? 'Должниктердин тизмеси бош. Жаңы кошуңуз!' : 'Список должников пуст. Зарегистрируйте нового!'}</p>
                            <button
                              type="button"
                              onClick={() => setIsNewDebtor(true)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                            >
                              {lang === 'ky' ? 'Жаңы должник түзүү' : 'Создать новый профиль'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{t('debtorNameInput')}</label>
                          <input
                            type="text"
                            placeholder="Асан Садыков"
                            value={tempDebtorName}
                            onChange={(e) => setTempDebtorName(e.target.value)}
                            className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{t('debtorPhoneInput')}</label>
                          <input
                            type="text"
                            placeholder="0555123456"
                            value={tempDebtorPhone}
                            onChange={(e) => setTempDebtorPhone(e.target.value.replace(/[^0-9+() -]/g, ''))}
                            className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASH RECEIVED INPUTS (ONLY IF CASH IS SELECTED) */}
                {paymentMethod === 'cash' && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-600">
                        {t('cashReceivedAmount')}
                      </label>
                      <span className="text-[10px] text-slate-400">{t('toComputeChange')}</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Например: 1000"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-emerald-500/50"
                      />
                      
                      {/* Round numeric shortcut chips */}
                      {[100, 200, 500, 1000, 2000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmountReceived(val.toString())}
                          className="bg-white hover:bg-slate-100 text-slate-700 px-2 py-1 text-[10px] font-bold border border-slate-200 rounded-md shadow-sm cursor-pointer transition-all"
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {/* Change calculator output */}
                    {parseFloat(amountReceived) > 0 && (
                      <div className="flex justify-between items-center text-xs mt-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500">{t('changeToClient')}:</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          changeValue >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                        }`}>
                          {changeValue >= 0 ? `${changeValue.toFixed(2)} сом` : `${t('needMoreAmount')} ${(Math.abs(changeValue)).toFixed(2)} сом`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* PLACE ORDER ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={paymentMethod === 'cash' && parseFloat(amountReceived) > 0 && changeValue < 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer flex justify-center items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  {t('btnExecuteCheckout')}
                </button>
              </div>
            )}

            {/* Cart helper warning */}
            {cart.length === 0 && (
              <div className="text-center py-2 text-[11px] text-slate-400 italic">
                {t('waitingForCart')}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* WEIGHT ENTRY DIALOG */}
      {weightedItemToModal && (
        <div className="fixed inset-0 z-50 bg-black/55 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-teal-750 px-5 py-4 text-white flex justify-between items-center">
              <h4 className="text-sm font-bold">{t('weightedItemTitle')}</h4>
              <button 
                onClick={() => setWeightedItemToModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wide">{t('tabInventory')}</span>
                <span className="block text-sm font-bold text-slate-800 mt-0.5">{weightedItemToModal.name}</span>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                  <span>Цена: {weightedItemToModal.price} сом / кг</span>
                  <span>Остаток: {weightedItemToModal.stock} кг</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  {t('weightedExactPrompt')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Пример: 0.75"
                    value={customWeightInput}
                    onChange={(e) => setCustomWeightInput(e.target.value)}
                    className="w-full text-lg font-black text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-teal-500 p-3 rounded-xl focus:ring-4 focus:ring-teal-500/10"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                    кг
                  </span>
                </div>
                
                {/* Quick Weight selectors */}
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  {['0.10', '0.25', '0.50', '1.00', '1.50', '2.00'].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setCustomWeightInput(w)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-1 py-2 text-xs font-bold rounded-lg cursor-pointer border border-slate-100 transition-all"
                    >
                      {parseFloat(w)} кг
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant math calculation */}
              {parseFloat(customWeightInput) > 0 && (
                <div className="flex justify-between items-center text-sm font-bold border-t border-slate-100 pt-3 text-slate-800">
                  <span>{t('totalItemPrice')}:</span>
                  <span className="text-teal-700 font-mono">
                    {(weightedItemToModal.price * parseFloat(customWeightInput)).toFixed(2)} сом
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setWeightedItemToModal(null)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-3.5 rounded-xl cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  onClick={submitWeightedItem}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  {t('btnAddToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REALISTIC THERMAL RECEIPT MODAL */}
      {showReceiptModal && lastTransaction && (
        <div className="fixed inset-0 z-50 bg-black/65 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.25s_ease-out]">
            
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold">{t('receiptDone')}</h4>
              </div>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="p-6 bg-amber-50/20 max-h-[460px] overflow-y-auto font-sans">
              
              {/* Receipt paper simulator */}
              <div className="bg-white border border-dashed border-slate-300 p-5 rounded-md shadow-md text-slate-800 font-mono text-xs leading-relaxed max-w-[290px] mx-auto">
                <div className="text-center font-bold mb-1 border-b border-dashed border-slate-300 pb-2">
                  <p className="text-sm tracking-wide">МИНИ-МАРКЕТ</p>
                  <p className="text-[10px] font-normal text-slate-500">ИНН: 102450892019</p>
                  <p className="text-[10px] font-normal text-slate-500">Бишкек шаары, Чүй пр. 114</p>
                </div>

                <div className="my-3 text-[10px] text-slate-500 border-b border-dashed border-slate-200 pb-1.5 flex flex-col gap-0.5">
                  <p>{lang === 'ky' ? 'Кассалык Чек' : 'Кассовый Чек'}: <strong className="text-slate-700">{lastTransaction.id}</strong></p>
                  <p>{lang === 'ky' ? 'Күнү/Убактысы' : 'Дата/Время'}: {new Date(lastTransaction.timestamp).toLocaleString('ru-RU')}</p>
                  <p>{lang === 'ky' ? 'Оператор' : 'Кассир'}: Web Cashier</p>
                </div>

                {/* Items detailed list in receipt */}
                <div className="flex flex-col gap-2 border-b border-dashed border-slate-200 pb-2">
                  <div className="flex justify-between font-bold text-[10px] text-slate-500">
                    <span>{lang === 'ky' ? 'ТОВАРДЫН АТЫ / САНЫ' : 'НАИМЕНОВАНИЕ / ЕД.'}</span>
                    <span>{lang === 'ky' ? 'БААСЫ' : 'СТОИМОСТЬ'}</span>
                  </div>
                  
                  {lastTransaction.items.map((item, idx) => {
                    const priceString = `${item.price} сом x ${item.quantity} ${item.unit}`;
                    const lineTotal = (item.price * item.quantity).toFixed(2);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-0.5 leading-tight text-left">
                        <span className="font-bold text-[11px] text-slate-800">{item.productName}</span>
                        <div className="flex justify-between items-center text-[10px] text-slate-600">
                          <span>{priceString}</span>
                          <span className="font-bold">{lineTotal} сом</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calculations details */}
                <div className="my-3 flex flex-col gap-1 border-b border-dashed border-slate-200 pb-2 text-left">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{lang === 'ky' ? 'ЖЫЙЫНТЫК:' : 'ИТОГ:'}</span>
                    <span>{lastTransaction.totalPrice.toFixed(2)} сом</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>{lang === 'ky' ? 'Төлөм ыкмасы:' : 'Вид оплаты:'}</span>
                    <span>
                      {lastTransaction.paymentMethod === 'cash' ? (lang === 'ky' ? 'НАК' : 'НАЛИЧНЫЕ') :
                       lastTransaction.paymentMethod === 'card' ? (lang === 'ky' ? 'КАРТА' : 'БЕЗНАЛИЧНЫЕ/КАРТА') :
                       lastTransaction.paymentMethod === 'qr' ? 'СБП / QR' : (lang === 'ky' ? 'КАРЫЗГА (ДОЛГ)' : 'В ДОЛГ')}
                    </span>
                  </div>

                  {lastTransaction.paymentMethod === 'debt' && lastTransaction.debtorName && (
                    <>
                      <div className="flex justify-between text-[10px] text-rose-800 font-bold border-t border-dotted border-slate-300 pt-1.5 mt-1">
                        <span>{lang === 'ky' ? 'Карыз алуучу:' : 'Должник:'}</span>
                        <span>{lastTransaction.debtorName}</span>
                      </div>
                      {lastTransaction.debtorPhone && (
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span>{lang === 'ky' ? 'Телефон:' : 'Телефон:'}</span>
                          <span>{lastTransaction.debtorPhone}</span>
                        </div>
                      )}
                    </>
                  )}

                  {lastTransaction.paymentMethod === 'cash' && (
                    <>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{lang === 'ky' ? 'Алынды:' : 'Принято:'}</span>
                        <span>{lastTransaction.amountReceived.toFixed(2)} сом</span>
                      </div>
                      <div className="flex justify-between font-bold text-[11px] text-emerald-800">
                        <span>{lang === 'ky' ? 'КАЙТАРЫМ:' : 'СДАЧА:'}</span>
                        <span>{lastTransaction.change.toFixed(2)} сом</span>
                      </div>
                    </>
                  )}
                </div>

                {/* QR Code mock representing electronic fiscal receipt receipt */}
                <div className="flex flex-col items-center gap-1 text-[9px] text-slate-400 mt-4 text-center">
                  <div className="p-1 border border-slate-200 rounded-md bg-white">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                  <p className="mt-1">{lang === 'ky' ? 'Харид үчүн рахмат!' : 'Спасибо за покупку!'}</p>
                  <p>ФП: {Math.random().toString().slice(2, 12)}</p>
                </div>

              </div>
            </div>

            {/* Print trigger button action mock */}
            <div className="p-4 bg-slate-100 flex gap-2.5">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer flex justify-center items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {t('btnPrintReceipt')}
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                {t('btnNewSale')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

