"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Trade } from "@/lib/storage";

interface EquityCurveProps {
    trades: Trade[];
}

export function EquityCurve({ trades }: EquityCurveProps) {
    // 1. Sort trades by time ascending for the chart
    const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 2. Calculate cumulative P&L
    let cumulativePnL = 0;
    const data = sortedTrades.map((trade, index) => {
        cumulativePnL += (trade.pnl || 0);
        return {
            tradeNumber: index + 1,
            pnl: cumulativePnL,
            date: new Date(trade.timestamp).toLocaleDateString(),
            symbol: trade.symbol,
            amount: trade.pnl,
        };
    });

    // Start at 0
    const chartData = [{ tradeNumber: 0, pnl: 0, date: 'Start', symbol: '', amount: 0 }, ...data];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm mb-8 h-[400px]">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Equity Curve</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey="tradeNumber"
                        label={{ value: "Trades", position: "insideBottomRight", offset: -5 }}
                        tick={{ fontSize: 12 }}
                        stroke="#9CA3AF"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9CA3AF"
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                        itemStyle={{ color: '#f4f4f5' }}
                        formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, "Equity"]}
                        labelFormatter={(label) => `Trade #${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="pnl"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
