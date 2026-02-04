"use client";

import { useState, useEffect } from "react";
import { Trade } from "@/lib/storage";

// Trade has mandatory id.
interface EditableTrade extends Trade {
    // Just pass through
}

interface TradeDetailModalProps {
    isOpen: boolean;
    trade: EditableTrade | null;
    onClose: () => void;
    onSave: (id: string, updatedData: Partial<Trade> & { notes?: string }) => Promise<void>;
}

export function TradeDetailModal({ isOpen, trade, onClose, onSave }: TradeDetailModalProps) {
    const [formData, setFormData] = useState<Partial<EditableTrade>>({});
    const [loading, setLoading] = useState(false);

    // Initialize form data when trade changes
    useEffect(() => {
        if (trade) {
            setFormData({
                price: trade.price,
                quantity: trade.quantity,
                pnl: trade.pnl,
                notes: trade.notes || "",
            });
        }
    }, [trade]);

    if (!isOpen || !trade) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!trade.id) return;

        setLoading(true);
        try {
            await onSave(trade.id, {
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                pnl: formData.pnl ? Number(formData.pnl) : undefined,
                notes: formData.notes,
            });
            onClose();
        } catch (error) {
            console.error("Failed to update trade", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/30">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                            {trade.symbol}
                            <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${trade.side === "BUY"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                {trade.side}
                            </span>
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            Executed on {new Date(trade.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Entry Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price || ""}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity || ""}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* P&L */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Realized P&L
                            </label>
                            <input
                                type="number"
                                name="pnl"
                                value={formData.pnl || ""}
                                onChange={handleChange}
                                step="0.01"
                                className={`w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none font-bold ${(Number(formData.pnl) || 0) >= 0 ? "text-green-600" : "text-red-600"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Trading Notes & Analysis
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes || ""}
                            onChange={handleChange}
                            placeholder="Why did you take this trade? What went well/wrong?"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none min-h-[200px] resize-y"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm ${loading ? "bg-zinc-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
