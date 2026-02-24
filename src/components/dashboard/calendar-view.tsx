"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trade } from "@/lib/storage";

interface CalendarViewProps {
    trades: Trade[];
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    onAddTrade?: (date: Date) => void;
}

export function CalendarView({ trades, currentDate, onMonthChange, onAddTrade }: CalendarViewProps) {
    const [showViewMenu, setShowViewMenu] = useState(false);

    const handlePrevMonth = () => {
        onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        onMonthChange(new Date());
    };

    // Calculate rich metrics for each day
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: days }, (_, i) => i + 1).map((day) => {
            const date = new Date(year, month, day);
            const dateStr = date.toDateString();
            const dayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === dateStr);

            const pnl = dayTrades.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
            const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
            const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;

            const totalRisk = dayTrades.reduce((acc, t) => {
                const risk = (t.price && t.stopLoss && t.quantity)
                    ? Math.abs(t.price - t.stopLoss) * t.quantity
                    : 0;
                return acc + risk;
            }, 0);
            const rMult = totalRisk > 0 ? pnl / totalRisk : 0;

            return { day, pnl, tradeCount: dayTrades.length, winRate, rMult, date };
        });
    }, [currentDate, trades]);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthStats = useMemo(() => {
        const pnl = daysInMonth.reduce((acc, d) => acc + d.pnl, 0);
        const activeDays = daysInMonth.filter(d => d.tradeCount > 0).length;
        return { pnl, activeDays };
    }, [daysInMonth]);

    // Prepare grid items for 8 columns (7 days + 1 summary)
    const gridItems = useMemo(() => {
        const items: { type: 'day' | 'week'; data: any }[] = [];
        const padding = Array(firstDayOfMonth).fill(null);
        const allDays = [...padding, ...daysInMonth];

        let weekPnl = 0;
        let weekDays = 0;
        let weekIdx = 1;

        for (let i = 0; i < allDays.length; i++) {
            const item = allDays[i];
            items.push({ type: 'day', data: item });

            if (item) {
                weekPnl += item.pnl;
                if (item.tradeCount > 0) weekDays += 1;
            }

            // At the end of Saturday (column 7), insert a weekly summary (column 8)
            if ((i + 1) % 7 === 0) {
                items.push({
                    type: 'week',
                    data: { index: weekIdx++, pnl: weekPnl, days: weekDays }
                });
                weekPnl = 0;
                weekDays = 0;
            } else if (i === allDays.length - 1) {
                // Handle end of month that doesn't end on Saturday
                const remainder = 7 - ((i + 1) % 7);
                for (let r = 0; r < remainder; r++) {
                    items.push({ type: 'day', data: null });
                }
                items.push({
                    type: 'week',
                    data: { index: weekIdx++, pnl: weekPnl, days: weekDays }
                });
            }
        }
        return items;
    }, [daysInMonth, firstDayOfMonth]);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            {/* BullishBears Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <button onClick={handlePrevMonth} className="p-1 px-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded font-bold text-zinc-500 transition-colors">&lt;</button>
                        <button onClick={handleToday} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded font-black text-[10px] uppercase tracking-tighter hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Today</button>
                        <button onClick={handleNextMonth} className="p-1 px-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded font-bold text-zinc-500 transition-colors">&gt;</button>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{monthName}</span>
                </div>

                <div className="flex items-center gap-6 text-[11px]">
                    <div className="relative">
                        <button
                            onClick={() => setShowViewMenu(!showViewMenu)}
                            className="bg-indigo-600/90 text-white px-5 py-1.5 rounded-full font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Choose your dashboard view
                            <svg className={`w-3 h-3 transition-transform duration-300 ${showViewMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {showViewMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowViewMenu(false)} />
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                                    <Link href="/" className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold text-zinc-700 dark:text-zinc-200 transition-colors">📊 Dashboard</Link>
                                    <Link href="/expenses" className="block px-4 py-3 border-t border-zinc-50 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold text-zinc-700 dark:text-zinc-200 transition-colors">💰 Expenses</Link>
                                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-400">Display Modes</div>
                                    <button className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold text-indigo-500 bg-indigo-500/5 transition-colors">📅 Calendar View</button>
                                    <button className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold text-zinc-400 opacity-50 cursor-not-allowed transition-colors">📜 List View</button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4 border-l border-zinc-200 dark:border-zinc-800 pl-6">
                        <div className="flex flex-col">
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Monthly state</span>
                            <span className={`font-black text-sm leading-none mt-0.5 ${monthStats.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                ${monthStats.pnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Days Traded</span>
                            <span className="font-black text-sm leading-none mt-0.5 text-zinc-900 dark:text-zinc-100">{monthStats.activeDays} days</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-8 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-inner auto-rows-fr">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Wkly P&L'].map(d => (
                        <div key={d} className={`bg-zinc-50 dark:bg-zinc-900/50 py-3 text-center text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 ${d === 'Wkly P&L' ? 'text-indigo-400 bg-indigo-50/20 dark:bg-indigo-500/10' : 'text-zinc-400'}`}>
                            {d}
                        </div>
                    ))}

                    {gridItems.map((item, idx) => {
                        if (item.type === 'day') {
                            const data = item.data;
                            if (!data) return <div key={`pad-${idx}`} className="bg-zinc-50/20 dark:bg-zinc-900/20 min-h-[100px]" />;

                            return (
                                <div
                                    key={`day-${data.day}`}
                                    className={`bg-white dark:bg-zinc-900 min-h-[100px] p-2 flex flex-col items-center justify-center relative group transition-all
                                        ${data.tradeCount > 0
                                            ? data.pnl >= 0
                                                ? 'bg-emerald-50/40 dark:bg-emerald-500/5 hover:bg-emerald-100/40 dark:hover:bg-emerald-500/10'
                                                : 'bg-rose-50/40 dark:bg-rose-500/5 hover:bg-rose-100/40 dark:hover:bg-rose-500/10'
                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                                    `}
                                >
                                    <span className="absolute top-2 left-2 text-[10px] font-black text-zinc-300 dark:text-zinc-600">{data.day}</span>

                                    {onAddTrade && (
                                        <button
                                            onClick={() => onAddTrade(data.date)}
                                            className="absolute top-1 right-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-500 transition-all z-10 scale-90"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                    )}

                                    {data.tradeCount > 0 && (
                                        <div className="flex flex-col items-center">
                                            <div className={`text-base md:text-xl font-black tracking-tighter leading-tight ${data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                ${Math.abs(data.pnl) >= 1000 ? `${(data.pnl / 1000).toFixed(1)}K` : Math.round(data.pnl)}
                                            </div>
                                            <div className="text-[8px] md:text-[9px] font-bold text-zinc-400 flex flex-col items-center gap-0 mt-0.5 opacity-80 uppercase tracking-tighter leading-none">
                                                <span>{data.tradeCount} trade{data.tradeCount > 1 ? 's' : ''}</span>
                                                <span className="font-mono mt-0.5">{data.rMult.toFixed(2)}R | {data.winRate.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            // Weekly Summary Card (8th Column)
                            const data = item.data;
                            return (
                                <div key={`week-${data.index}`}
                                    className="bg-indigo-50/10 dark:bg-indigo-500/5 min-h-[100px] p-2 flex flex-col items-center justify-center border-l border-zinc-100 dark:border-zinc-800 group shadow-inner"
                                >
                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Week {data.index}</span>
                                    <div className={`text-base font-black tracking-tighter leading-tight ${data.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        ${Math.abs(data.pnl) >= 1000 ? `${(data.pnl / 1000).toFixed(2)}K` : data.pnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 opacity-70 leading-none">{data.days} days active</span>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
