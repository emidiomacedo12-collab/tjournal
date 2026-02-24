"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { MonthlyExpenseSummary } from "@/components/expense/monthly-expense-summary";
import { ExpenseForm } from "@/components/expense/expense-form";
import { ExpenseList } from "@/components/expense/expense-list";
import { ExpenseCalendar } from "@/components/expense/expense-calendar";
import { storage, Expense } from "@/lib/storage";

import { ExpensesGrid } from "@/components/dashboard/ExpensesGrid";

export default function ExpensesPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (user) {
            setExpenses(storage.getExpenses(user.id) || []);
        } else {
            setExpenses([]);
        }
    }, [user]);

    const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
        if (!user) return;
        const newExpense = storage.addExpense({ ...expense, userId: user.id });
        setExpenses([newExpense, ...expenses]);
    };

    const handleDeleteExpense = (id: string) => {
        const newExpenses = expenses.filter(e => e.id !== id);
        setExpenses(newExpenses);
        storage.deleteExpense(id);
    };

    const filteredExpenses = expenses.filter(e =>
        new Date(e.date).toDateString() === selectedDate.toDateString()
    );

    return (
        <main className="flex min-h-screen flex-col items-center bg-background text-foreground font-sans transition-colors duration-300">
            <div className="w-full px-4 md:px-8 py-4 md:py-8">
                <div className="flex justify-between items-center mb-8 px-4">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-400 bg-clip-text text-transparent">Financials</h1>
                    <div className="text-sm font-medium bg-zinc-900/50 dark:bg-zinc-800/50 text-foreground px-4 py-2 rounded-full border border-border backdrop-blur-sm">
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <ExpensesGrid
                    summary={<MonthlyExpenseSummary expenses={expenses} />}
                    form={
                        <ExpenseForm
                            onAddExpense={handleAddExpense}
                            initialDate={selectedDate}
                        />
                    }
                    calendar={
                        <ExpenseCalendar
                            expenses={expenses}
                            currentDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    }
                    list={
                        <ExpenseList
                            expenses={filteredExpenses}
                            onDeleteExpense={handleDeleteExpense}
                        />
                    }
                />
            </div>
        </main>
    );
}
