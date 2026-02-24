"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { storage } from "@/lib/storage";
import { TradeForm, Trade } from "@/components/trade/trade-form";
import { NetPnLStat, AvgStat, WinRateStat, ProfitFactorStat, TradeStats } from "@/components/dashboard/stats-overview";
import { TradeList } from "@/components/dashboard/trade-list";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { NetPnLChart } from "@/components/dashboard/net-pnl-chart";
import { TradeDetailModal } from "@/components/trade/trade-detail-modal";
import { AddTradeModal } from "@/components/trade/add-trade-modal";
import { useTheme } from "@/context/theme-context";

import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function DashboardPage() {
    const { user, login, logout, isLoading } = useAuth();
    const { theme, setTheme } = useTheme();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [chartView, setChartView] = useState<"equity" | "pnl">("equity");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Quick Add State (Keeping for modals)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);

    // Lifted Calendar State (Keeping for logic if needed)
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch trades helper
    const fetchTrades = async () => {
        if (!user) {
            setTrades([]);
            return;
        }
        const allTrades = storage.getTrades(user.id);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const filteredTrades = allTrades.filter(t => {
            const date = new Date(t.timestamp);
            return date.getFullYear() === year && date.getMonth() === month;
        });

        setTrades(filteredTrades as Trade[]);
    };

    useEffect(() => {
        fetchTrades();
    }, [user, currentDate]);

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
        setTrades(prev => prev.filter(t => t.id !== id));
        storage.deleteTrade(id);
        await fetchTrades();
    };

    const handleUpdateTrade = async (id: string, updatedData: any) => {
        setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
        storage.updateTrade(id, updatedData);
        await fetchTrades();
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <main className="flex min-h-screen flex-col items-center bg-background text-foreground font-sans transition-colors duration-300">
            <div className="w-full px-4 md:px-8 py-4 md:py-8">
                <div className="flex justify-between items-center mb-8 px-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-400 bg-clip-text text-transparent">
                            Trade Journal
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            Welcome back, {user?.name || 'Trader'}
                        </p>
                    </div>
                    <div className="text-sm font-medium bg-zinc-900/50 dark:bg-zinc-800/50 text-foreground px-4 py-2 rounded-full border border-border backdrop-blur-sm">
                        {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <DashboardGrid
                    pnlStat={<NetPnLStat totalPnL={stats.totalPnL} />}
                    avgStat={<AvgStat avgWinner={stats.avgWinner} avgLoser={stats.avgLoser} />}
                    winRateStat={<WinRateStat winRate={stats.winRate} totalTrades={stats.totalTrades} />}
                    factorStat={<ProfitFactorStat profitFactor={stats.profitFactor} />}
                    chart={
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setChartView("equity")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartView === "equity"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Equity Curve
                                </button>
                                <button
                                    onClick={() => setChartView("pnl")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartView === "pnl"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
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
                        </div>
                    }
                    calendar={
                        <CalendarView
                            trades={trades}
                            currentDate={currentDate}
                            onMonthChange={setCurrentDate}
                            onAddTrade={(date) => {
                                setQuickAddDate(date);
                                setIsAddModalOpen(true);
                            }}
                        />
                    }
                    trades={
                        <TradeList
                            trades={trades}
                            onDelete={handleDeleteTrade}
                            onSelect={(trade) => {
                                setSelectedTrade(trade);
                                setIsModalOpen(true);
                            }}
                        />
                    }
                    gatekeeper={<TradeForm onAddTrade={handleAddTrade} userId={user?.id || ''} />}
                />
            </div>

            <TradeDetailModal
                isOpen={isModalOpen}
                trade={selectedTrade}
                onClose={() => setIsModalOpen(false)}
                onSave={handleUpdateTrade}
            />

            <AddTradeModal
                isOpen={isAddModalOpen}
                date={quickAddDate}
                onClose={() => setIsAddModalOpen(false)}
                onAddTrade={handleAddTrade}
            />
        </main>
    );
}
