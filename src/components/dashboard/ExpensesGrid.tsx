"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout/legacy";
import { Widget } from "./Widget";
import { debounce } from "lodash";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "expenses-layout-v1";

type GridLayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number };
type GridLayouts = Record<string, GridLayoutItem[]>;

const defaultLayouts: GridLayouts = {
    lg: [
        { i: "summary", x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
        { i: "form", x: 0, y: 4, w: 4, h: 8, minW: 3, minH: 6 },
        { i: "calendar", x: 0, y: 12, w: 12, h: 10, minW: 8, minH: 6 },
        { i: "list", x: 4, y: 0, w: 8, h: 18, minW: 6, minH: 8 },
    ],
    md: [
        { i: "summary", x: 0, y: 0, w: 10, h: 4 },
        { i: "form", x: 0, y: 4, w: 10, h: 8 },
        { i: "calendar", x: 0, y: 12, w: 10, h: 10 },
        { i: "list", x: 0, y: 18, w: 10, h: 10 },
    ],
};

interface ExpensesGridProps {
    summary: React.ReactNode;
    form: React.ReactNode;
    calendar: React.ReactNode;
    list: React.ReactNode;
}

export function ExpensesGrid({ summary, form, calendar, list }: ExpensesGridProps) {
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
            <div key="summary">
                <Widget id="summary" title="Monthly Summary">
                    {summary}
                </Widget>
            </div>
            <div key="form">
                <Widget id="form" title="Add Expense">
                    {form}
                </Widget>
            </div>
            <div key="calendar">
                <Widget id="calendar" title="Expense Timeline" hideHeader noPadding>
                    {calendar}
                </Widget>
            </div>
            <div key="list">
                <Widget id="list" title="Detailed Expenses">
                    {list}
                </Widget>
            </div>
        </ResponsiveGridLayout>
    );
}
