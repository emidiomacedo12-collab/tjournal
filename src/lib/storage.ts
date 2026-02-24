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
  // New fields for disciplined trading
  mentalState?: string;
  setupLevel?: string;
  setupType?: string;
  outcome?: string;
  screenshotUrl?: string;
  exitPrice?: number;
  stopLoss?: number;
  target?: number;
  rMultiple?: number;
}

export interface Expense {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  category: string;
  type?: 'EXPENSE' | 'REFUND';
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional for now, but will be used
}

const STORAGE_KEY = "trade-journal-data-v2"; // Versioned key

interface StorageData {
  users: User[];
  trades: Trade[];
  expenses: Expense[];
}

const INITIAL_DATA: StorageData = {
  users: [
    {
      id: "user-1",
      email: "demo@example.com",
      name: "Emidio",
      password: "password123", // Default for demo
    }
  ],
  trades: [],
  expenses: [],
};

// Helper to get data from storage with type safety
function getData(): StorageData {
  if (typeof window === "undefined") return INITIAL_DATA;

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Try to migrate from v1 if exists
    const oldData = localStorage.getItem("trade-journal-data");
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        const migrated: StorageData = {
          users: [INITIAL_DATA.users[0]],
          trades: parsed.trades || [],
          expenses: parsed.expenses || []
        };
        // Assign all old data to user-1
        migrated.trades = migrated.trades.map(t => ({ ...t, userId: "user-1" }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch (e) {
        console.error("Migration failed", e);
      }
    }
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
  getUsers: () => {
    return getData().users;
  },

  addUser: (user: Omit<User, "id">) => {
    const data = getData();
    const newUser: User = {
      ...user,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
    };
    data.users.push(newUser);
    saveData(data);
    return newUser;
  },

  findUserByEmail: (email: string) => {
    return getData().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getTrades: (userId?: string) => {
    if (!userId) return [];
    return getData().trades.filter(t => t.userId === userId);
  },

  addTrade: (trade: Omit<Trade, "id" | "createdAt" | "updatedAt">) => {
    const data = getData();
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.trades.unshift(newTrade);
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
  },

  getExpenses: (userId?: string) => {
    if (!userId) return [];
    // Expense interface doesn't have userId yet, I should add it or handle it
    return getData().expenses.filter(e => e.userId === userId);
  },

  addExpense: (expense: Omit<Expense, "id" | "createdAt"> & { userId: string }) => {
    const data = getData();
    const newExpense: Expense & { userId: string } = {
      id: Date.now().toString(),
      description: expense.description,
      category: expense.category,
      amount: Number(expense.amount),
      date: expense.date,
      type: expense.type || 'EXPENSE',
      createdAt: new Date().toISOString(),
      userId: expense.userId
    };

    if (!data.expenses) {
      data.expenses = [];
    }
    data.expenses.unshift(newExpense);
    saveData(data);
    return newExpense;
  },

  deleteExpense: (id: string) => {
    const data = getData();
    const initialLength = data.expenses.length;
    data.expenses = data.expenses.filter(e => e.id !== id);

    if (data.expenses.length !== initialLength) {
      saveData(data);
      return true;
    }
    return false;
  }
};
