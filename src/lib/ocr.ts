import Tesseract from 'tesseract.js';

export interface ScannedTradeData {
    symbol?: string;
    side?: "BUY" | "SELL";
    price?: number;
    quantity?: number;
    text?: string;
}

export async function parseTradeScreenshot(file: File): Promise<ScannedTradeData> {
    const result = {
        symbol: undefined,
        side: undefined,
        price: undefined,
        quantity: undefined,
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

        // 1. Symbol: Needs to be specific to avoid false positives.
        // Look for 1-5 Uppercase letters, often on their own line or before "Market"
        // Common false positives: "BUY", "SELL", "LIMIT", "MARKET", "EST", "TOTAL"
        const ignoredWords = ["BUY", "SELL", "LIMIT", "MARKET", "EST", "TOTAL", "ORDER", "FILL", "AVG", "COST", "COLLATERAL", "TYPE", "TIME", "STATUS"];
        const symbolRegex = /\b[A-Z]{1,5}\b/;

        for (const line of lines) {
            // Heuristic A: Line is just a symbol (e.g. "AAPL")
            if (/^[A-Z]{1,5}$/.test(line) && !ignoredWords.includes(line)) {
                result.symbol = line;
                break;
            }
            // Heuristic B: Symbol followed by price or exchange (e.g. "AAPL $150.00")
            const words = line.split(' ');
            if (words.length > 0 && /^[A-Z]{1,5}$/.test(words[0]) && !ignoredWords.includes(words[0])) {
                // Check if it looks header-like
                result.symbol = words[0];
                break;
            }
        }

        // 2. Side: Buy/Sell/Long/Short
        if (/Buy|Long/i.test(text)) result.side = "BUY";
        else if (/Sell|Short/i.test(text)) result.side = "SELL";

        // 3. Price: Look for dollar amounts. 
        // Heuristic: "Avg Cost", "Price", "Filled at" often precede the execution price.
        // Or simply the largest dollar amount that constitutes a reasonable share price?
        // Let's look for "at $xx.xx" or "$xx.xx"
        const priceRegex = /\$([\d,]+\.\d{2})/;
        const priceMatches = text.match(priceRegex);
        if (priceMatches && priceMatches[1]) {
            result.price = parseFloat(priceMatches[1].replace(/,/g, ''));
        }

        // 4. Quantity: "x Shares" or just a number before "Shares"
        const qtyRegex = /(\d+)\s+Shares?/i;
        const qtyMatch = text.match(qtyRegex);
        if (qtyMatch && qtyMatch[1]) {
            result.quantity = parseInt(qtyMatch[1], 10);
        }

        return result;

    } catch (error) {
        console.error("OCR Error:", error);
        return result; // Return empty/partial on error
    }
}
