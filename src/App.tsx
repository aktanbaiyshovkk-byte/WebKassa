import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  LayoutGrid, 
  Receipt, 
  AlertTriangle, 
  Calculator, 
  Clock, 
  CheckCircle, 
  Database, 
  LogOut, 
  User, 
  Users,
  ShieldAlert, 
  BookOpen, 
  Store as StoreIcon, 
  ArrowLeft,
  X
} from 'lucide-react';
import { UserAccount, Product, SaleTransaction, Debtor, DebtRecord, Store, SystemLog } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import BarcodeScanner from './components/BarcodeScanner';
import CashRegister from './components/CashRegister';
import InventoryManager from './components/InventoryManager';
import SalesHistory from './components/SalesHistory';
import LoginScreen from './components/LoginScreen';
import DebtorsManager from './components/DebtorsManager';
import EmployeesManager from './components/EmployeesManager';
import PortalScreen from './components/PortalScreen';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AppGatekeeper from './components/AppGatekeeper';
import { Language, translations } from './translations';

const DEFAULT_USERS: UserAccount[] = [
  { id: 'u-1', name: 'Бектур Саматов', role: 'admin', pin: '1111', avatarBg: 'bg-indigo-600' },
  { id: 'u-2', name: 'Айпери Нурланова', role: 'cashier', pin: '2222', avatarBg: 'bg-emerald-600' },
  { id: 'u-3', name: 'Кубан Болотов', role: 'cashier', pin: '3333', avatarBg: 'bg-amber-600' },
];

const generateInitialStores = (): Store[] => {
  const oomatProducts = [...INITIAL_PRODUCTS];
  const oomatUsers = [
    { id: 'u-o1', name: 'Канат Касымов', role: 'admin' as const, pin: '5555', avatarBg: 'bg-emerald-600' }
  ];

  const frunzeProducts = INITIAL_PRODUCTS.map(p => ({
    ...p,
    price: parseFloat((p.price * 1.1).toFixed(1)),
    costPrice: parseFloat((p.costPrice * 1.05).toFixed(1)),
    stock: p.stock - 5 >= 0 ? p.stock - 5 : p.stock
  }));
  const frunzeUsers = [
    { id: 'u-f1', name: 'Асан Ушуров', role: 'admin' as const, pin: '7777', avatarBg: 'bg-indigo-600' },
    { id: 'u-f2', name: 'Нурбек Осмонов', role: 'cashier' as const, pin: '2222', avatarBg: 'bg-purple-600' }
  ];

  // Store 1: Ала-Тоо (interactive store)
  const store1: Store = {
    id: 'store-1',
    name: 'Мини-маркет Ала-Тоо',
    code: '101',
    ownerName: 'Асель Сатыбалдиева',
    createdAt: new Date(Date.now() - 1000 * 3605 * 24 * 10).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 3605 * 3).toISOString(),
    isCurrentlyOnline: false,
    users: DEFAULT_USERS,
    products: INITIAL_PRODUCTS,
    transactions: [
      {
        id: 'TRX-101',
        timestamp: new Date(Date.now() - 1000 * 3600 * 2.5).toISOString(),
        items: [
          { productId: 'p-1', productName: 'Хлеб булка (Белый)', price: 25, costPrice: 18, quantity: 2, unit: 'шт' },
          { productId: 'p-5', productName: 'Молоко "Веселый молочник" 3.2%', price: 85, costPrice: 68, quantity: 1, unit: 'литр' }
        ],
        totalPrice: 135,
        totalCostPrice: 104,
        paymentMethod: 'cash',
        amountReceived: 200,
        change: 65,
        cashierName: 'Айпери Нурланова'
      },
      {
        id: 'TRX-102',
        timestamp: new Date(Date.now() - 1000 * 3600 * 23).toISOString(),
        items: [
          { productId: 'p-7', productName: 'Чай "Пиала" черный', price: 120, costPrice: 95, quantity: 2, unit: 'уп.' }
        ],
        totalPrice: 240,
        totalCostPrice: 190,
        paymentMethod: 'card',
        amountReceived: 240,
        change: 0,
        cashierName: 'Бектур Саматов'
      }
    ],
    debtors: [
      {
        id: 'dbt-1',
        name: 'Расул Кадыров',
        phone: '0707123456',
        createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 5).toISOString(),
        totalDebt: 350,
        history: [
          {
            id: 'debt-rec-1',
            date: new Date(Date.now() - 1000 * 3600 * 24 * 5).toISOString(),
            amount: 350,
            type: 'borrow' as const,
            comment: 'Покупка по чеку №TRX-8321'
          }
        ]
      }
    ]
  };

  const store2: Store = {
    id: 'store-2',
    name: 'Фрунзе Экспресс',
    code: '102',
    ownerName: 'Асан Ушуров',
    createdAt: new Date(Date.now() - 1000 * 3605 * 24 * 15).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 3605 * 1).toISOString(),
    isCurrentlyOnline: false,
    users: frunzeUsers,
    products: frunzeProducts,
    transactions: [
      {
        id: 'TRX-103',
        timestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
        items: [
          { productId: 'p-25', productName: 'Вода Легенда 1.5л', price: 35, costPrice: 25, quantity: 4, unit: 'шт' }
        ],
        totalPrice: 140,
        totalCostPrice: 100,
        paymentMethod: 'qr',
        amountReceived: 140,
        change: 0,
        cashierName: 'Камила Керимова'
      }
    ],
    debtors: [
      {
        id: 'dbt-2',
        name: 'Самат Орозов',
        phone: '0555987654',
        createdAt: new Date(Date.now() - 1000 * 3605 * 24 * 8).toISOString(),
        totalDebt: 1200,
        history: [
          {
            id: 'debt-rec-2',
            date: new Date(Date.now() - 1000 * 3605 * 24 * 8).toISOString(),
            amount: 1200,
            type: 'borrow' as const,
            comment: 'Карызга чек TRX-4012'
          }
        ]
      }
    ]
  };

  const store3: Store = {
    id: 'store-3',
    name: 'Дүкөн "Оомат"',
    code: '103',
    ownerName: 'Эрмек Тороев',
    createdAt: new Date(Date.now() - 1000 * 3605 * 24 * 2).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 3605 * 8).toISOString(),
    isCurrentlyOnline: false,
    users: oomatUsers,
    products: oomatProducts,
    transactions: [],
    debtors: []
  };

  return [store1, store2, store3];
};

const generateInitialLogs = (): SystemLog[] => {
  return [
    {
      id: 'log-sys-1',
      timestamp: new Date(Date.now() - 1000 * 3600 * 24 * 10).toISOString(),
      storeId: 'store-1',
      storeName: 'Ала-Тоо',
      action: 'Магазин "Мини-маркет Ала-Тоо" зарегистрирован в облачной POS-сети.',
      type: 'system'
    },
    {
      id: 'log-sys-2',
      timestamp: new Date(Date.now() - 1000 * 3600 * 24 * 5).toISOString(),
      storeId: 'store-2',
      storeName: 'Фрунзе Экспресс',
      action: 'Магазин "Фрунзе Экспресс" зарегистрирован в облачной POS-сети.',
      type: 'system'
    },
    {
      id: 'log-sys-3',
      timestamp: new Date(Date.now() - 1000 * 3600 * 4).toISOString(),
      storeId: 'store-1',
      storeName: 'Ала-Тоо',
      action: 'Кассир Айпери Нурланова заступила на смену в терминал.',
      type: 'user'
    },
    {
      id: 'log-sys-4',
      timestamp: new Date(Date.now() - 1000 * 3600 * 2.5).toISOString(),
      storeId: 'store-1',
      storeName: 'Ала-Тоо',
      action: 'Зарегистрирована продажа по чеку TRX-101 на сумму 135 сом (наличные).',
      type: 'sale'
    }
  ];
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('pos_lang');
    return (saved === 'ky' || saved === 'ru') ? (saved as Language) : 'ru';
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('pos_lang', newLang);
  };

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  // MULTI TENANCY STATES
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(() => {
    return sessionStorage.getItem('pos_current_store_id') || null;
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('pos_is_superadmin') === 'true';
  });
  const [viewingSuperAdmin, setViewingSuperAdmin] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // Isolated store states (synced on demand based on currentStoreId)
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  
  // Scanned barcode relay state
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'register' | 'inventory' | 'history' | 'debtors' | 'employees'>('register');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto Tick time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydrate states from browser LocalStorage persists
  useEffect(() => {
    const savedStores = localStorage.getItem('pos_cloud_stores');
    const savedLogs = localStorage.getItem('pos_system_logs');
    
    let loadedStores: Store[] = [];
    if (savedStores) {
      try {
        loadedStores = JSON.parse(savedStores);
        
        // Ensure backward compatibility: assign codes (101, 102...) to stores that don't have them
        let updated = false;
        loadedStores = loadedStores.map((s, idx) => {
          if (!s.code) {
            s.code = (101 + idx).toString();
            updated = true;
          }
          return s;
        });

        if (updated) {
          localStorage.setItem('pos_cloud_stores', JSON.stringify(loadedStores));
        }
        setStores(loadedStores);
      } catch (e) {
        const init = generateInitialStores();
        setStores(init);
        localStorage.setItem('pos_cloud_stores', JSON.stringify(init));
        loadedStores = init;
      }
    } else {
      const init = generateInitialStores();
      setStores(init);
      localStorage.setItem('pos_cloud_stores', JSON.stringify(init));
      loadedStores = init;
    }

    if (savedLogs) {
      try {
        setSystemLogs(JSON.parse(savedLogs));
      } catch (e) {
        setSystemLogs(generateInitialLogs());
      }
    } else {
      const initLogs = generateInitialLogs();
      setSystemLogs(initLogs);
      localStorage.setItem('pos_system_logs', JSON.stringify(initLogs));
    }

    // Hydrate current active store specific profile session
    const savedSessionUser = sessionStorage.getItem('pos_current_user');
    if (savedSessionUser) {
      try {
        setCurrentUser(JSON.parse(savedSessionUser));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  // Synchronize isolated states dynamically when switching stores
  useEffect(() => {
    if (currentStoreId && stores.length > 0) {
      const matching = stores.find(s => s.id === currentStoreId);
      if (matching) {
        setProducts(matching.products);
        setTransactions(matching.transactions);
        setUsers(matching.users);
        setDebtors(matching.debtors);
      }
    } else {
      setProducts([]);
      setTransactions([]);
      setUsers([]);
      setDebtors([]);
    }
  }, [currentStoreId, stores]);

  const addSystemLog = (storeId: string, storeName: string, actionText: string, logType: SystemLog['type']) => {
    const newLog: SystemLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      storeId,
      storeName: storeName.replace(/Мини-маркет\s*|Магазин\s*|Дүкөн\s*/i, '').slice(0, 10),
      action: actionText,
      type: logType
    };
    setSystemLogs(prev => {
      const nextLogs = [newLog, ...prev];
      localStorage.setItem('pos_system_logs', JSON.stringify(nextLogs));
      return nextLogs;
    });
  };

  // Helper: Toggle block status
  const handleToggleBlockStore = (storeId: string) => {
    setStores(prev => {
      const nextStores = prev.map(s => {
        if (s.id === storeId) {
          const toggledState = !s.isBlocked;
          addSystemLog(
            s.id,
            s.name,
            toggledState ? `Филиал "${s.name}" временно заблокирован суперадминистратором системы.` : `Филиал "${s.name}" успешно разблокирован.`,
            'system'
          );
          return {
            ...s,
            isBlocked: toggledState,
            isCurrentlyOnline: toggledState ? false : s.isCurrentlyOnline
          };
        }
        return s;
      });
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });
  };

  // Helper: Delete a store
  const handleDeleteStore = (storeId: string) => {
    const target = stores.find(s => s.id === storeId);
    setStores(prev => {
      const nextStores = prev.filter(s => s.id !== storeId);
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });
    if (target) {
      addSystemLog(storeId, target.name, `База данных "${target.name}" стерта и удалена из облака.`, 'system');
    }
    if (currentStoreId === storeId) {
      setCurrentStoreId(null);
      setCurrentUser(null);
      sessionStorage.removeItem('pos_current_store_id');
      sessionStorage.removeItem('pos_current_user');
    }
  };

  // Helper: Select store directly
  const handleSelectStore = (storeId: string) => {
    const target = stores.find(s => s.id === storeId);
    if (target && target.isBlocked) {
      alert(lang === 'ky' ? 'Дүкөн бөгөттөлгөн!' : 'Этот магазин временно заблокирован управляющей компанией!');
      return;
    }
    setCurrentStoreId(storeId);
    sessionStorage.setItem('pos_current_store_id', storeId);
    
    // Set store as currently online!
    setStores(prev => {
      const nextStores = prev.map(s => s.id === storeId ? { ...s, isCurrentlyOnline: true, lastActiveAt: new Date().toISOString() } : s);
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });

    if (target) {
      addSystemLog(storeId, target.name, `Сессия кассы запущена под надзором терминала.`, 'user');
    }
  };

  // Helper: Create/Register store
  const handleCreateStore = (name: string, ownerName: string, populateDemo: boolean) => {
    const newId = 'store-' + Date.now();
    
    // Auto-increment short code based on highest existing code to avoid duplicates
    const maxCode = stores.reduce((max, s) => {
      const num = s.code ? Number(s.code) : 0;
      return !isNaN(num) && num > max ? num : max;
    }, 100);
    const newCode = (maxCode + 1).toString();

    const newStore: Store = {
      id: newId,
      name,
      code: newCode,
      ownerName,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isCurrentlyOnline: false,
      users: DEFAULT_USERS,
      products: populateDemo ? INITIAL_PRODUCTS : [],
      transactions: [],
      debtors: []
    };

    const nextStores = [...stores, newStore];
    setStores(nextStores);
    localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));

    addSystemLog(newId, name, `Зарегистрирована новая торговая точка "${name}" (Код доступа: ${newCode}, Владелец: ${ownerName}).`, 'system');
  };

  // Helper: Enter Store as guest/auditor directly
  const handleEnterStoreAsGuest = (storeId: string) => {
    const target = stores.find(s => s.id === storeId);
    if (!target) return;

    setCurrentStoreId(storeId);
    sessionStorage.setItem('pos_current_store_id', storeId);
    
    // Pre-login as Admin guest
    const guestAdmin = target.users.find(u => u.role === 'admin') || target.users[0] || DEFAULT_USERS[0];
    setCurrentUser(guestAdmin);
    sessionStorage.setItem('pos_current_user', JSON.stringify(guestAdmin));
    
    // Set store as online
    setStores(prev => {
      const nextStores = prev.map(s => s.id === storeId ? { ...s, isCurrentlyOnline: true, lastActiveAt: new Date().toISOString() } : s);
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });

    setViewingSuperAdmin(false);
    setActiveTab('register');

    addSystemLog(storeId, target.name, `Суперадмин зашел в систему как гость-администратор (${guestAdmin.name}).`, 'user');
  };

  // Heartbeat helper for active status togglers
  const handleSetStoreOnline = (storeId: string, isOnline: boolean) => {
    setStores(prev => {
      const nextStores = prev.map(s => s.id === storeId ? { ...s, isCurrentlyOnline: isOnline, lastActiveAt: new Date().toISOString() } : s);
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });
  };

  // Run the simulation sale log
  const handleSimulateBackgroundSale = (storeId: string) => {
    const targetStore = stores.find(s => s.id === storeId);
    if (!targetStore) return;

    if (targetStore.products.length === 0) {
      alert(lang === 'ky' ? 'Товарлар тизмеси бош!' : 'Каталог товаров этого магазина пуст!');
      return;
    }

    const randomIdx = Math.floor(Math.random() * targetStore.products.length);
    const chosenProduct = targetStore.products[randomIdx];

    const sellQty = Math.floor(Math.random() * 2) + 1;
    let updatedProducts = [...targetStore.products];
    const newStock = Math.max(0, chosenProduct.stock - sellQty);
    updatedProducts[randomIdx] = {
      ...chosenProduct,
      stock: parseFloat(newStock.toFixed(3))
    };

    const totalVal = parseFloat((chosenProduct.price * sellQty).toFixed(2));
    const totalCost = parseFloat((chosenProduct.costPrice * sellQty).toFixed(2));
    
    const randomCashier = targetStore.users[Math.floor(Math.random() * targetStore.users.length)]?.name || 'Авто-Кассир';
    const paymentMethods: ('cash' | 'card' | 'qr')[] = ['cash', 'card', 'qr'];
    const selectedPay = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    const simulatedTrx: SaleTransaction = {
      id: 'TRX-' + Math.floor(1000 + Math.random() * 9000).toString(),
      timestamp: new Date().toISOString(),
      items: [
        {
          productId: chosenProduct.id,
          productName: chosenProduct.name,
          price: chosenProduct.price,
          costPrice: chosenProduct.costPrice,
          quantity: sellQty,
          unit: chosenProduct.unit
        }
      ],
      totalPrice: totalVal,
      totalCostPrice: totalCost,
      paymentMethod: selectedPay,
      amountReceived: totalVal,
      change: 0,
      cashierName: randomCashier
    };

    const updatedTrxs = [simulatedTrx, ...targetStore.transactions];

    const formattedStoreName = targetStore.name.replace(/Мини-маркет\s*|Магазин\s*|Дүкөн\s*/i, '').slice(0, 10);
    const logText = lang === 'ky'
      ? `Фондук сатуу: Кассир ${randomCashier} "${chosenProduct.name}" товардан ${sellQty} ${chosenProduct.unit} ${totalVal} сомго сатты.`
      : `Фоновая продажа: Кассир ${randomCashier} продал "${chosenProduct.name}" (${sellQty} ${chosenProduct.unit}) на сумму ${totalVal} сом.`;

    // Update global state and serialize
    setStores(prev => {
      const nextStores = prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            products: updatedProducts,
            transactions: updatedTrxs,
            lastActiveAt: new Date().toISOString()
          };
        }
        return s;
      });
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });

    addSystemLog(storeId, targetStore.name, logText, 'sale');

    // If active store is simulated, synchronize locally too!
    if (storeId === currentStoreId) {
      setProducts(updatedProducts);
      setTransactions(updatedTrxs);
    }
  };

  // Login handler
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    sessionStorage.setItem('pos_current_user', JSON.stringify(user));
    setActiveTab('register');

    const store = stores.find(s => s.id === currentStoreId);
    if (store) {
      addSystemLog(currentStoreId!, store.name, `Кассир ${user.name} вошел в кассу и заступил на смену.`, 'user');
    }
  };

  // Logout / Lock terminal
  const handleLogout = () => {
    const store = stores.find(s => s.id === currentStoreId);
    if (store && currentUser) {
      addSystemLog(currentStoreId!, store.name, `Кассир ${currentUser.name} закрыл сессию кассы.`, 'user');
    }
    setCurrentUser(null);
    sessionStorage.removeItem('pos_current_user');
  };

  // Create new user profile inside active store terminal
  const handleCreateUser = (name: string, role: 'admin' | 'cashier', pin: string) => {
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-purple-600', 'bg-sky-600', 'bg-pink-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name,
      role,
      pin,
      avatarBg: randomColor
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    if (currentStoreId) {
      setStores(prev => {
        const nextStores = prev.map(s => s.id === currentStoreId ? { ...s, users: updatedUsers } : s);
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });
      const store = stores.find(s => s.id === currentStoreId);
      if (store) {
        addSystemLog(currentStoreId, store.name, `Создан профиль кассира: ${name} (${role === 'admin' ? 'Администратор' : 'Продавец'}).`, 'user');
      }
    }
  };

  // Delete user profile inside active store terminal
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);

    // If active logged in user is deleted, return to login/lock screen
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem('pos_current_user');
    }

    if (currentStoreId) {
      setStores(prev => {
        const nextStores = prev.map(s => s.id === currentStoreId ? { ...s, users: updatedUsers } : s);
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });
      const store = stores.find(s => s.id === currentStoreId);
      if (store) {
        addSystemLog(currentStoreId, store.name, `Удален профиль сотрудника: ${userToDelete.name} (${userToDelete.role === 'admin' ? 'Администратор' : 'Продавец'}).`, 'user');
      }
    }
  };

  // Update user PIN/profile inside active store terminal
  const handleUpdateUserPin = (userId: string, newPin: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updatedUsers = users.map(u => u.id === userId ? { ...u, pin: newPin } : u);
    setUsers(updatedUsers);

    // If active logged in user's PIN is changed, update currentUser in state and sessionStorage so login remains valid
    if (currentUser && currentUser.id === userId) {
      const updatedMe = { ...currentUser, pin: newPin };
      setCurrentUser(updatedMe);
      sessionStorage.setItem('pos_current_user', JSON.stringify(updatedMe));
    }

    if (currentStoreId) {
      setStores(prev => {
        const nextStores = prev.map(s => s.id === currentStoreId ? { ...s, users: updatedUsers } : s);
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });
      const store = stores.find(s => s.id === currentStoreId);
      if (store) {
        addSystemLog(currentStoreId, store.name, `Изменен PIN-код сотрудника: ${targetUser.name} (${targetUser.role === 'admin' ? 'Администратор' : 'Продавец'}).`, 'user');
      }
    }
  };

  // Synchronize products updates
  const handleUpdateProducts = (updatedList: Product[]) => {
    setProducts(updatedList);
    if (currentStoreId) {
      setStores(prev => {
        const nextStores = prev.map(s => s.id === currentStoreId ? { ...s, products: updatedList } : s);
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });
    }
  };

  // Record a completed transaction
  const handleAddTransaction = (newTrx: SaleTransaction) => {
    const currentStore = stores.find(s => s.id === currentStoreId);
    const richTrx: SaleTransaction = {
      ...newTrx,
      cashierName: currentUser?.name || (lang === 'ky' ? 'Системалык кассир' : 'Системный кассир')
    };
    
    const updatedTransactionsList = [richTrx, ...transactions];
    setTransactions(updatedTransactionsList);

    // Support Debt update
    let nextDebtors = [...debtors];
    if (richTrx.paymentMethod === 'debt' && richTrx.debtorName) {
      const debtorName = richTrx.debtorName.trim();
      const debtorPhone = richTrx.debtorPhone?.trim();
      
      const existingDebtor = debtors.find(d => d.name.toLowerCase() === debtorName.toLowerCase());
      const newRecord: DebtRecord = {
        id: 'DEBT-' + Date.now().toString(),
        date: richTrx.timestamp,
        amount: richTrx.totalPrice,
        type: 'borrow',
        comment: lang === 'ky' ? `Чек боюнча сатып алуу №${richTrx.id}` : `Покупка по чеку №${richTrx.id}`,
        transactionId: richTrx.id
      };

      if (existingDebtor) {
        nextDebtors = debtors.map(d => {
          if (d.id === existingDebtor.id) {
            return {
              ...d,
              phone: debtorPhone || d.phone,
              history: [...d.history, newRecord],
              totalDebt: parseFloat((d.totalDebt + richTrx.totalPrice).toFixed(2))
            };
          }
          return d;
        });
      } else {
        const newDebtor: Debtor = {
          id: 'DBT-' + Date.now().toString(),
          name: debtorName,
          phone: debtorPhone,
          createdAt: richTrx.timestamp,
          totalDebt: richTrx.totalPrice,
          history: [newRecord]
        };
        nextDebtors = [...debtors, newDebtor];
      }
      setDebtors(nextDebtors);
    }

    if (currentStoreId && currentStore) {
      // Deduct stock for sold items in target store products
      const nextProductsMap = products.map(p => {
        const cartMatch = richTrx.items.find(item => item.productId === p.id);
        if (cartMatch) {
          return {
            ...p,
            stock: parseFloat(Math.max(0, p.stock - cartMatch.quantity).toFixed(3))
          };
        }
        return p;
      });
      setProducts(nextProductsMap);

      setStores(prev => {
        const nextStores = prev.map(s => {
          if (s.id === currentStoreId) {
            return {
              ...s,
              transactions: updatedTransactionsList,
              products: nextProductsMap,
              debtors: nextDebtors
            };
          }
          return s;
        });
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });

      const payWord = richTrx.paymentMethod === 'debt' ? 'карызга' : 'за наличный/безналичный расчет';
      addSystemLog(currentStoreId, currentStore.name, `Новая сделка ${richTrx.id} на сумму ${richTrx.totalPrice} сом (${payWord}).`, 'sale');
    }
  };

  // Re-load initial product demo data helper for active store
  const handleResetToDefault = () => {
    setShowResetConfirmModal(true);
  };

  const executeResetToDefault = () => {
    if (currentStoreId) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions([]);
      setDebtors([]);
      setStores(prev => {
        const nextStores = prev.map(s => {
          if (s.id === currentStoreId) {
            return {
              ...s,
              products: INITIAL_PRODUCTS,
              transactions: [],
              debtors: []
            };
          }
          return s;
        });
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });

      const store = stores.find(s => s.id === currentStoreId);
      if (store) {
        addSystemLog(currentStoreId, store.name, `База данных магазина сброшена до заводских демонстрационных настроек.`, 'system');
      }
    }
    setShowResetConfirmModal(false);
  };

  // Refund transaction complete
  const handleRefundTransaction = (transactionId: string) => {
    const trx = transactions.find(t => t.id === transactionId);
    if (!trx || !currentStoreId) return;

    // Reset items quantity stocks
    const restoredProducts = products.map(p => {
      const soldItem = trx.items.find(i => i.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stock: parseFloat((p.stock + soldItem.quantity).toFixed(3))
        };
      }
      return p;
    });

    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    let updatedDebtors = [...debtors];

    // Reverse debtor record if debt checkout
    if (trx.paymentMethod === 'debt' && trx.debtorName) {
      const debtorName = trx.debtorName.trim();
      updatedDebtors = debtors.map(d => {
        if (d.name.toLowerCase() === debtorName.toLowerCase()) {
          const newRecord: DebtRecord = {
            id: 'DEBT-REF-' + Date.now().toString(),
            date: new Date().toISOString(),
            amount: -trx.totalPrice,
            type: 'repay' as const,
            comment: lang === 'ky' ? `Кайтаруу чеги боюнча №${trx.id}` : `Возврат по чеку №${trx.id}`,
            transactionId: trx.id
          };
          const computedDebt = parseFloat((d.totalDebt - trx.totalPrice).toFixed(2));
          return {
            ...d,
            history: [...d.history, newRecord],
            totalDebt: computedDebt >= 0 ? computedDebt : 0
          };
        }
        return d;
      });
      setDebtors(updatedDebtors);
    }

    setProducts(restoredProducts);
    setTransactions(updatedTransactions);

    setStores(prev => {
      const nextStores = prev.map(s => {
        if (s.id === currentStoreId) {
          return {
            ...s,
            products: restoredProducts,
            transactions: updatedTransactions,
            debtors: updatedDebtors
          };
        }
        return s;
      });
      localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
      return nextStores;
    });

    const store = stores.find(s => s.id === currentStoreId);
    addSystemLog(currentStoreId, store?.name || 'Касса', `Произведен возврат по чеку №${transactionId} на сумму ${trx.totalPrice} сом.`, 'refund');
  };

  // Wrapper for debtors list state updates inside store
  const handleUpdateDebtorsListObj = (updatedDebtors: Debtor[]) => {
    setDebtors(updatedDebtors);
    if (currentStoreId) {
      setStores(prev => {
        const nextStores = prev.map(s => s.id === currentStoreId ? { ...s, debtors: updatedDebtors } : s);
        localStorage.setItem('pos_cloud_stores', JSON.stringify(nextStores));
        return nextStores;
      });
      
      const store = stores.find(s => s.id === currentStoreId);
      if (store) {
        addSystemLog(currentStoreId, store.name, `Обновлена ведомость должников (активных долгов: ${updatedDebtors.filter(d => d.totalDebt > 0).length}).`, 'debt');
      }
    }
  };

  // Compile Warnings
  const lowStockItemsCount = products.filter(p => p.stock <= p.minStock).length;

  // VIEW ROUTER FLOW
  if (viewingSuperAdmin && isSuperAdmin) {
    return (
      <SuperAdminDashboard
        stores={stores}
        systemLogs={systemLogs}
        onBackToPortal={() => setViewingSuperAdmin(false)}
        onToggleBlockStore={handleToggleBlockStore}
        onDeleteStore={handleDeleteStore}
        onEnterStoreAsGuest={handleEnterStoreAsGuest}
        onSimulateBackgroundSale={handleSimulateBackgroundSale}
        lang={lang}
      />
    );
  }

  if (!isSuperAdmin && !currentStoreId) {
    return (
      <AppGatekeeper
        stores={stores}
        onUnlockSuperAdmin={() => {
          setIsSuperAdmin(true);
          setViewingSuperAdmin(true);
          sessionStorage.setItem('pos_is_superadmin', 'true');
        }}
        onEnterStore={(storeId) => {
          handleSelectStore(storeId);
        }}
        lang={lang}
        onLangChange={handleSetLang}
      />
    );
  }

  if (!currentStoreId) {
    return (
      <PortalScreen
        stores={stores}
        onSelectStore={handleSelectStore}
        onCreateStore={handleCreateStore}
        onEnterSuperAdmin={() => setViewingSuperAdmin(true)}
        onLogoutSuperAdmin={() => {
          setIsSuperAdmin(false);
          setViewingSuperAdmin(false);
          sessionStorage.removeItem('pos_is_superadmin');
        }}
        lang={lang}
      />
    );
  }

  // Protect Active Store with lockscren authentication
  if (!currentUser) {
    const activeStoreObj = stores.find(s => s.id === currentStoreId);
    return (
      <div className="relative">
        {/* Universal Exit back to Gatekeeper or Stores Portal */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          {!isSuperAdmin ? (
            <button
              id="btn-lockscreen-return-to-gatekeeper"
              onClick={() => {
                handleSetStoreOnline(currentStoreId, false);
                setCurrentStoreId(null);
                sessionStorage.removeItem('pos_current_store_id');
              }}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] shadow-sm select-none"
            >
              ← {lang === 'ky' ? 'Башкы бетке кайтуу' : 'Назад к вводу кода'}
            </button>
          ) : (
            <button
              id="btn-lockscreen-return-to-portal"
              onClick={() => {
                handleSetStoreOnline(currentStoreId, false);
                setCurrentStoreId(null);
                sessionStorage.removeItem('pos_current_store_id');
              }}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] shadow-sm select-none"
            >
              ← {lang === 'ky' ? 'Дүкөндөр порталы' : 'Портал магазинов'}
            </button>
          )}
        </div>

        {/* Live Active Store Info Watermark in corner */}
        <div className="absolute top-4 right-4 z-40 hidden md:block select-none text-right">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-slate-900/40 border border-slate-800/80 px-2.5 py-1 rounded-xl">
            🏛️ {activeStoreObj?.name}
          </span>
        </div>

        <LoginScreen 
          users={users} 
          onLogin={handleLogin} 
          onCreateUser={handleCreateUser} 
          onDeleteUser={handleDeleteUser}
          lang={lang}
          onLangChange={handleSetLang}
        />
      </div>
    );
  }

  // Check role restrictions
  const isAdmin = currentUser.role === 'admin';

  return (
    <div id="app-workspace-main" className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* HEADER BAR AND TITLE CLOCK */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo, Brand and ACTIVE STORE */}
          <div className="flex items-center gap-3 select-none">
            <div className="p-2.5 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-md sm:text-lg font-black tracking-tight">{t('appName')}</h1>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/10 uppercase tracking-wider font-mono">
                  {stores.find(s => s.id === currentStoreId)?.name || 'Касса'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{t('appSubtitle')}</p>
            </div>
          </div>

          {/* User profile, notifications indicators, language toggler, metrics */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs ml-auto lg:ml-0">
            
            {/* Exit/Return to Portal Button inside Workspace (Only visible for Superadmin) */}
            {isSuperAdmin && (
              <button
                id="workplace-exit-to-portal"
                onClick={() => {
                  handleLogout();
                  handleSetStoreOnline(currentStoreId, false);
                  setCurrentStoreId(null);
                  sessionStorage.removeItem('pos_current_store_id');
                }}
                className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 border border-slate-750 p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                title="Переключить розничный магазин торгово-облачной цепи "
              >
                <StoreIcon className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Филиалы</span>
              </button>
            )}

            {/* Language Selection Toggle inside app workspace */}
            <div className="flex items-center bg-slate-800/85 border border-slate-700/60 rounded-xl p-1 shadow-inner select-none">
              <button
                onClick={() => handleSetLang('ru')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${
                  lang === 'ru' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => handleSetLang('ky')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${
                  lang === 'ky' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                КЫР
              </button>
            </div>

            {/* Operator account profile widget with logout click */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-705 rounded-2xl px-3 py-1.5 shadow-sm">
              <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-inner select-none ${currentUser.avatarBg}`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left select-none">
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1 leading-snug">
                  {currentUser.name.split(' ')[0]}
                  {isAdmin ? (
                    <span className="text-[7.5px] tracking-wide font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 px-1 py-0.2 rounded">{t('roleAdmin')}</span>
                  ) : (
                    <span className="text-[7.5px] tracking-wide font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/10 px-1 py-0.2 rounded">{t('roleCashier')}</span>
                  )}
                </h3>
                <p className="text-[9px] text-slate-500 font-medium tracking-wide uppercase leading-none mt-0.5">{t('terminalOperator')}</p>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-1 hover:bg-rose-955/40 text-slate-400 hover:text-rose-400 rounded-md transition-colors cursor-pointer border border-transparent hover:border-rose-900/30 ml-2"
                title="Чыгуу / Блокировать терминал"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live interactive clock */}
            <div className="bg-slate-800 border border-slate-700/60 px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-slate-300 selection:bg-transparent">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="font-mono font-bold">
                {currentTime.toLocaleTimeString('ru-RU')}
              </span>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItemsCount > 0 ? (
              <button
                onClick={() => { if (isAdmin) { setActiveTab('inventory'); } }}
                disabled={!isAdmin}
                className={`border text-slate-300 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 font-bold transition-all ${
                  isAdmin 
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300 cursor-pointer animate-pulse' 
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed'
                }`}
                title={isAdmin ? "Смотреть остатки" : "Мало товаров на складе"}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>{t('lowStockAlert')}{lowStockItemsCount}</span>
              </button>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-2.5 rounded-xl flex items-center gap-1.5 font-bold select-none">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t('stockOk')}</span>
              </div>
            )}

            {/* Reset default products inside selected store (Admin only) */}
            {isAdmin && (
              <button
                onClick={handleResetToDefault}
                className="bg-slate-800 hover:bg-slate-700/80 hover:text-white text-slate-400 border border-slate-700/60 p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="Сбросить все тестовые данные этого филиала"
              >
                <Database className="w-3.5 h-3.5" />
              </button>
            )}

          </div>

        </div>
      </header>

      {/* PRIMARY VIEWS DIVISION NAV BAR (TABS SELECTOR) */}
      <nav className="bg-white border-b border-slate-200 shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2">
            
            {/* Tab: POS Cash Desk */}
            <button
              onClick={() => setActiveTab('register')}
              className={`py-3.5 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold bg-emerald-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {t('tabRegister')}
            </button>
 
            {/* Tab: Stock inventory Manager (Role check) */}
            {isAdmin ? (
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold bg-indigo-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t('tabInventory')}
              </button>
            ) : (
              <div 
                className="py-3.5 px-5 text-xs font-semibold border-b-2 border-transparent text-slate-300 flex items-center gap-2 select-none cursor-not-allowed"
                title={t('tabRestrictedDesc')}
              >
                <LayoutGrid className="w-4 h-4 text-slate-300/60" />
                <span className="line-through text-slate-400 font-normal">{t('tabInventory')}</span>
                <span className="text-[9px] font-black tracking-wide uppercase bg-slate-100/80 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🔐 lock
                </span>
              </div>
            )}

            {/* Tab: Sales Analytics and logs (Role check) */}
            {isAdmin ? (
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'border-cyan-600 text-cyan-700 font-extrabold bg-cyan-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                {t('tabHistory')}
              </button>
            ) : (
              <div 
                className="py-3.5 px-5 text-xs font-semibold border-b-2 border-transparent text-slate-300 flex items-center gap-2 select-none cursor-not-allowed"
                title={t('tabRestrictedDesc')}
              >
                <Receipt className="w-4 h-4 text-slate-300/60" />
                <span className="line-through text-slate-400 font-normal">{t('tabHistory')}</span>
                <span className="text-[9px] font-black tracking-wide uppercase bg-slate-100/80 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🔐 lock
                </span>
              </div>
            )}

            {/* Tab: Debtors Manager (Role check) */}
            {isAdmin ? (
              <button
                onClick={() => setActiveTab('debtors')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'debtors'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold bg-indigo-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {lang === 'ky' ? 'Карыздар' : 'Должники'}
              </button>
            ) : (
              <div 
                className="py-3.5 px-5 text-xs font-semibold border-b-2 border-transparent text-slate-300 flex items-center gap-2 select-none cursor-not-allowed"
                title={t('tabRestrictedDesc')}
              >
                <BookOpen className="w-4 h-4 text-slate-300/60" />
                <span className="line-through text-slate-400 font-normal">{lang === 'ky' ? 'Карыздар' : 'Должники'}</span>
                <span className="text-[9px] font-black tracking-wide uppercase bg-slate-100/80 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🔐 lock
                </span>
              </div>
            )}

            {/* Tab: Employees Manager (Role check) */}
            {isAdmin ? (
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'employees'
                    ? 'border-indigo-600 text-indigo-700 font-extrabold bg-indigo-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                {t('tabEmployees')}
              </button>
            ) : (
              <div 
                className="py-3.5 px-5 text-xs font-semibold border-b-2 border-transparent text-slate-300 flex items-center gap-2 select-none cursor-not-allowed"
                title={t('tabRestrictedDesc')}
              >
                <Users className="w-4 h-4 text-slate-300/60" />
                <span className="line-through text-slate-400 font-normal">{t('tabEmployees')}</span>
                <span className="text-[9px] font-black tracking-wide uppercase bg-slate-100/80 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🔐 lock
                </span>
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* CORE FRAME FOR TABS RENDER CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        
        {/* TAB 1: POS SYSTEM REGISTRATION VIEW WITH BARCODE SCAN */}
        {activeTab === 'register' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Area Barcode scanner */}
            <div className="xl:col-span-4 flex flex-col gap-4 bg-slate-900 border border-slate-850 p-4 rounded-3xl shadow-sm text-white select-none relative overflow-hidden">
              <BarcodeScanner 
                onScan={(barcode) => setScannedBarcode(barcode)} 
                productList={products}
                lang={lang}
              />
            </div>

            {/* Right Area Checkout Cash Register drawer cart  */}
            <div className="xl:col-span-8 h-full">
              <CashRegister
                products={products}
                onUpdateProducts={handleUpdateProducts}
                onAddTransaction={handleAddTransaction}
                scannedBarcode={scannedBarcode}
                onClearScannedBarcode={() => setScannedBarcode(null)}
                lang={lang}
                debtors={debtors}
              />
            </div>

          </div>
        )}

        {/* TAB 2: STOCK INVENTORY MANAGEMENT TAB (CRUD) - Admin only guard */}
        {activeTab === 'inventory' && isAdmin && (
          <div className="animate-[fadeIn_0.21s_ease-out]">
            <InventoryManager
              products={products}
              onUpdateProducts={handleUpdateProducts}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 3: HISTORY TRANSACTIONS LOGS & MOCK FISCAL LAUNCHER - Admin only guard */}
        {activeTab === 'history' && isAdmin && (
          <div className="animate-[fadeIn_0.21s_ease-out]">
            <SalesHistory
              transactions={transactions}
              products={products}
              onRefundTransaction={handleRefundTransaction}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 4: DEBTORS LEDGER & MANAGEMENT - Admin only guard */}
        {activeTab === 'debtors' && isAdmin && (
          <div className="animate-[fadeIn_0.21s_ease-out]">
            <DebtorsManager
              debtors={debtors}
              onUpdateDebtors={handleUpdateDebtorsListObj}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 5: EMPLOYEES MANAGER & PIN EDITOR - Admin only guard */}
        {activeTab === 'employees' && isAdmin && currentUser && (
          <div className="animate-[fadeIn_0.21s_ease-out]">
            <EmployeesManager
              users={users}
              currentUser={currentUser}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUserPin={handleUpdateUserPin}
              lang={lang}
            />
          </div>
        )}

        {/* ACCESS DENIED PLACEHOLDER if somehow someone ends up on a restricted tab */}
        {((activeTab === 'inventory' || activeTab === 'history' || activeTab === 'debtors' || activeTab === 'employees') && !isAdmin) && (
          <div className="bg-white border border-slate-150 p-12 text-center rounded-2xl shadow-sm flex flex-col items-center justify-center gap-4 max-w-md mx-auto my-12">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm select-none">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-md font-extrabold text-slate-800">{t('errAccessDenied')}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {t('errAccessDeniedDesc')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('register')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              {t('btnReturnToRegister')}
            </button>
          </div>
        )}

      </main>

      {/* BOTTOM LEGAL LICENSING FOOTER */}
      <footer className="bg-white border-t border-slate-205 py-3.5 text-center text-slate-400 text-[11px] leading-relaxed select-none">
        <p>© 2026 POS Multi-Cloud Tenant Node • Разработано для мини-продуктовых сетей в Google AI Studio • Версия 1.4.0 (Фискальный режим)</p>
      </footer>

      {/* CUSTOM CONFIRM RESET DATABASE MODAL - Iframe safe */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-[scaleIn_0.18s_ease-out]">
            <div className="bg-rose-600 p-4 text-white flex justify-between items-center select-none font-bold">
              <h4 className="text-xs font-bold uppercase tracking-wider">{lang === 'ky' ? 'Базаны баштапкы абалга келтирүү' : 'Сброс базы данных'}</h4>
              <button 
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {lang === 'ky'
                  ? 'Сиз чын эле учурдагы филиалдын бардык маалыматтарын баштапкы дефолт абалына өчүрүп келтиргиңиз келеби? Бул аракетти артка кайтаруу мүмкүн эмес.'
                  : 'Вы действительно хотите сбросить все внесенные изменения этого филиала и вернуть демонстрационные товары по умолчанию? Все текущие продажи будут очищены.'}
              </p>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="button"
                  onClick={executeResetToDefault}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer font-bold"
                >
                  {lang === 'ky' ? 'Нөлгө салуу' : 'Сбросить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
