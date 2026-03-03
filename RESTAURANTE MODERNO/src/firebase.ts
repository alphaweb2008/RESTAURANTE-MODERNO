import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export type FirebaseConfigShape = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
};

const DEFAULT_CONFIG: FirebaseConfigShape = {
  apiKey: "AIzaSyDVqst1-5UIoI7stjspbnJEXov02AaBUb8",
  authDomain: "restaurante-moderno.firebaseapp.com",
  projectId: "restaurante-moderno",
  storageBucket: "restaurante-moderno.firebasestorage.app",
  messagingSenderId: "338517909571",
  appId: "1:338517909571:web:1219bb624447fe28fc34f6",
};

const LS_KEY = 'firebaseConfig';

export function getDefaultConfig(): FirebaseConfigShape {
  return { ...DEFAULT_CONFIG };
}

export function getActiveConfig(): FirebaseConfigShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultConfig();
    const cfg = JSON.parse(raw);
    // validación mínima
    if (!cfg || !cfg.apiKey || !cfg.projectId || !cfg.appId || !cfg.authDomain) {
      return getDefaultConfig();
    }
    return cfg as FirebaseConfigShape;
  } catch {
    return getDefaultConfig();
  }
}

let cachedApp: FirebaseApp | null = null;
let cachedProjectId: string | null = null;

function ensureApp(): FirebaseApp {
  const cfg = getActiveConfig();
  if (cachedApp && cachedProjectId === cfg.projectId) return cachedApp;

  // si hay un app con el mismo name, úsalo; si no, créalo
  const appName = cfg.projectId;
  const existing = getApps().find((a) => a.name === appName);
  if (existing) {
    cachedApp = existing;
    cachedProjectId = cfg.projectId;
    return existing;
  }

  // si hay un app por defecto pero de otro proyecto, no lo borramos; creamos con nombre
  const app = initializeApp(cfg, appName);
  cachedApp = app;
  cachedProjectId = cfg.projectId;
  return app;
}

export function getDb() {
  return getFirestore(ensureApp());
}

export function setFirebaseConfig(cfg: FirebaseConfigShape) {
  // guardar en localStorage y actualizar instancia cacheada
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
  // intentar recrear la app en caliente
  const appName = cfg.projectId;
  const existing = getApps().find((a) => a.name === appName);
  if (!existing) {
    initializeApp(cfg, appName);
  }
  cachedApp = null;
  cachedProjectId = null;
}
