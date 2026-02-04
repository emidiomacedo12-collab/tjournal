"use client";

import { TradeForm, Trade } from "./trade-form";

interface AddTradeModalProps {
    isOpen: boolean;
    date: Date | null;
    onClose: () => void;
    onAddTrade: (trade: Trade) => void;
}

export function AddTradeModal({ isOpen, date, onClose, onAddTrade }: AddTradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 z-10"
                >
                    ✕
                </button>
                <TradeForm
                    onAddTrade={(trade) => {
                        onAddTrade(trade);
                        onClose();
                    }}
                    initialDate={date || new Date()}
                />
            </div>
        </div>
    );
}
