"use client";

import React, { useState, useEffect } from "react";
// @ts-ignore
import { Responsive, WidthProvider, Layout } from "react-grid-layout/legacy";
import { Widget } from "./Widget";
import { debounce } from "lodash";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "dashboard-layout-v1";

const defaultLayouts: { [key: string]: any[] } = {
    lg: [
        { i: "stat-pnl", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: "stat-avg", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: "stat-winrate", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: "stat-factor", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: "chart", x: 0, y: 2, w: 8, h: 6, minW: 4, minH: 4 },
        { i: "calendar", x: 0, y: 8, w: 12, h: 10, minW: 8, minH: 6 },
        { i: "trades", x: 0, y: 18, w: 8, h: 6, minW: 4, minH: 4 },
        { i: "gatekeeper", x: 8, y: 18, w: 4, h: 12, minW: 3, minH: 6 },
    ],
    md: [
        { i: "stat-pnl", x: 0, y: 0, w: 5, h: 2 },
        { i: "stat-avg", x: 5, y: 0, w: 5, h: 2 },
        { i: "stat-winrate", x: 0, y: 2, w: 5, h: 2 },
        { i: "stat-factor", x: 5, y: 2, w: 5, h: 2 },
        { i: "chart", x: 0, y: 4, w: 10, h: 6 },
        { i: "calendar", x: 0, y: 10, w: 10, h: 10 },
        { i: "trades", x: 0, y: 20, w: 10, h: 6 },
        { i: "gatekeeper", x: 0, y: 22, w: 10, h: 8 },
    ],
};

interface DashboardGridProps {
    pnlStat: React.ReactNode;
    avgStat: React.ReactNode;
    winRateStat: React.ReactNode;
    factorStat: React.ReactNode;
    chart: React.ReactNode;
    trades: React.ReactNode;
    gatekeeper: React.ReactNode;
    calendar: React.ReactNode;
}

export function DashboardGrid({
    pnlStat,
    avgStat,
    winRateStat,
    factorStat,
    chart,
    trades,
    gatekeeper,
    calendar
}: DashboardGridProps) {
    const [layouts, setLayouts] = useState<{ [key: string]: any[] }>(defaultLayouts);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setLayouts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load layout", e);
            }
        }
    }, []);

    // Stabilize the debounced save function
    const saveLayout = React.useCallback(
        debounce((allLayouts: { [key: string]: any[] }) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
        }, 500),
        []
    );

    const onLayoutChange = (currentLayout: any, allLayouts: any) => {
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
            <div key="stat-pnl">
                <Widget id="stat-pnl" title="Net P&L">
                    {pnlStat}
                </Widget>
            </div>
            <div key="stat-avg">
                <Widget id="stat-avg" title="Avg Win/Loss">
                    {avgStat}
                </Widget>
            </div>
            <div key="stat-winrate">
                <Widget id="stat-winrate" title="Win Rate">
                    {winRateStat}
                </Widget>
            </div>
            <div key="stat-factor">
                <Widget id="stat-factor" title="Profit Factor">
                    {factorStat}
                </Widget>
            </div>
            <div key="chart">
                <Widget id="chart" title="Performance Analysis">
                    {chart}
                </Widget>
            </div>
            <div key="calendar">
                <Widget id="calendar" title="Monthly Calendar" hideHeader noPadding>
                    {calendar}
                </Widget>
            </div>
            <div key="trades">
                <Widget id="trades" title="Recent Activity">
                    {trades}
                </Widget>
            </div>
            <div key="gatekeeper">
                <Widget id="gatekeeper" title="The Gatekeeper">
                    {gatekeeper}
                </Widget>
            </div>
        </ResponsiveGridLayout>
    );
}
