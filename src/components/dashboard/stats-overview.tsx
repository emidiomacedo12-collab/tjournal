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

export function NetPnLStat({ totalPnL }: { totalPnL: number }) {
    return (
        <div className="flex flex-col">
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </p>
        </div>
    );
}

export function AvgStat({ avgWinner, avgLoser }: { avgWinner: number; avgLoser: number }) {
    return (
        <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xl font-bold text-green-500">${avgWinner.toFixed(2)}</span>
            <span className="text-sm text-zinc-500">/</span>
            <span className="text-xl font-bold text-red-500">${Math.abs(avgLoser).toFixed(2)}</span>
        </div>
    );
}

export function WinRateStat({ winRate, totalTrades }: { winRate: number; totalTrades: number }) {
    return (
        <div className="flex flex-col">
            <p className="text-2xl font-bold text-foreground">
                {winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">{totalTrades} Total Trades</p>
        </div>
    );
}

export function ProfitFactorStat({ profitFactor }: { profitFactor: number }) {
    return (
        <p className="text-2xl font-bold text-foreground">
            {profitFactor.toFixed(2)}
        </p>
    );
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Net P&L</h3>
                <NetPnLStat totalPnL={stats.totalPnL} />
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Avg Win / Loss</h3>
                <AvgStat avgWinner={stats.avgWinner} avgLoser={stats.avgLoser} />
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Win Rate</h3>
                <WinRateStat winRate={stats.winRate} totalTrades={stats.totalTrades} />
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-sm font-medium text-zinc-500 mb-1">Profit Factor</h3>
                <ProfitFactorStat profitFactor={stats.profitFactor} />
            </div>
        </div>
    );
}
