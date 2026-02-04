"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { createTrade } from "@/lib/actions/trade";

export interface Trade {
    symbol: string;
    side: "BUY" | "SELL";
    price: number;
    quantity: number;
    timestamp: string;
    pnl?: number;
    notes?: string;
}

interface TradeFormProps {
    onAddTrade: (trade: Trade) => void;
    initialDate?: Date;
}

export function TradeForm({ onAddTrade, initialDate }: TradeFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Partial<Trade> & { timestamp: string }>({
        symbol: "",
        side: "BUY" as "BUY" | "SELL",
        price: undefined,
        quantity: undefined,
        pnl: undefined,
        notes: "",
        timestamp: (initialDate || new Date()).toISOString().slice(0, 16),
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setMessage("Please log in to add trades.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const result = await createTrade({
                symbol: formData.symbol!.toUpperCase(),
                side: formData.side as "BUY" | "SELL",
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                pnl: formData.pnl ? Number(formData.pnl) : undefined,
                notes: formData.notes,
                timestamp: formData.timestamp,
                userId: user.id,
            });

            if (result.success && result.trade) {
                onAddTrade(result.trade as any); // Cast to any to avoid strict type mismatch with Date objects if needed
                setMessage(`Trade for ${result.trade.symbol} saved to database!`);
                // Reset form
                setFormData((prev) => ({
                    ...prev,
                    symbol: "",
                    price: undefined,
                    quantity: undefined,
                    pnl: undefined,
                    notes: "",
                    timestamp: (initialDate || new Date()).toISOString().slice(0, 16),
                }));
            } else {
                setMessage("Failed to save trade.");
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-bold mb-6 text-card-foreground flex items-center gap-2">
                <span className="text-blue-600">✍️</span> Log Trade
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Symbol */}
                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                        Symbol
                    </label>
                    <input
                        type="text"
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleChange}
                        placeholder="e.g. AAPL"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                        required
                    />
                </div>

                {/* Side */}
                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                        Side
                    </label>
                    <div className="flex gap-4">
                        <label className="flex-1">
                            <input
                                type="radio"
                                name="side"
                                value="BUY"
                                checked={formData.side === "BUY"}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="text-center py-2 rounded-lg border border-border cursor-pointer peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600 transition-all hover:bg-background/50">
                                Buy
                            </div>
                        </label>
                        <label className="flex-1">
                            <input
                                type="radio"
                                name="side"
                                value="SELL"
                                checked={formData.side === "SELL"}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="text-center py-2 rounded-lg border border-border cursor-pointer peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600 transition-all hover:bg-background/50">
                                Sell
                            </div>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity || ""}
                            onChange={handleChange}
                            placeholder="0"
                            step="0.01"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* P&L - Optional for open trades, but we'll treat it as realized for simplicity if entered */}
                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                        Realized P&L
                    </label>
                    <input
                        type="number"
                        name="pnl"
                        value={formData.pnl || ""}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        className={`w-full px-3 py-2 rounded-lg border border-border bg-transparent text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none ${(formData.pnl || 0) > 0 ? 'text-green-600 font-medium' : (formData.pnl || 0) < 0 ? 'text-red-600 font-medium' : ''
                            }`}
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="timestamp"
                        value={formData.timestamp}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleChange}
                        placeholder="Trade rationale, setup details..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    />
                </div>


                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors ${loading
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                        }`}
                >
                    {loading ? "Logging Trade..." : "Add Trade"}
                </button>

                {message && (
                    <p className={`text-sm text-center mt-2 ${message.includes("success") ? "text-green-600" : "text-zinc-600"}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
