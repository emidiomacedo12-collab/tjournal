"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { storage } from "@/lib/storage";

export function CsvUploader() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setMessage("");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage("Parsing CSV...");

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setMessage("Failed to read file.");
                setUploading(false);
                return;
            }

            try {
                const lines = text.split(/\r?\n/);
                const tradesToAdd: any[] = [];
                let successCount = 0;
                let failCount = 0;

                // Simple parser assuming headers in first row
                // headers: symbol, side, price, quantity, date, pnl, notes

                // Skip header if present (heuristic: check if first line has "symbol")
                let startIndex = 0;
                if (lines[0].toLowerCase().includes("symbol")) {
                    startIndex = 1;
                }

                for (let i = startIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const cols = line.split(",").map(c => c.trim());
                    if (cols.length < 4) { // Minimum required fields
                        failCount++;
                        continue;
                    }

                    // Mapping (adjust indices based on expected format or make it smarter later)
                    // Expected: Symbol, Side, Price, Qty, Date, PnL, Notes
                    const symbol = cols[0].toUpperCase();
                    const sideRaw = cols[1].toUpperCase();
                    const price = parseFloat(cols[2]);
                    const quantity = parseFloat(cols[3]);
                    const dateRaw = cols[4];
                    const pnl = cols[5] ? parseFloat(cols[5]) : undefined;
                    const notes = cols[6] || "";

                    if (!symbol || !price || !quantity || (sideRaw !== "BUY" && sideRaw !== "SELL")) {
                        failCount++;
                        continue;
                    }

                    tradesToAdd.push({
                        symbol,
                        side: sideRaw as "BUY" | "SELL",
                        price,
                        quantity,
                        timestamp: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
                        pnl,
                        notes,
                        userId: user?.id || "demo-user",
                    });
                    successCount++;
                }

                if (tradesToAdd.length > 0) {
                    await storage.addTrades(tradesToAdd);
                    // Force refresh by reloading or we could use context to refresh data
                    // For now, simpler to just message
                    setMessage(`Successfully imported ${successCount} trades. ${failCount > 0 ? `(${failCount} skipped)` : ""} Refresh to see changes.`);
                    setFile(null);
                    // window.location.reload(); // Optional: auto reload
                } else {
                    setMessage("No valid trades found in CSV.");
                }

            } catch (error) {
                console.error("CSV parse error:", error);
                setMessage("Failed to parse CSV file. Check format.");
            } finally {
                setUploading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Upload Trades</h2>
            <p className="text-sm text-zinc-500 mb-4">
                Format: Symbol, Side, Price, Qty, Date, PnL, Notes
            </p>

            <div
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <p className="text-zinc-500 dark:text-zinc-400 mb-2">Drag and drop your CSV file here</p>
                <p className="text-xs text-zinc-400 mb-4">or</p>

                <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer transition-colors">
                    Browse Files
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            {file && (
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{file.name}</span>
                    <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                    >
                        Remove
                    </button>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full mt-4 py-2 px-4 rounded font-medium text-white transition-colors ${!file || uploading
                    ? "bg-zinc-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
            >
                {uploading ? "Importing..." : "Import Trades"}
            </button>

            {message && (
                <p className={`mt-3 text-sm text-center ${message.includes("Success") ? "text-green-600" : message.includes("Failed") || message.includes("No valid") ? "text-red-600" : "text-zinc-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
