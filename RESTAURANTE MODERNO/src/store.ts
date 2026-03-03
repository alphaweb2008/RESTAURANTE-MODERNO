import { create } from 'zustand';
import type { MenuItem, Reservation, BusinessInfo, Order } from './types';
import {
  saveBusinessInfo,
  listenBusinessInfo,
  saveMenuItem,
  deleteMenuItem as fbDeleteMenuItem,
  listenMenu,
  saveReservation as fbSaveReservation,
  updateReservation as fbUpdateReservation,
  deleteReservation as fbDeleteReservation,
  deleteAllReservations as fbDeleteAllReservations,
  listenReservations,
  saveAdminPassword,
  listenAdminPassword,
  saveOrder as fbSaveOrder,
  updateOrder as fbUpdateOrder,
  deleteOrder as fbDeleteOrder,
  deleteAllOrders as fbDeleteAllOrders,
  listenOrders,
} from './firebaseService';

interface AppState {
  // Business
  businessName: string;
  logoUrl: string;
  phone: string;
  address: string;
  slogan: string;
  aboutText?: string;
  aboutImage1?: string;
  aboutImage2?: string;
  setBusinessInfo: (info: BusinessInfo) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;

  // Reservations
  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  removeReservation: (id: string) => void;
  clearAllReservations: () => void;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  removeOrder: (id: string) => void;
  clearAllOrders: () => void;

  // Admin
  adminPassword: string;
  isAdminLoggedIn: boolean;
  setAdminLoggedIn: (v: boolean) => void;
  changePassword: (newPass: string) => void;

  // Loading
  loading: boolean;

  // Init listeners
  initFirebase: () => void;
}

export const useStore = create<AppState>((set) => ({
  businessName: 'Restaurante',
  logoUrl: '',
  phone: '',
  address: '',
  slogan: '',
  aboutText: '',
  aboutImage1: '',
  aboutImage2: '',
  menuItems: [],
  reservations: [],
  orders: [],
  adminPassword: 'admin123',
  isAdminLoggedIn: false,
  loading: true,

  setBusinessInfo: (info) => {
    set({
      businessName: info.businessName,
      logoUrl: info.logoUrl,
      phone: info.phone,
      address: info.address,
      slogan: info.slogan,
    });
    saveBusinessInfo(info);
  },

  addMenuItem: async (item) => {
    await saveMenuItem({ ...item, id: '' });
  },

  updateMenuItem: async (item) => {
    await saveMenuItem(item);
  },

  removeMenuItem: async (id) => {
    await fbDeleteMenuItem(id);
  },

  addReservation: async (res) => {
    await fbSaveReservation(res);
  },

  updateReservationStatus: async (id, status) => {
    await fbUpdateReservation(id, { status });
  },

  removeReservation: async (id) => {
    await fbDeleteReservation(id);
  },

  clearAllReservations: async () => {
    await fbDeleteAllReservations();
  },

  // Orders
  addOrder: async (order) => {
    await fbSaveOrder(order);
  },

  updateOrderStatus: async (id, status) => {
    await fbUpdateOrder(id, { status });
  },

  removeOrder: async (id) => {
    await fbDeleteOrder(id);
  },

  clearAllOrders: async () => {
    await fbDeleteAllOrders();
  },

  setAdminLoggedIn: (v) => {
    set({ isAdminLoggedIn: v });
    if (v) {
      sessionStorage.setItem('adminLoggedIn', 'true');
    } else {
      sessionStorage.removeItem('adminLoggedIn');
    }
  },

  changePassword: (newPass) => {
    set({ adminPassword: newPass });
    saveAdminPassword(newPass);
  },

  initFirebase: () => {
    listenBusinessInfo((info) => {
      set({
        businessName: info.businessName || 'Restaurante',
        logoUrl: info.logoUrl || '',
        phone: info.phone || '',
        address: info.address || '',
        slogan: info.slogan || '',
        aboutText: info.aboutText || '',
        aboutImage1: info.aboutImage1 || '',
        aboutImage2: info.aboutImage2 || '',
        loading: false,
      });
    });

    listenMenu((items) => {
      set({ menuItems: items, loading: false });
    });

    listenReservations((items) => {
      set({ reservations: items });
    });

    listenOrders((items) => {
      set({ orders: items });
    });

    listenAdminPassword((password) => {
      set({ adminPassword: password });
    });

    const wasLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (wasLoggedIn) {
      set({ isAdminLoggedIn: true });
    }

    setTimeout(() => {
      set({ loading: false });
    }, 3000);
  },
}));
