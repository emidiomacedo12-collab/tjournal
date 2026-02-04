export interface Trade {
  id: string;
  userId: string;
  accountId?: string;
  symbol: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  pnl?: number;
  notes?: string;
  timestamp: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

const STORAGE_KEY = "trade-journal-data";

interface StorageData {
  user: User;
  trades: Trade[];
}

const INITIAL_DATA: StorageData = {
  user: {
    id: "user-1",
    email: "demo@example.com",
    name: "Demo User",
  },
  trades: [],
};

// Helper to get data from storage with type safety
function getData(): StorageData {
  if (typeof window === "undefined") return INITIAL_DATA;

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse local storage data", e);
    return INITIAL_DATA;
  }
}

// Helper to save data to storage
function saveData(data: StorageData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const storage = {
  getUser: () => {
    return getData().user;
  },

  getTrades: () => {
    return getData().trades;
  },

  addTrade: (trade: Omit<Trade, "id" | "createdAt" | "updatedAt">) => {
    const data = getData();
    const newTrade: Trade = {
      ...trade,
      // Simple unique ID generator fallback for environments without crypto.randomUUID
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.trades.unshift(newTrade); // Add to beginning
    saveData(data);
    return newTrade;
  },

  addTrades: (trades: Omit<Trade, "id" | "createdAt" | "updatedAt">[]) => {
    const data = getData();
    const now = new Date().toISOString();

    const newTrades: Trade[] = trades.map(t => ({
      ...t,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      createdAt: now,
      updatedAt: now,
    }));

    data.trades.unshift(...newTrades);
    saveData(data);
    return newTrades;
  },

  updateTrade: (id: string, updates: Partial<Omit<Trade, "id" | "createdAt" | "updatedAt">>) => {
    const data = getData();
    const index = data.trades.findIndex(t => t.id === id);

    if (index === -1) return null;

    const updatedTrade = {
      ...data.trades[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data.trades[index] = updatedTrade;
    saveData(data);
    return updatedTrade;
  },

  deleteTrade: (id: string) => {
    const data = getData();
    const initialLength = data.trades.length;
    data.trades = data.trades.filter(t => t.id !== id);

    if (data.trades.length !== initialLength) {
      saveData(data);
      return true;
    }
    return false;
  }
};
