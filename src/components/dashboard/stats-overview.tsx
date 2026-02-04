export interface TradeStats {
    totalTrades: number;
    totalPnL: number;
    winRate: number;
    profitFactor: number;
    avgWinner: number;
    avgLoser: number;
}

interface StatsOverviewProps {
    stats: TradeStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total P&L */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Net P&L</h3>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                </p>
            </div>

            {/* Avg Stats */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Avg Win / Loss</h3>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span className="text-lg font-bold text-green-600">${stats.avgWinner.toFixed(2)}</span>
                    <span className="text-sm text-zinc-400">/</span>
                    <span className="text-lg font-bold text-red-600">${Math.abs(stats.avgLoser).toFixed(2)}</span>
                </div>
            </div>

            {/* Win Rate */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Win Rate</h3>
                <p className="text-2xl font-bold text-card-foreground">
                    {stats.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-zinc-500 mt-1">{stats.totalTrades} Total Trades</p>
            </div>

            {/* Profit Factor */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Profit Factor</h3>
                <p className="text-2xl font-bold text-card-foreground">
                    {stats.profitFactor.toFixed(2)}
                </p>
            </div>
        </div>
    );
}
