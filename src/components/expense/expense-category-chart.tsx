"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Expense } from "@/lib/storage";
import { useMemo } from "react";

interface ExpenseCategoryChartProps {
    expenses: Expense[];
}

const COLORS = [
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#14B8A6", // Teal
];

export function ExpenseCategoryChart({ expenses }: ExpenseCategoryChartProps) {
    const data = useMemo(() => {
        const categoryMap = new Map<string, number>();

        expenses.forEach(expense => {
            const current = categoryMap.get(expense.category) || 0;
            const amountVal = Number(expense.amount) || 0;

            // Refunds reduce the category total
            const netAmount = expense.type === "REFUND" ? -amountVal : amountVal;
            categoryMap.set(expense.category, current + netAmount);
        });

        // Convert to array and filter out <= 0 for the Pie Chart
        return Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                No expense data to display
            </div>
        );
    }

    // Calculate Total for Center Label
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="bg-card p-6 rounded-xl border border-border h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Net Amount"]}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                    <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</div>
                    <div className="text-xl font-bold dark:text-white">${total.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}
