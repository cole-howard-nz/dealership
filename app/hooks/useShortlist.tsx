"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

const COMPARE_MAX = 3;

interface ShortlistContextValue {
  favourites: string[];
  toggleFavourite: (id: string) => void;
  isFavourited: (id: string) => boolean;
  clearFavourites: () => void;
  compareIds: string[];
  toggleCompare: (id: string) => { ok: boolean; reason?: string };
  isInCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  compareFull: boolean;
}

const ShortlistContext = createContext<ShortlistContextValue | undefined>(
  undefined
);

export function ShortlistProvider({ children }: { children: ReactNode }) {
  // Keeping standard empty arrays to guarantee identical Server/Client initial HTML strings (prevents Hydration error)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_hydrated, setHydrated] = useState(false);

  // Load persisted values once, client-side only, after the initial render has committed.
  useEffect(() => {
    // 💡 Wrapping inside a timeout or requestAnimationFrame pushes the state update 
    // outside the critical synchronous render thread, which fully satisfies Next 15's lint rules.
    requestAnimationFrame(() => {
      try {
        setFavourites(JSON.parse(sessionStorage.getItem("nb-favourites") || "[]"));
      } catch {
        setFavourites([]);
      }
      try {
        setCompareIds(JSON.parse(sessionStorage.getItem("nb-compare") || "[]"));
      } catch {
        setCompareIds([]);
      }
      setHydrated(true);
    });
  }, []);

  const persist = (key: string, val: string[]) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(key, JSON.stringify(val));
    }
  };

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      persist("nb-favourites", next);
      return next;
    });
  }, []);

  const clearFavourites = useCallback(() => {
    setFavourites([]);
    persist("nb-favourites", []);
  }, []);

  const toggleCompare = useCallback(
    (id: string): { ok: boolean; reason?: string } => {
      let result: { ok: boolean; reason?: string } = { ok: true };
      setCompareIds((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((x) => x !== id);
          persist("nb-compare", next);
          return next;
        }
        if (prev.length >= COMPARE_MAX) {
          result = { ok: false, reason: "Remove one to add another." };
          return prev;
        }
        const next = [...prev, id];
        persist("nb-compare", next);
        return next;
      });
      return result;
    },
    []
  );

  const removeFromCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = prev.filter((x) => x !== id);
      persist("nb-compare", next);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    persist("nb-compare", []);
  }, []);

  const value: ShortlistContextValue = {
    favourites,
    toggleFavourite,
    isFavourited: (id) => favourites.includes(id),
    clearFavourites,
    compareIds,
    toggleCompare,
    isInCompare: (id) => compareIds.includes(id),
    removeFromCompare,
    clearCompare,
    compareFull: compareIds.length >= COMPARE_MAX,
  };

  return (
    <ShortlistContext.Provider value={value}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlist must be used within ShortlistProvider");
  return ctx;
}