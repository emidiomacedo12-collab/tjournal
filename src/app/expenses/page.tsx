"use client";

import { useState, useEffect } from "react";
import { ExpenseTracker } from "@/components/expense/expense-tracker";
import { ExpenseCalendar } from "@/components/expense/expense-calendar";
import { MonthlyExpenseSummary } from "@/components/expense/monthly-expense-summary";
import { storage } from "@/lib/storage";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        setExpenses(storage.getExpenses() || []);
    }, []);

    const handleAddExpense = (expense: any) => {
        const newExpenses = [expense, ...expenses];
        setExpenses(newExpenses);
    };

    const handleDeleteExpense = (id: string) => {
        const newExpenses = expenses.filter(e => e.id !== id);
        setExpenses(newExpenses);
        storage.deleteExpense(id);
    };

    // Filter expenses for the selected date
    const filteredExpenses = expenses.filter(e =>
        new Date(e.date).toDateString() === selectedDate.toDateString()
    );

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-background text-foreground font-sans pb-32">
            <div className="w-full max-w-7xl space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 space-y-6">
                        <MonthlyExpenseSummary expenses={expenses} />
                        <ExpenseCalendar
                            expenses={expenses}
                            currentDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    </div>

                    <div className="w-full md:w-2/3">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">Expenses</h1>
                            <div className="text-sm text-zinc-500 font-medium bg-muted px-3 py-1 rounded-full">
                                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <ExpenseTracker
                            expenses={filteredExpenses}
                            onAddExpense={handleAddExpense}
                            onDeleteExpense={handleDeleteExpense}
                            initialDate={selectedDate}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
