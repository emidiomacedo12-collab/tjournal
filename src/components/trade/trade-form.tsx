"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { storage, Trade as StorageTrade } from "@/lib/storage";
import { parseTradeScreenshot } from "@/lib/ocr";

// Define a local form interface or re-export
export type Trade = StorageTrade;

interface TradeFormProps {
    onAddTrade: (trade: Trade) => void;
    initialDate?: Date;
    userId: string;
}

export function TradeForm({ onAddTrade, initialDate }: TradeFormProps) {
    const { user } = useAuth();

    // --- Phase & Form State ---
    const [currentPhase, setCurrentPhase] = useState<"A" | "B" | "C">("A");

    // OCR Scanning State
    const [isScanning, setIsScanning] = useState(false);
    const [scannedRawText, setScannedRawText] = useState<string | null>(null);
    const [showDebugText, setShowDebugText] = useState(false);

    const [formData, setFormData] = useState<Partial<Trade> & {
        timestamp: string;
        confirmClose?: boolean;
        confirmStructure?: boolean;
    }>({
        symbol: "",
        side: "BUY" as "BUY" | "SELL",
        price: undefined,
        quantity: undefined,
        pnl: undefined,
        notes: "",
        timestamp: (initialDate || new Date()).toISOString().slice(0, 16),
        mentalState: "Zen",
        setupLevel: undefined,
        setupType: undefined,
        outcome: undefined,
        stopLoss: undefined,
        target: undefined,
        confirmClose: false,
        confirmStructure: false,
        screenshotUrl: undefined
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [warning, setWarning] = useState<string | null>(null);

    // --- Computed Values ---
    const riskAmount = (formData.price && formData.stopLoss && formData.quantity)
        ? Math.abs(formData.price - formData.stopLoss) * formData.quantity
        : 0;

    const projectedPnL = (formData.price && formData.exitPrice && formData.quantity)
        ? (formData.side === "BUY"
            ? (formData.exitPrice - formData.price) * formData.quantity
            : (formData.price - formData.exitPrice) * formData.quantity)
        : undefined;

    // --- Event Handlers ---

    // OCR Scan Handler
    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setMessage("Scanning screenshot...");

        try {
            const data = await parseTradeScreenshot(file);
            console.log("Scanned Data:", data);
            setScannedRawText(data.text || null);

            setFormData(prev => ({
                ...prev,
                symbol: data.symbol || prev.symbol,
                side: data.side || prev.side,
                price: data.price || prev.price,
                quantity: data.quantity || prev.quantity,
                stopLoss: data.stopLoss || prev.stopLoss,
                target: data.target || prev.target
            }));

            const found = [];
            if (data.symbol) found.push("Symbol");
            if (data.price) found.push("Entry");
            if (data.side) found.push("Side");
            if (data.stopLoss) found.push("Stop Loss");
            if (data.target) found.push("Target");

            if (found.length > 0) {
                setMessage(`Auto-filled: ${found.join(", ")}`);
            } else {
                setMessage("Could not detect trade details. Please enter manually.");
            }
        } catch (error) {
            console.error("Scan failed", error);
            setMessage("Scan failed. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let newValue: any = value;
        if (type === "checkbox") {
            newValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number") {
            newValue = value === "" ? undefined : Number(value);
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleNextPhase = () => {
        if (currentPhase === "A") {
            // Validate Phase A
            if (!formData.mentalState || !formData.setupLevel || !formData.setupType) {
                setMessage("Please complete all Phase A fields.");
                return;
            }
            if (!formData.confirmClose || !formData.confirmStructure) {
                setMessage("You must wait for confirmations!");
                return;
            }
            setMessage("");
            setCurrentPhase("B");
        } else if (currentPhase === "B") {
            // Validate Phase B
            if (!formData.symbol || !formData.price || !formData.quantity || !formData.stopLoss || !formData.exitPrice) {
                setMessage("Please complete all Phase B fields.");
                return;
            }
            setMessage("");
            setCurrentPhase("C");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Streak Breaker Logic
        const todayStats = storage.getTrades(user?.id || "demo-user").filter(t =>
            t.symbol === formData.symbol?.toUpperCase() &&
            new Date(t.timestamp).toDateString() === new Date().toDateString()
        );

        // Simply check last 2 trades for losses
        if (todayStats.length >= 2) {
            const lastTwo = todayStats.slice(0, 2);
            const losses = lastTwo.filter(t => (t.pnl || 0) < 0).length;
            if (losses === 2) {
                const confirm = window.confirm(`Daily Stop Hit on ${formData.symbol}. You have 2 consecutive losses. Stop trading this symbol?`);
                if (!confirm) {
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            const newTrade = storage.addTrade({
                symbol: formData.symbol!.toUpperCase(),
                side: formData.side as "BUY" | "SELL",
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                pnl: projectedPnL, // Use calculated PnL
                notes: formData.notes,
                timestamp: formData.timestamp,
                userId: user?.id || "demo-user",
                mentalState: formData.mentalState,
                setupLevel: formData.setupLevel,
                setupType: formData.setupType,
                outcome: formData.outcome,
                stopLoss: formData.stopLoss,
                target: formData.target,
                exitPrice: formData.exitPrice,
                screenshotUrl: formData.screenshotUrl
            });

            if (newTrade) {
                onAddTrade(newTrade);
                setMessage(`Trade for ${newTrade.symbol} saved!`);
                // Reset form
                setFormData({
                    symbol: "",
                    side: "BUY",
                    price: undefined,
                    quantity: undefined,
                    pnl: undefined,
                    notes: "",
                    timestamp: (initialDate || new Date()).toISOString().slice(0, 16),
                    mentalState: "Zen",
                    setupLevel: undefined,
                    setupType: undefined,
                    outcome: undefined,
                    stopLoss: undefined,
                    target: undefined,
                    exitPrice: undefined,
                    confirmClose: false,
                    confirmStructure: false,
                    screenshotUrl: undefined
                });
                setCurrentPhase("A");
            } else {
                setMessage("Failed to save trade.");
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-bold mb-6 text-card-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">🛡️ The Gatekeeper</span>
                <span className="text-sm font-normal text-zinc-500">Phase {currentPhase}/C</span>
            </h2>

            {/* --- OCR SCANNER (Top of Form) --- */}
            <div className="mb-8 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <label className="block text-sm font-bold text-blue-400 mb-2">
                    🪄 Auto-Fill from TradingView Screenshot (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-blue-500/30 border-dashed rounded-lg cursor-pointer bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isScanning ? (
                                <p className="text-sm text-blue-400 animate-pulse">Scanning...</p>
                            ) : (
                                <>
                                    <p className="text-sm text-zinc-400"><span className="font-semibold text-blue-400">Click to upload</span> TradingView screenshot</p>
                                    <p className="text-xs text-zinc-500">Auto-detects Entry, Stop, Target</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleScan}
                            disabled={isScanning}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Debug Scan Text */}
            {scannedRawText && (
                <div className="mb-6 p-3 bg-zinc-900/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Scan Diagnostics</span>
                        <button
                            type="button"
                            onClick={() => setShowDebugText(!showDebugText)}
                            className="text-xs text-blue-400 hover:underline"
                        >
                            {showDebugText ? "Hide Raw Text" : "View Raw Text"}
                        </button>
                    </div>
                    {showDebugText && (
                        <pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto bg-black/20 p-2 rounded">
                            {scannedRawText}
                        </pre>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* --- PHASE A: Pre-Trade --- */}
                {currentPhase === "A" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-3 text-blue-400">🧠 Mental & Setup Check</h3>

                            {/* Mental State */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Mental State</label>
                                <select
                                    name="mentalState"
                                    value={formData.mentalState}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Zen">Zen (Calm/Focused)</option>
                                    <option value="Anxious">Anxious (Hesitant)</option>
                                    <option value="Tilted">Tilted (Angry/Frustrated)</option>
                                </select>
                                {formData.mentalState === "Tilted" && (
                                    <div className="mt-2 text-red-500 text-sm font-bold bg-red-500/10 p-2 rounded border border-red-500/20">
                                        🛑 STOP. Walk away for 10 minutes. Do not trade.
                                    </div>
                                )}
                            </div>

                            {/* Level */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">The Level</label>
                                <select
                                    name="setupLevel"
                                    value={formData.setupLevel || ""}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Select Level...</option>
                                    <option value="PDH">Previous Day High</option>
                                    <option value="PDL">Previous Day Low</option>
                                    <option value="PMH">Pre-Market High</option>
                                    <option value="PML">Pre-Market Low</option>
                                    <option value="Weekly High/Low">Weekly High/Low</option>
                                    <option value="No Mans Land">No Mans Land (Mid-Range)</option>
                                </select>
                                {formData.setupLevel === "No Mans Land" && (
                                    <div className="mt-2 text-yellow-500 text-sm font-bold bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                        ⚠️ Warning: Low Quality Setup. Reduce size.
                                    </div>
                                )}
                            </div>

                            {/* Setup Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Setup Type</label>
                                <select
                                    name="setupType"
                                    value={formData.setupType || ""}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Select Setup...</option>
                                    <option value="Break & Retest">Break & Retest</option>
                                    <option value="Rejection">Rejection</option>
                                    <option value="Trap">Trap / Fakeout</option>
                                </select>
                            </div>

                            {/* Confirmations */}
                            <div className="space-y-2 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="confirmClose"
                                        checked={formData.confirmClose}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-600"
                                    />
                                    <span className="text-sm text-zinc-300">5-Min Candle Close</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="confirmStructure"
                                        checked={formData.confirmStructure}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-600"
                                    />
                                    <span className="text-sm text-zinc-300">1-Min Structure Break</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextPhase}
                            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            Confirm Setup -&gt;
                        </button>
                    </div>
                )}

                {/* --- PHASE B: Execution --- */}
                {currentPhase === "B" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Symbol */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 mb-1">Symbol</label>
                                <input
                                    type="text"
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleChange}
                                    placeholder="AAPL"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-card-foreground focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    required
                                />
                            </div>

                            {/* Side */}
                            <div className="flex items-end gap-2">
                                <label className="flex-1 cursor-pointer">
                                    <input type="radio" name="side" value="BUY" checked={formData.side === "BUY"} onChange={handleChange} className="sr-only peer" />
                                    <div className="text-center py-2 rounded-lg border border-border peer-checked:bg-green-600 peer-checked:text-white transition-all text-xs font-bold uppercase tracking-wider">Long</div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input type="radio" name="side" value="SELL" checked={formData.side === "SELL"} onChange={handleChange} className="sr-only peer" />
                                    <div className="text-center py-2 rounded-lg border border-border peer-checked:bg-red-600 peer-checked:text-white transition-all text-xs font-bold uppercase tracking-wider">Short</div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Entry */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Entry</label>
                                <input type="number" step="0.01" name="price" value={formData.price || ""} onChange={handleChange} className="w-full px-2 py-2 rounded border border-border bg-transparent" />
                            </div>
                            {/* Stop */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Stop Loss</label>
                                <input type="number" step="0.01" name="stopLoss" value={formData.stopLoss || ""} onChange={handleChange} className="w-full px-2 py-2 rounded border border-border bg-transparent" />
                            </div>
                            {/* Target (Exit) */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Exit Price</label>
                                <input type="number" step="0.01" name="exitPrice" value={formData.exitPrice || ""} onChange={handleChange} className="w-full px-2 py-2 rounded border border-border bg-transparent" />
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-1">Quantity</label>
                            <input type="number" step="0.01" name="quantity" value={formData.quantity || ""} onChange={handleChange} className="w-full px-3 py-2 rounded border border-border bg-transparent" />
                        </div>

                        {/* Calculations Display */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="text-center">
                                <div className="text-xs text-zinc-500 uppercase">Risk</div>
                                <div className={`font-mono font-bold ${riskAmount > 200 ? 'text-red-500' : 'text-zinc-300'}`}>
                                    ${riskAmount.toFixed(2)}
                                </div>
                                {riskAmount > 200 && <div className="text-[10px] text-red-400">Exceeds $200 Risk!</div>}
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-zinc-500 uppercase">Est. P&L</div>
                                <div className={`font-mono font-bold ${(projectedPnL || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ${(projectedPnL || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setCurrentPhase("A")} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted">Back</button>
                            <button type="button" onClick={handleNextPhase} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700">Next -&gt; Media</button>
                        </div>
                    </div>
                )}

                {/* --- PHASE C: Media & Notes --- */}
                {currentPhase === "C" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                        <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-1">Chart / Analysis (Optional)</label>

                            <div className="flex items-center gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center hover:bg-zinc-800/50 transition-colors">
                                        {formData.screenshotUrl ? (
                                            <div className="relative w-full h-full p-2">
                                                <img
                                                    src={formData.screenshotUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain rounded"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded">
                                                    <span className="text-white text-xs font-bold">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-2xl mb-2">📷</span>
                                                <span className="text-sm text-zinc-500">Click to upload chart</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    setMessage("File too large (max 5MB)");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({ ...prev, screenshotUrl: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-1">Notes / Reflection</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background h-24 resize-none"
                                placeholder="What went well? What went wrong?"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setCurrentPhase("B")} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted">Back</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold hover:from-green-700 hover:to-emerald-600 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                            >
                                {loading ? "Logging..." : "Commit Trade"}
                            </button>
                        </div>
                    </div>
                )}

                {message && <p className="text-center text-sm text-red-500">{message}</p>}
            </form>
        </div>
    );
}
