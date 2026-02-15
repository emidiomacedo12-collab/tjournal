"use client";

import { useMemo } from "react";
import { Expense } from "@/lib/storage";

interface MonthlyExpenseSummaryProps {
    expenses: Expense[];
}

export function MonthlyExpenseSummary({ expenses }: MonthlyExpenseSummaryProps) {
    const monthlyData = useMemo(() => {
        const groups = new Map<string, number>();

        expenses.forEach((expense) => {
            const date = new Date(expense.date);
            // Create a key like "February 2026"
            const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

            const currentTotal = groups.get(key) || 0;
            // Subtract for expenses, add for refunds
            const amount = expense.type === 'REFUND' ? -expense.amount : expense.amount; // Refund reduces expense total
            groups.set(key, currentTotal + amount);
        });

        // Convert to array and sort by date (newest first)
        return Array.from(groups.entries())
            .map(([month, total]) => ({ month, total }))
            .sort((a, b) => {
                const dateA = new Date(a.month);
                const dateB = new Date(b.month);
                return dateB.getTime() - dateA.getTime();
            });
    }, [expenses]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    if (monthlyData.length === 0) return null;

    return (
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-lg font-bold mb-4 text-card-foreground">Monthly Summary</h2>
            <div className="space-y-3">
                {monthlyData.map(({ month, total }) => (
                    <div key={month} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/50">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{month}</span>
                        <span className={`font-bold ${total > 0 ? "text-red-500" : "text-green-500"}`}>
                            {total > 0 ? "-" : "+"}{formatCurrency(Math.abs(total))}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
