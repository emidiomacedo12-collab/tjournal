"use client";

import React, { useMemo } from "react";
import { Trade } from "@/lib/storage";

interface CalendarViewProps {
    currentDate: Date;
    trades: Trade[];
    onAddTrade?: (date: Date) => void;
    onMonthChange?: (date: Date) => void;
}

export function CalendarView({ currentDate, trades, onAddTrade, onMonthChange }: CalendarViewProps) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const daysInMonth = useMemo(() => {
        const lastDay = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 1; i <= lastDay; i++) {
            const date = new Date(year, month, i);
            const dayTrades = trades.filter(t => {
                const tDate = new Date(t.timestamp);
                return tDate.getDate() === i && tDate.getMonth() === month && tDate.getFullYear() === year;
            });

            const pnl = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
            const winRate = dayTrades.length > 0 ? (dayTrades.filter(t => (t.pnl || 0) > 0).length / dayTrades.length) * 100 : 0;
            const rMult = dayTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0);

            days.push({
                day: i,
                date,
                pnl,
                tradeCount: dayTrades.length,
                winRate,
                rMult
            });
        }
        return days;
    }, [trades, month, year]);

    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const summary = useMemo(() => {
        const pnl = daysInMonth.reduce((acc, d) => acc + d.pnl, 0);
        const activeDays = daysInMonth.filter(d => d.tradeCount > 0).length;
        return { pnl, activeDays };
    }, [daysInMonth]);

    // Prepare grid items for 8 columns (7 days + 1 summary)
    const gridItems = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: { type: 'day' | 'week'; data: any }[] = [];
        const padding = Array(firstDayOfMonth).fill(null);
        const allDays = [...padding, ...daysInMonth];

        let weekPnl = 0;
        let weekDays = 0;
        let weekIdx = 1;

        for (let i = 0; i < allDays.length; i++) {
            const dayData = allDays[i];
            if (dayData) {
                weekPnl += dayData.pnl;
                if (dayData.tradeCount > 0) weekDays++;
            }

            items.push({ type: 'day', data: dayData });

            // After 7 days, add a summary column
            if ((i + 1) % 7 === 0) {
                items.push({
                    type: 'week',
                    data: {
                        pnl: weekPnl,
                        days: weekDays,
                        index: weekIdx++
                    }
                });
                weekPnl = 0;
                weekDays = 0;
            }
        }

        // Handle the last partial week if necessary
        if (allDays.length % 7 !== 0) {
            const remaining = 7 - (allDays.length % 7);
            for (let i = 0; i < remaining; i++) {
                items.push({ type: 'day', data: null });
            }
            items.push({
                type: 'week',
                data: {
                    pnl: weekPnl,
                    days: weekDays,
                    index: weekIdx
                }
            });
        }

        return items;
    }, [daysInMonth, firstDayOfMonth]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Week"];

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-8 border-b border-border bg-zinc-50 dark:bg-zinc-900/50">
                {dayNames.map(day => (
                    <div key={day} className="py-2 text-[10px] font-black text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-8 divide-x divide-y divide-border border-l -ml-[1px] border-t -mt-[1px]">
                {gridItems.map((item, idx) => {
                    const data = item.data;
                    if (item.type === 'day') {
                        if (!data) return <div key={`empty-${idx}`} className="bg-zinc-50/30 dark:bg-zinc-900/10 min-h-[100px]" />;

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

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-border flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Profit Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Loss Day</span>
                    </div>
                </div>
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    Monthly P&L: ${summary.pnl.toLocaleString()} | {summary.activeDays} Days Active
                </div>
            </div>
        </div>
    );
}
