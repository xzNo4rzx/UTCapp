import { useAuth } from "../context/AuthContext";

export const useUserStorage = (key, fallback = null) => {
  const { user } = useAuth(); // ✅ déplacé ici
  const fullKey = `${key}-${user?.uid || "anonymous"}`;

  const get = () => {
    const raw = localStorage.getItem(fullKey);
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const set = (value) => {
    localStorage.setItem(fullKey, JSON.stringify(value));
  };

  return [get(), set];
};