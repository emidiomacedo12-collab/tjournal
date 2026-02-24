"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function LandingPage() {
  const { user, login } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-500 px-4 py-2 rounded-full text-sm font-bold border border-blue-500/20 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next Gen Trading Journal
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Track Every Trade. <br />
          <span className="bg-gradient-to-r from-blue-600 to-emerald-400 bg-clip-text text-transparent">
            Master Your Edge.
          </span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The professional journal for serious traders. Multi-phase entry, OCR screenshot scanning, and deep performance analytics—all in one beautiful dark dashboard.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Start Journaling Now
            </Link>
          )}

          <Link
            href="/expenses"
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-8 py-4 rounded-xl text-lg font-bold transition-all"
          >
            Manage Financials
          </Link>
        </div>

        {/* Feature Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-24">
          <div className="bg-card p-6 rounded-2xl border border-border text-left space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5m0-16.5L12 12m-8.25-8.25L12 12m8.25 8.25L12 12m8.25-8.25L3.75 3.75" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Draggable Layout</h3>
            <p className="text-sm text-zinc-500">Customize your workspace exactly how you like it with our widget system.</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border text-left space-y-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">OCR Scanning</h3>
            <p className="text-sm text-zinc-500">Upload your trade screenshots and let us extract the P&L automatically.</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border text-left space-y-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Expense Tracking</h3>
            <p className="text-sm text-zinc-500">Keep your overhead in check with our dedicated financials module.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
