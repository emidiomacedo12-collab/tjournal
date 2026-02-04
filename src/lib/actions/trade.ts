"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateTradeData {
    symbol: string;
    side: "BUY" | "SELL";
    price: number;
    quantity: number;
    pnl?: number;
    notes?: string;
    timestamp: string;
    userId: string;
}

export async function createTrade(data: CreateTradeData) {
    try {
        // 1. Ensure User Exists (Mock Auth workaround)
        // In a real app, the user is already trusted. 
        // Here we upsert the user to ensure FK constraints aren't violated if the DB was reset.
        await prisma.user.upsert({
            where: { id: data.userId },
            update: {},
            create: {
                id: data.userId,
                email: "demo@example.com",
                name: "Demo User",
            },
        });

        // 2. Create the Trade
        const trade = await prisma.trade.create({
            data: {
                symbol: data.symbol,
                side: data.side,
                price: data.price,
                quantity: data.quantity,
                pnl: data.pnl,
                notes: data.notes,
                timestamp: new Date(data.timestamp),
                userId: data.userId,
                // Optional accountId is omitted for now
            },
        });

        revalidatePath("/");

        const serializedTrade = {
            ...trade,
            price: trade.price.toNumber(),
            quantity: trade.quantity.toNumber(),
            pnl: trade.pnl ? trade.pnl.toNumber() : undefined,
        };

        return { success: true, trade: serializedTrade };
    } catch (error) {
        console.error("Failed to create trade:", error);
        return { success: false, error: "Failed to create trade" };
    }
}

export async function updateTrade(id: string, data: Partial<CreateTradeData>) {
    try {
        const updateData: any = { ...data };
        if (data.timestamp) {
            updateData.timestamp = new Date(data.timestamp);
        }

        const trade = await prisma.trade.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/");

        const serializedTrade = {
            ...trade,
            price: trade.price.toNumber(),
            quantity: trade.quantity.toNumber(),
            pnl: trade.pnl ? trade.pnl.toNumber() : undefined,
        };

        return { success: true, trade: serializedTrade };
    } catch (error) {
        console.error("Failed to update trade:", error);
        return { success: false, error: "Failed to update trade" };
    }
}

export async function deleteTrade(id: string) {
    try {
        await prisma.trade.delete({
            where: { id },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete trade:", error);
        return { success: false, error: "Failed to delete trade" };
    }
}

export async function getTrades(userId: string, year?: number, month?: number) {
    try {
        const whereClause: any = { userId };

        if (year !== undefined && month !== undefined) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

            whereClause.timestamp = {
                gte: startDate,
                lte: endDate
            };
        }

        const trades = await prisma.trade.findMany({
            where: whereClause,
            orderBy: { timestamp: "desc" },
        });

        return trades.map((trade) => ({
            ...trade,
            price: trade.price.toNumber(),
            quantity: trade.quantity.toNumber(),
            pnl: trade.pnl ? trade.pnl.toNumber() : undefined,
        }));
    } catch (error) {
        console.error("Failed to fetch trades:", error);
        return [];
    }
}
