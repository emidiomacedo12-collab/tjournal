"use client";

import { useMemo, useState, useEffect } from "react";
import { Expense } from "@/lib/storage";

interface ExpenseCalendarProps {
    expenses: Expense[];
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

export function ExpenseCalendar({ expenses, currentDate, onDateSelect }: ExpenseCalendarProps) {
    // Track the month we are VIEWING separate from the selected date
    const [viewDate, setViewDate] = useState(currentDate);

    // Sync viewDate when currentDate changes
    useEffect(() => {
        // Only update if the month/year is different to avoid jumping around unnecessarily
        if (currentDate.getMonth() !== viewDate.getMonth() || currentDate.getFullYear() !== viewDate.getFullYear()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setViewDate(currentDate);
        }
    }, [currentDate, viewDate]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // 1. Generate calendar grid based on VIEW DATE
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [viewDate]);

    // 2. Map expenses to dates
    const expenseMap = useMemo(() => {
        const map = new Map<string, number>();
        expenses.forEach((expense) => {
            const dateStr = new Date(expense.date).toDateString();
            const currentTotal = map.get(dateStr) || 0;
            // Subtract for expenses, add for refunds
            const amount = expense.type === 'REFUND' ? expense.amount : -Math.abs(expense.amount);
            map.set(dateStr, currentTotal + amount);
        });
        return map;
    }, [expenses]);

    // Helper to format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-muted rounded text-zinc-500 hover:text-foreground transition-colors"
                >
                    &lt;
                </button>
                <h2 className="text-lg font-bold text-card-foreground">
                    {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-muted rounded text-zinc-500 hover:text-foreground transition-colors"
                >
                    &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-zinc-500 uppercase">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dateStr = date.toDateString();
                    const total = expenseMap.get(dateStr);
                    const isToday = new Date().toDateString() === dateStr;
                    const isSelected = currentDate.toDateString() === dateStr;

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateSelect(date)}
                            className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all
                                ${isSelected
                                    ? "ring-2 ring-blue-500 border-transparent bg-muted"
                                    : "border-border hover:bg-muted/50"
                                }
                                ${isToday ? "bg-blue-500/10" : ""}
                            `}
                        >
                            <span className={`text-xs mb-1 ${isToday ? "font-bold text-blue-500" : "text-zinc-500"}`}>
                                {date.getDate()}
                            </span>

                            {total !== undefined && (
                                <span className={`text-[10px] font-bold ${total > 0 ? "text-green-500" : "text-red-500"}`}>
                                    {formatCurrency(total)}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
