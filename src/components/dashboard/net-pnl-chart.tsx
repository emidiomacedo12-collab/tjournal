"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Trade } from "@/lib/storage";

interface NetPnLChartProps {
    trades: Trade[];
}

export function NetPnLChart({ trades }: NetPnLChartProps) {
    const winners = trades.filter(t => (t.pnl || 0) > 0);
    const losers = trades.filter(t => (t.pnl || 0) <= 0);

    const grossProfit = winners.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
    const grossLoss = Math.abs(losers.reduce((acc, curr) => acc + (curr.pnl || 0), 0));
    const netPnL = grossProfit - grossLoss;

    const data = [
        { name: "Gross Profit", value: grossProfit },
        { name: "Gross Loss", value: grossLoss },
    ];

    const COLORS = ["#16a34a", "#dc2626"]; // green-600, red-600

    // If no trades, show a placeholder
    const isEmpty = trades.length === 0;
    const chartData = isEmpty ? [{ name: "No Data", value: 1 }] : data;
    const chartColors = isEmpty ? ["#e4e4e7"] : COLORS; // zinc-200

    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-8 h-[400px] flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">Net P&L Distribution</h2>
            <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`$${value.toFixed(2)}`, "Amount"]}
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-sm text-zinc-500 font-medium">Net P&L</p>
                        <p className={`text-2xl font-bold ${netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
