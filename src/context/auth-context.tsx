"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storage } from "@/lib/storage";

// Mock User Type
interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("current_user");
            return storedUser ? JSON.parse(storedUser) : null;
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Persist user changes (login/logout will call setUser)
        if (user) {
            localStorage.setItem("current_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("current_user");
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        const existingUser = storage.findUserByEmail(email);
        if (existingUser && existingUser.password === password) {
            setUser(existingUser);
            localStorage.setItem("current_user", JSON.stringify(existingUser));
            return true;
        }
        return false;
    };

    const signup = async (email: string, password: string, name: string) => {
        const existingUser = storage.findUserByEmail(email);
        if (existingUser) return false;

        const newUser = storage.addUser({ email, password, name });
        setUser(newUser);
        localStorage.setItem("current_user", JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("current_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
