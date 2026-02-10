"use client";

import { useState, useEffect } from "react";
import { ExpenseTracker } from "@/components/expense/expense-tracker";
import { storage } from "@/lib/storage";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);

    useEffect(() => {
        setExpenses(storage.getExpenses() || []);
    }, []);

    const handleAddExpense = (expense: any) => {
        setExpenses(prev => [expense, ...(Array.isArray(prev) ? prev : [])]);
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(prev => (Array.isArray(prev) ? prev : []).filter(e => e.id !== id));
        storage.deleteExpense(id);
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-background text-foreground font-sans pb-32">
            <div className="w-full max-w-7xl space-y-8">
                <h1 className="text-3xl font-bold">Expenses</h1>
                <ExpenseTracker
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onDeleteExpense={handleDeleteExpense}
                />
            </div>
        </main>
    );
}
