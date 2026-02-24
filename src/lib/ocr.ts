import Tesseract from 'tesseract.js';

export interface ScannedTradeData {
    symbol?: string;
    side?: "BUY" | "SELL";
    price?: number;
    quantity?: number;
    stopLoss?: number;
    target?: number;
    text?: string;
}

export async function parseTradeScreenshot(file: File): Promise<ScannedTradeData> {
    const result = {
        symbol: undefined,
        side: undefined,
        price: undefined,
        quantity: undefined,
        stopLoss: undefined,
        target: undefined,
        text: ""
    } as ScannedTradeData;

    try {
        const { data: { text } } = await Tesseract.recognize(
            file,
            'eng',
            { logger: m => console.log(m) }
        );

        result.text = text;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        // --- Regex Patterns --- //

        // 1. Symbol
        const ignoredWords = ["BUY", "SELL", "LIMIT", "MARKET", "EST", "TOTAL", "ORDER", "FILL", "AVG", "COST", "COLLATERAL", "TYPE", "TIME", "STATUS", "LONG", "SHORT", "PROFIT", "STOP", "RISK", "REWARD", "ENTRY"];
        for (const line of lines) {
            if (/^[A-Z]{1,5}$/.test(line) && !ignoredWords.includes(line)) {
                result.symbol = line;
                break;
            }
            const words = line.split(' ');
            if (words.length > 0 && /^[A-Z]{1,5}$/.test(words[0]) && !ignoredWords.includes(words[0])) {
                result.symbol = words[0];
                break;
            }
        }

        // 2. Side: Buy/Sell/Long/Short
        const cleanText = text.replace(/\s+/g, ' ');
        if (/\bLong\b/i.test(cleanText) || /\bBuy\b/i.test(cleanText)) result.side = "BUY";
        else if (/\bShort\b/i.test(cleanText) || /\bSell\b/i.test(cleanText)) result.side = "SELL";

        // 3. TradingView Specifics (Labels often look like "Label: 123.45")

        // Entry Price / Price / Open
        const entryRegex = /(?:Entry|Price|Open):?\s*([\d,]+\.?\d*)/i;
        const entryMatch = cleanText.match(entryRegex);
        if (entryMatch) result.price = parseFloat(entryMatch[1].replace(/,/g, ''));

        // Profit Level / Target / Profit / Reward
        const profitRegex = /(?:Profit Level|Target|Profit|Reward):?\s*([\d,]+\.?\d*)/i;
        const profitMatch = cleanText.match(profitRegex);
        if (profitMatch) result.target = parseFloat(profitMatch[1].replace(/,/g, ''));

        // Stop Level / Stop Loss / Stop / Risk
        const stopRegex = /(?:Stop Level|Stop Loss|Stop|Risk):?\s*([\d,]+\.?\d*)/i;
        const stopMatch = cleanText.match(stopRegex);
        if (stopMatch) result.stopLoss = parseFloat(stopMatch[1].replace(/,/g, ''));

        // 4. Broker Fallbacks (Prices often start with $)
        if (!result.price) {
            const priceRegex = /\$([\d,]+\.\d{2})/;
            const priceMatch = cleanText.match(priceRegex);
            if (priceMatch) result.price = parseFloat(priceMatch[1].replace(/,/g, ''));
        }

        // 5. Quantity
        const qtyRegex = /(?:Qty|Amount|Quantity):?\s*(\d+)/i;
        const qtyMatch = cleanText.match(qtyRegex);
        if (qtyMatch) result.quantity = parseInt(qtyMatch[1], 10);
        else {
            const altQtyRegex = /(\d+)\s+Shares?/i;
            const altQtyMatch = cleanText.match(altQtyRegex);
            if (altQtyMatch) result.quantity = parseInt(altQtyMatch[1], 10);
        }

        return result;

    } catch (error) {
        console.error("OCR Error:", error);
        return result; // Return empty/partial on error
    }
}
