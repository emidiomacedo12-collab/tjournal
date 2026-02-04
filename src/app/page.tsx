"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { TradeForm, Trade } from "@/components/trade/trade-form";
import { StatsOverview, TradeStats } from "@/components/dashboard/stats-overview";
import { TradeList } from "@/components/dashboard/trade-list";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { TradeDetailModal } from "@/components/trade/trade-detail-modal";
import { getTrades, deleteTrade, updateTrade } from "@/lib/actions/trade";

import { AddTradeModal } from "@/components/trade/add-trade-modal";
import { useTheme } from "@/context/theme-context";

export default function Home() {
  const { user, login, logout, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Add State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);

  // Lifted Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch trades helper
  const fetchTrades = async () => {
    if (user) {
      // Filter by current month/year
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      getTrades(user.id, year, month).then((data) => {
        const formattedTrades = data.map((t: any) => ({
          ...t,
          side: t.side as "BUY" | "SELL",
          timestamp: typeof t.timestamp === 'string' ? t.timestamp : t.timestamp.toISOString(),
          pnl: t.pnl ? Number(t.pnl) : undefined,
          price: Number(t.price),
          quantity: Number(t.quantity),
        }));
        setTrades(formattedTrades);
      });
    } else {
      setTrades([]);
    }
  };

  // Fetch trades when user logs in
  useEffect(() => {
    fetchTrades();
  }, [user, currentDate]); // Re-fetch when user or date changes

  // Calculate Stats
  const winners = trades.filter(t => (t.pnl || 0) > 0);
  const losers = trades.filter(t => (t.pnl || 0) <= 0);

  const grossProfit = winners.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  const grossLoss = losers.reduce((acc, curr) => acc + (curr.pnl || 0), 0);

  const stats: TradeStats = {
    totalTrades: trades.length,
    totalPnL: trades.reduce((acc, curr) => acc + (curr.pnl || 0), 0),
    winRate: trades.length > 0 ? (winners.length / trades.length) * 100 : 0,
    profitFactor: Math.abs(grossLoss) > 0 ? grossProfit / Math.abs(grossLoss) : grossProfit > 0 ? 100 : 0,
    avgWinner: winners.length > 0 ? grossProfit / winners.length : 0,
    avgLoser: losers.length > 0 ? grossLoss / losers.length : 0,
  };

  const handleAddTrade = async (newTrade: Trade) => {
    await fetchTrades();
  };

  const handleDeleteTrade = async (id: string) => {
    // Optimistic delete
    setTrades(prev => prev.filter(t => (t as any).id !== id));
    await deleteTrade(id);
    await fetchTrades();
  };

  const handleUpdateTrade = async (id: string, updatedData: any) => {
    // Optimistic update
    setTrades(prev => prev.map(t => (t as any).id === id ? { ...t, ...updatedData } : t));
    await updateTrade(id, updatedData);
    await fetchTrades();
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground font-sans pb-32">
      <nav className="w-full max-w-7xl flex items-center justify-between mb-8 p-6 rounded-2xl bg-card/50 backdrop-blur-md border border-border sticky top-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TJ</div>
          <span className="font-bold text-lg tracking-tight">TradeJournal</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            {(['light', 'dark', 'navy'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === t
                  ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Connect
            </button>
          )}
        </div>
      </nav>

      <div className="w-full max-w-7xl space-y-8">
        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Main) */}
          <div className="lg:col-span-2 space-y-8">
            <EquityCurve trades={trades} />

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-6 text-card-foreground">Recent Trades</h2>
              <TradeList
                trades={trades}
                onDelete={handleDeleteTrade}
                onSelect={(trade) => {
                  setSelectedTrade(trade);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>

          {/* Right Column (Sidebar: Form) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-32">
              <TradeForm onAddTrade={handleAddTrade} />
            </div>
          </div>
        </div>

        {/* Bottom Full Width (Calendar) */}
        <div className="w-full">
          <CalendarView
            trades={trades}
            currentDate={currentDate}
            onMonthChange={setCurrentDate}
            onAddTrade={(date) => {
              setQuickAddDate(date);
              setIsAddModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <TradeDetailModal
        isOpen={isModalOpen}
        trade={selectedTrade}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateTrade}
      />

      {/* Quick Add Modal */}
      <AddTradeModal
        isOpen={isAddModalOpen}
        date={quickAddDate}
        onClose={() => setIsAddModalOpen(false)}
        onAddTrade={handleAddTrade}
      />
    </main>
  );
}
