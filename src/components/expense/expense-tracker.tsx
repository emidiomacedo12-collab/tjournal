"use client";

import { useState, useEffect } from "react";
import { Expense, storage } from "@/lib/storage";
import { ExpenseCategoryChart } from "./expense-category-chart";

interface ExpenseTrackerProps {
    expenses: Expense[];
    onAddExpense: (expense: Expense) => void;
    onDeleteExpense: (id: string) => void;
    initialDate?: Date;
}

export function ExpenseTracker({ expenses, onAddExpense, onDeleteExpense, initialDate }: ExpenseTrackerProps) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Other");
    const [type, setType] = useState<"EXPENSE" | "REFUND">("EXPENSE");
    const [date, setDate] = useState((initialDate || new Date()).toISOString().split("T")[0]);

    // Update date when initialDate changes
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate.toISOString().split("T")[0]);
        }
    }, [initialDate]);

    const categories = ["Software", "Data", "Education", "Hardware", "Other"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const newExpense = storage.addExpense({
            description,
            amount: parseFloat(amount),
            category,
            type,
            date: new Date(date).toISOString(),
        });

        onAddExpense(newExpense);

        // Reset form
        setDescription("");
        setAmount("");
        setCategory("Other");
        setType("EXPENSE");
        // Keep the currently selected date
    };

    const totalExpenses = (expenses || []).reduce((acc, curr) => {
        if (curr.type === "REFUND") return acc - curr.amount; // Refunds reduce total
        return acc + curr.amount;
    }, 0);

    return (
        <div className="space-y-8">
            {/* Chart Section */}
            {(expenses || []).length > 0 && <ExpenseCategoryChart expenses={expenses} />}

            <div className="bg-card rounded-xl border border-border p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-card-foreground">Expense Tracker</h2>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500">Total Expenses</p>
                        <p className="text-xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                    </div>
                </div>

                {/* Add Expense Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. TradingView Subscription"
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as "EXPENSE" | "REFUND")}
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="EXPENSE">Expense</option>
                            <option value="REFUND">Refund</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-5 flex justify-end mt-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors w-full md:w-auto"
                        >
                            {type === "REFUND" ? "Add Refund" : "Add Expense"}
                        </button>
                    </div>
                </form>

                {/* Expense List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Date</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {(expenses || []).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                        No expenses recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                (expenses || []).map((expense) => (
                                    <tr key={expense.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{expense.description}</td>
                                        <td className="px-4 py-3 text-zinc-500">
                                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs border border-zinc-200 dark:border-zinc-700">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-medium ${expense.type === "REFUND" ? "text-green-600" : "text-red-600"}`}>
                                            {expense.type === "REFUND" ? "+" : "-"}${expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => onDeleteExpense(expense.id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                                aria-label="Delete expense"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
