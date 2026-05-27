export interface UserAccount {
  id: string;
  name: string;
  role: 'admin' | 'cashier';
  pin: string; // 4-digit PIN for quick terminal authentication
  avatarBg: string; // Tailwind background class for the user icon
}

export interface Product {
  id: string;
  name: string;
  price: number;       // розничная цена в рублях
  costPrice: number;   // себестоимость (цена закупки)
  barcode: string;     // штрих-код
  category: string;    // категория
  stock: number;       // остаток на складе
  minStock: number;    // минимальный порог остатка
  unit: string;        // единица измерения (шт., кг., литр и т.д.)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleTransaction {
  id: string;
  timestamp: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    costPrice: number;
    quantity: number;
    unit: string;
  }[];
  totalPrice: number;
  totalCostPrice: number;
  paymentMethod: 'cash' | 'card' | 'qr' | 'debt';
  amountReceived: number; // сколько дал покупатель (для сдачи)
  change: number;         // сдача
  cashierName?: string;   // имя кассира, совершившего продажу
  debtorName?: string;    // имя должника
  debtorPhone?: string;   // телефон должника
}

export interface DebtRecord {
  id: string;
  date: string;
  amount: number;         // положительно при займе, отрицательно при возврате
  type: 'borrow' | 'repay';
  comment?: string;
  transactionId?: string;
}

export interface Debtor {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
  totalDebt: number;
  history: DebtRecord[];
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

export interface Store {
  id: string;
  name: string;
  code?: string;          // уникальный короткий код филиала для входа (например, 101, 102...)
  ownerName: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrentlyOnline?: boolean;
  isBlocked?: boolean;
  users: UserAccount[];
  products: Product[];
  transactions: SaleTransaction[];
  debtors: Debtor[];
}

export interface SystemLog {
  id: string;
  timestamp: string;
  storeId: string;
  storeName: string;
  action: string;
  type: 'sale' | 'repay' | 'refund' | 'product' | 'user' | 'system' | 'debt';
}

