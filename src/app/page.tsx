"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { storage } from "@/lib/storage";
import { TradeForm, Trade } from "@/components/trade/trade-form";
import { StatsOverview, TradeStats } from "@/components/dashboard/stats-overview";
import { TradeList } from "@/components/dashboard/trade-list";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { NetPnLChart } from "@/components/dashboard/net-pnl-chart";
import { TradeDetailModal } from "@/components/trade/trade-detail-modal";
import { AddTradeModal } from "@/components/trade/add-trade-modal";
import { ExpenseTracker } from "@/components/expense/expense-tracker"; // REMOVED
import { useTheme } from "@/context/theme-context";

export default function Home() {
  const { user, login, logout, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [trades, setTrades] = useState<Trade[]>([]);
  // const [expenses, setExpenses] = useState<any[]>([]); // REMOVED
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [chartView, setChartView] = useState<"equity" | "pnl">("equity");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Add State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);

  // Lifted Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch trades helper
  const fetchTrades = async () => {
    // In local storage mode, we can fetch even if user is "not logged in" for demo purposes, 
    // but keeping the check for consistency if we wanted to enforce "auth"
    const allTrades = storage.getTrades();

    // Filter by current month/year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const filteredTrades = allTrades.filter(t => {
      const date = new Date(t.timestamp);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    setTrades(filteredTrades as Trade[]);
    // setExpenses(storage.getExpenses()); // REMOVED
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
    setTrades(prev => prev.filter(t => t.id !== id));
    storage.deleteTrade(id);
    await fetchTrades();
  };

  const handleUpdateTrade = async (id: string, updatedData: any) => {
    // Optimistic update
    setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    storage.updateTrade(id, updatedData);
    await fetchTrades();
  };

  // REMOVED handleAddExpense and handleDeleteExpense

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-background text-foreground font-sans pb-32">
      <nav className="hidden">
        {/* Helper to remove existing nav without breaking structure if I missed something, 
            but actually I should just remove it. 
            For now, I will remove the entire <nav> block in the next chunk or just replace it with empty fragment if possible */}
      </nav>

      <div className="w-full max-w-7xl space-y-8 mt-8">
        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Main) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Chart Toggle */}
            <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setChartView("equity")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${chartView === "equity"
                  ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
              >
                Equity Curve
              </button>
              <button
                onClick={() => setChartView("pnl")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${chartView === "pnl"
                  ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
              >
                P&L Breakdown
              </button>
            </div>

            {chartView === "equity" ? (
              <EquityCurve trades={trades} />
            ) : (
              <NetPnLChart trades={trades} />
            )}

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
    </main >
  );
}
