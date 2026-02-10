"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export function Header() {
    const { user, login, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    return (
        <nav className="w-full bg-card/50 backdrop-blur-md border-b border-border mb-8 sticky top-0 z-50">
            <div className="w-full px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TJ</div>
                    <span className="font-bold text-lg tracking-tight">TradeJournal</span>
                </div>

                {/* Right Side: Links & Controls */}
                <div className="flex items-center gap-6">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/expenses" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Expenses
                        </Link>
                    </div>

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

                    {/* Theme Toggle */}
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        {(['light', 'dark', 'navy'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === t
                                    ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                                    }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* User Controls */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hidden md:inline">{user.name}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                aria-label="Sign Out"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Connect
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
