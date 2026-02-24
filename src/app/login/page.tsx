"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login, signup } = useAuth();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isLogin) {
                const success = await login(email, password);
                if (success) {
                    router.push("/dashboard");
                } else {
                    setError("Invalid email or password");
                }
            } else {
                if (!name) {
                    setError("Name is required");
                    setIsLoading(false);
                    return;
                }
                const success = await signup(email, password, name);
                if (success) {
                    router.push("/dashboard");
                } else {
                    setError("User already exists or signup failed");
                }
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6 py-12 transition-colors duration-300">
            <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border shadow-2xl relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-400 bg-clip-text text-transparent mb-2">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            {isLogin ? "Sign in to access your journal" : "Start your professional journaling journey"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-400">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-400">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-400">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium animate-in fade-in zoom-in-95">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                            }}
                            className="text-sm text-zinc-500 hover:text-blue-500 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
