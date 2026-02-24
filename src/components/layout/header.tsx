"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

export function Header() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    return (
        <nav className="w-full bg-card/50 backdrop-blur-md border-b border-border mb-8 sticky top-0 z-50">
            <div className="w-full px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 self-start md:self-auto hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TJ</div>
                    <span className="font-bold text-lg tracking-tight">TradeJournal</span>
                </Link>

                {/* Right Side: Links & Controls */}
                <div className="flex items-center gap-6">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Home
                        </Link>
                        {user && (
                            <>
                                <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/expenses" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Expenses
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
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

                        {/* Auth Controls */}
                        {user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <span className="text-xs font-medium text-zinc-500 hidden md:block">
                                    {user.name}
                                </span>
                                <button
                                    onClick={logout}
                                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-xs px-4 py-2 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-bold ml-2"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
