import { Trade } from "@/components/trade/trade-form";

// Extend Trade definition to include optional ID for delete
interface TradeWithId extends Trade {
    id?: string;
    notes?: string;
}

interface TradeListProps {
    trades: TradeWithId[];
    onDelete: (id: string) => void;
    onSelect: (trade: TradeWithId) => void;
}

export function TradeList({ trades, onDelete, onSelect }: TradeListProps) {
    if (trades.length === 0) {
        return (
            <div className="text-zinc-500 dark:text-zinc-400 text-center py-8">
                No trades recorded yet.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">Time</th>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3">Side</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">P&L</th>
                        <th className="px-4 py-3 rounded-r-lg">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((trade, index) => (
                        <tr
                            key={index}
                            onClick={() => onSelect(trade)}
                            className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                        >
                            <td className="px-4 py-3 text-zinc-500 font-mono">
                                {new Date(trade.timestamp).toLocaleString(undefined, {
                                    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </td>
                            <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">{trade.symbol}</td>
                            <td className={`px-4 py-3 font-bold ${trade.side === "BUY" ? "text-green-600" : "text-red-600"}`}>
                                {trade.side}
                            </td>
                            <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 text-right">${trade.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 text-right">{trade.quantity}</td>
                            <td className={`px-4 py-3 font-bold text-right ${(trade.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                {(trade.pnl || 0) >= 0 ? "+" : ""}${(trade.pnl || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {trade.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(trade.id!);
                                        }}
                                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                                        title="Delete Trade"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
