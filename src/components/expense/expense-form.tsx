"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { storage, Expense } from "@/lib/storage";

interface ExpenseFormProps {
    onAddExpense: (expense: Expense) => void;
    initialDate?: Date;
}

export function ExpenseForm({ onAddExpense, initialDate }: ExpenseFormProps) {
    const { user } = useAuth();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Subscription");
    const [type, setType] = useState<"EXPENSE" | "REFUND">("EXPENSE");
    const [date, setDate] = useState(initialDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]);

    useEffect(() => {
        if (initialDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDate(initialDate.toISOString().split("T")[0]);
        }
    }, [initialDate]);

    const categories = ["Software", "Data", "Education", "Hardware", "Other"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !user) return;

        const newExpense = storage.addExpense({
            description,
            amount: Number(amount),
            category,
            type: type as "EXPENSE" | "REFUND",
            date,
            userId: user.id
        });

        onAddExpense(newExpense);
        setDescription("");
        setAmount("");
        setCategory("Other");
        setType("EXPENSE");
    };

    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. TradingView Subscription"
                        className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as "EXPENSE" | "REFUND")}
                            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="EXPENSE">Expense</option>
                            <option value="REFUND">Refund</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    {type === "REFUND" ? "Add Refund" : "Add Expense"}
                </button>
            </form>
        </div>
    );
}
