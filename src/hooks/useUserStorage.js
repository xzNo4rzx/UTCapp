import { useAuth } from "../context/AuthContext";

export const useUserStorage = (key, fallback = null) => {
  const { user } = useAuth();
  const uid = user?.uid;

  // 💥 Si pas de user (encore), évite l'erreur
  if (!uid) return [fallback, () => {}];

  const fullKey = `${key}-${uid}`;

  const get = () => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const set = (value) => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (e) {
      console.error("Erreur storage:", e);
    }
  };

  return [get(), set];
};