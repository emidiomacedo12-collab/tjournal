"use client";

import { useMemo, useState } from "react";
import { Trade } from "@/components/trade/trade-form";

interface CalendarViewProps {
    trades: Trade[];
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    onAddTrade?: (date: Date) => void;
}

export function CalendarView({ trades, currentDate, onMonthChange, onAddTrade }: CalendarViewProps) {
    // 1. State for current month view
    // const [currentDate, setCurrentDate] = useState(new Date()); // Removed as per instruction

    // 2. Navigation Handlers
    const handlePrevMonth = () => {
        onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        onMonthChange(new Date());
    };

    // 3. Filter trades for the displayed month
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();

        // Create array of days
        const daysArray = Array.from({ length: days }, (_, i) => i + 1);

        // Map P&L to each day
        return daysArray.map((day) => {
            const dateStr = new Date(year, month, day).toDateString();

            const dayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === dateStr);
            const dailyPnL = dayTrades.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
            const tradeCount = dayTrades.length;

            return { day, dailyPnL, tradeCount, date: new Date(year, month, day) };
        });
    }, [currentDate, trades]);

    // Calendar grid padding
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-card-foreground">Daily P&L</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-background rounded text-zinc-500">
                        &lt;
                    </button>
                    <span className="font-mono font-medium text-card-foreground w-32 text-center select-none">
                        {monthName}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-background rounded text-zinc-500">
                        &gt;
                    </button>
                    <button onClick={handleToday} className="ml-2 text-xs text-blue-500 font-medium hover:underline">
                        Today
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {/* Days Header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-zinc-400 py-1 uppercase tracking-wider">
                        {d}
                    </div>
                ))}

                {/* Empty cells for padding */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days */}
                {daysInMonth.map(({ day, dailyPnL, tradeCount, date }) => (
                    <div
                        key={day}
                        className={`aspect-square h-32 w-full rounded-lg border flex flex-col items-center justify-center p-1 transition-colors relative group ${tradeCount > 0
                            ? dailyPnL > 0
                                ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                                : dailyPnL < 0
                                    ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                                    : 'bg-background border-border text-zinc-600 dark:text-zinc-400'
                            : 'bg-transparent border-transparent text-zinc-300 dark:text-zinc-700'
                            }`}
                    >
                        <span className="text-xs font-medium absolute top-2 left-2 opacity-60">{day}</span>

                        {/* Quick Add Button */}
                        {onAddTrade && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddTrade(date);
                                }}
                                className="absolute top-2 right-2 p-1 bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Add Trade"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                            </button>
                        )}

                        {tradeCount > 0 && (
                            <>
                                <span className="text-xl font-bold tracking-tight">
                                    {dailyPnL > 0 ? '+' : ''}{Math.abs(dailyPnL) >= 1000 ? `${(dailyPnL / 1000).toFixed(1)}k` : Math.round(dailyPnL)}
                                </span>
                                <span className="text-xs opacity-70 mt-1">{tradeCount} trades</span>
                                <div className="text-xs mt-1 font-medium bg-background px-1.5 py-0.5 rounded">
                                    {dailyPnL > 0 ? 'WIN' : 'LOSS'}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
