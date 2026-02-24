"use client";

import { Expense } from "@/lib/storage";

interface ExpenseListProps {
    expenses: Expense[];
    onDeleteExpense: (id: string) => void;
}

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
    const totalExpenses = (expenses || []).reduce((acc, curr) => {
        if (curr.type === "REFUND") return acc - curr.amount;
        return acc + curr.amount;
    }, 0);

    return (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-bold">Expenses</h2>
                <div className="text-right">
                    <p className="text-sm text-zinc-500">Total</p>
                    <p className={`text-xl font-bold ${totalExpenses >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${Math.abs(totalExpenses).toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 bg-zinc-900/50 uppercase">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Date</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {(expenses || []).length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                    No records for this day.
                                </td>
                            </tr>
                        ) : (
                            (expenses || []).map((expense) => (
                                <tr key={expense.id} className="hover:bg-zinc-900/50 transition-colors group">
                                    <td className="px-4 py-3 font-medium">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{expense.description}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-zinc-900 px-2 py-1 rounded text-xs border border-border">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-medium ${expense.type === "REFUND" ? "text-green-500" : "text-red-500"}`}>
                                        {expense.type === "REFUND" ? "+" : "-"}${expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onDeleteExpense(expense.id)}
                                            className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
    );
}
