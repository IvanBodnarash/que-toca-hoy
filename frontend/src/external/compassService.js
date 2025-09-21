import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_COMPASS_API_KEY,
  authDomain: import.meta.env.VITE_COMPASS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_COMPASS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_COMPASS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_COMPASS_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_COMPASS_APP_ID,
};

let _db;

export function getCompassDb() {
  if (_db) return _db;

  // Avoiding conflicts with main firebase-instance
  const APP_NAME = "recipe-compass-app";
  const existing = getApps().find((a) => a.name === APP_NAME);
  const app = existing || initializeApp(cfg, APP_NAME);
  _db = getFirestore(app);
  return _db;
}

export async function fetchCompassRecipes({ take = 100 } = {}) {
  const db = getCompassDb();
  const col = collection(db, "recipes");

  // Basic request
  const q = query(col, orderBy("recipeTitle"), limit(take));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
