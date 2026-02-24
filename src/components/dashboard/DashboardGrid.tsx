"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import { Widget } from "./Widget";
import { debounce } from "lodash";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "dashboard-layout-v1";

type GridLayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number };
type GridLayouts = { [key: string]: GridLayoutItem[] };

const defaultLayouts: GridLayouts = {
    lg: [
        { i: "pnl", x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
        { i: "avg", x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
        { i: "winRate", x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
        { i: "factor", x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
        { i: "equity", x: 0, y: 4, w: 8, h: 8, minW: 6, minH: 6 },
        { i: "gatekeeper", x: 8, y: 4, w: 4, h: 8, minW: 4, minH: 6 },
        { i: "calendar", x: 0, y: 12, w: 12, h: 10, minW: 8, minH: 6 },
        { i: "trades", x: 0, y: 22, w: 12, h: 10, minW: 8, minH: 6 },
    ],
    md: [
        { i: "pnl", x: 0, y: 0, w: 5, h: 4 },
        { i: "avg", x: 5, y: 0, w: 5, h: 4 },
        { i: "winRate", x: 0, y: 4, w: 5, h: 4 },
        { i: "factor", x: 5, y: 4, w: 5, h: 4 },
        { i: "equity", x: 0, y: 8, w: 10, h: 8 },
        { i: "gatekeeper", x: 0, y: 16, w: 10, h: 8 },
        { i: "calendar", x: 0, y: 24, w: 10, h: 10 },
        { i: "trades", x: 0, y: 34, w: 10, h: 10 },
    ],
};

interface DashboardGridProps {
    pnlStat: React.ReactNode;
    avgStat: React.ReactNode;
    winRateStat: React.ReactNode;
    factorStat: React.ReactNode;
    chart: React.ReactNode;
    calendar: React.ReactNode;
    trades: React.ReactNode;
    gatekeeper: React.ReactNode;
}

export function DashboardGrid({
    pnlStat,
    avgStat,
    winRateStat,
    factorStat,
    chart,
    calendar,
    trades,
    gatekeeper
}: DashboardGridProps) {
    const [layouts, setLayouts] = useState<GridLayouts>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to load layout", e);
                }
            }
        }
        return defaultLayouts;
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const saveLayout = useMemo(
        () => debounce((allLayouts: GridLayouts) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
        }, 500),
        []
    );

    const onLayoutChange = (_currentLayout: any, allLayouts: any) => {
        if (mounted) {
            setLayouts(allLayouts);
            saveLayout(allLayouts);
        }
    };

    if (!mounted) return null;

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            draggableHandle=".draggable-handle"
            resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
            onLayoutChange={onLayoutChange}
            margin={[24, 24]}
        >
            <div key="pnl">
                <Widget id="pnl" title="Net P&L" hideHeader noPadding>
                    {pnlStat}
                </Widget>
            </div>
            <div key="avg">
                <Widget id="avg" title="Avg. Win/Loss" hideHeader noPadding>
                    {avgStat}
                </Widget>
            </div>
            <div key="winRate">
                <Widget id="winRate" title="Win Rate" hideHeader noPadding>
                    {winRateStat}
                </Widget>
            </div>
            <div key="factor">
                <Widget id="factor" title="Profit Factor" hideHeader noPadding>
                    {factorStat}
                </Widget>
            </div>
            <div key="equity">
                <Widget id="equity" title="Equity Curve & P&L">
                    {chart}
                </Widget>
            </div>
            <div key="gatekeeper">
                <Widget id="gatekeeper" title="Analysis & Metrics">
                    {gatekeeper}
                </Widget>
            </div>
            <div key="calendar">
                <Widget id="calendar" title="Calendar View" hideHeader noPadding>
                    {calendar}
                </Widget>
            </div>
            <div key="trades">
                <Widget id="trades" title="Trade History" hideHeader noPadding>
                    {trades}
                </Widget>
            </div>
        </ResponsiveGridLayout>
    );
}
