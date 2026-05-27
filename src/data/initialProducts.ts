import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Молоко Свежее 3.2%',
    price: 89,
    costPrice: 55,
    barcode: '4601234567890',
    category: 'Молочные продукты',
    stock: 25,
    minStock: 5,
    unit: 'шт'
  },
  {
    id: '2',
    name: 'Хлеб Нарезной Бородинский',
    price: 45,
    costPrice: 28,
    barcode: '4609876543210',
    category: 'Хлеб и Выпечка',
    stock: 15,
    minStock: 4,
    unit: 'шт'
  },
  {
    id: '3',
    name: 'Сыр Российский 50%',
    price: 750,
    costPrice: 520,
    barcode: '4601112223334',
    category: 'Молочные продукты',
    stock: 8.5,
    minStock: 2,
    unit: 'кг'
  },
  {
    id: '4',
    name: 'Яйцо куриное С1 (десяток)',
    price: 110,
    costPrice: 75,
    barcode: '4602223334445',
    category: 'Яйца и Масло',
    stock: 30,
    minStock: 6,
    unit: 'уп'
  },
  {
    id: '5',
    name: 'Колбаса Докторская ГОСТ',
    price: 540,
    costPrice: 380,
    barcode: '4603334445556',
    category: 'Мясная гастрономия',
    stock: 12,
    minStock: 3,
    unit: 'кг'
  },
  {
    id: '6',
    name: 'Масло Сливочное 82.5%',
    price: 180,
    costPrice: 120,
    barcode: '4604445556667',
    category: 'Яйца и Масло',
    stock: 40,
    minStock: 10,
    unit: 'шт'
  },
  {
    id: '7',
    name: 'Бананы Эквадор',
    price: 129,
    costPrice: 85,
    barcode: '4605556667778',
    category: 'Овощи и Фрукты',
    stock: 18.5,
    minStock: 5,
    unit: 'кг'
  },
  {
    id: '8',
    name: 'Сахар-песок фасованный',
    price: 65,
    costPrice: 42,
    barcode: '4606667778889',
    category: 'Бакалея',
    stock: 50,
    minStock: 15,
    unit: 'кг'
  },
  {
    id: '9',
    name: 'Чай Черный крупнолистовой',
    price: 199,
    costPrice: 130,
    barcode: '4607778889990',
    category: 'Бакалея',
    stock: 22,
    minStock: 5,
    unit: 'уп'
  },
  {
    id: '10',
    name: 'Вода питьевая негазированная 1.5л',
    price: 35,
    costPrice: 15,
    barcode: '4608889990001',
    category: 'Напитки',
    stock: 60,
    minStock: 12,
    unit: 'шт'
  },
  {
    id: '11',
    name: 'Шоколад Аленка 90г',
    price: 95,
    costPrice: 60,
    barcode: '4609990001112',
    category: 'Сладости',
    stock: 35,
    minStock: 8,
    unit: 'шт'
  },
  {
    id: '12',
    name: 'Кофе молотый 250г',
    price: 380,
    costPrice: 250,
    barcode: '4600001112223',
    category: 'Бакалея',
    stock: 14,
    minStock: 4,
    unit: 'шт'
  }
];

export const CATEGORIES = [
  'Все категории',
  'Молочные продукты',
  'Хлеб и Выпечка',
  'Яйца и Масло',
  'Мясная гастрономия',
  'Овощи и Фрукты',
  'Бакалея',
  'Напитки',
  'Сладости'
];
