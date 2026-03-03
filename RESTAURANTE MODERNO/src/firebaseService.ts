import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { MenuItem, Reservation, BusinessInfo, Order } from './types';

// Helper to get a typed collection/doc with current DB
const db = () => getDb();

// ============ BUSINESS INFO ============
export const saveBusinessInfo = async (info: BusinessInfo) => {
  await setDoc(doc(db(), 'settings', 'businessInfo'), info);
};

export const listenBusinessInfo = (callback: (info: BusinessInfo) => void) => {
  return onSnapshot(doc(db(), 'settings', 'businessInfo'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as BusinessInfo);
    }
  });
};

// ============ MENU ============
export const saveMenuItem = async (item: MenuItem) => {
  const { id, ...data } = item as any;
  if (id && id.length > 0) {
    await setDoc(doc(db(), 'menu', id), data);
    return id;
  } else {
    const ref = await addDoc(collection(db(), 'menu'), data);
    return ref.id;
  }
};

export const deleteMenuItem = async (id: string) => {
  await deleteDoc(doc(db(), 'menu', id));
};

export const listenMenu = (callback: (items: MenuItem[]) => void) => {
  return onSnapshot(
    query(collection(db(), 'menu'), orderBy('category')),
    (snap) => {
      const items: MenuItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as object),
      })) as MenuItem[];
      callback(items);
    }
  );
};

// ============ RESERVATIONS ============
export const saveReservation = async (res: Omit<Reservation, 'id'>) => {
  const ref = await addDoc(collection(db(), 'reservations'), res);
  return ref.id;
};

export const updateReservation = async (id: string, data: Partial<Reservation>) => {
  const { id: _id, ...rest } = data as any;
  await updateDoc(doc(db(), 'reservations', id), rest);
};

export const deleteReservation = async (id: string) => {
  await deleteDoc(doc(db(), 'reservations', id));
};

export const deleteAllReservations = async () => {
  const snap = await getDocs(collection(db(), 'reservations'));
  const promises = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(promises);
};

export const listenReservations = (callback: (items: Reservation[]) => void) => {
  return onSnapshot(
    query(collection(db(), 'reservations'), orderBy('date', 'desc')),
    (snap) => {
      const items: Reservation[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as object),
      })) as Reservation[];
      callback(items);
    }
  );
};

// ============ ORDERS ============
export const saveOrder = async (order: Omit<Order, 'id'>) => {
  const ref = await addDoc(collection(db(), 'orders'), order);
  return ref.id;
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
  const { id: _id, ...rest } = data as any;
  await updateDoc(doc(db(), 'orders', id), rest);
};

export const deleteOrder = async (id: string) => {
  await deleteDoc(doc(db(), 'orders', id));
};

export const deleteAllOrders = async () => {
  const snap = await getDocs(collection(db(), 'orders'));
  const promises = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(promises);
};

export const listenOrders = (callback: (items: Order[]) => void) => {
  return onSnapshot(collection(db(), 'orders'), (snap) => {
    const items: Order[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as object),
    })) as Order[];
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    callback(items);
  });
};

// ============ ADMIN PASSWORD ============
export const saveAdminPassword = async (password: string) => {
  await setDoc(doc(db(), 'settings', 'admin'), { password });
};

export const listenAdminPassword = (callback: (password: string) => void) => {
  return onSnapshot(doc(db(), 'settings', 'admin'), (snap) => {
    if (snap.exists()) {
      callback((snap.data() as any).password);
    } else {
      callback('admin123');
    }
  });
};
