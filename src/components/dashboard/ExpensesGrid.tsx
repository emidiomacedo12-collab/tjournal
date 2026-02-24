"use client";

import React, { useState, useEffect } from "react";
// @ts-ignore
import { Responsive, WidthProvider, Layout } from "react-grid-layout/legacy";
import { Widget } from "./Widget";
import { debounce } from "lodash";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "expenses-layout-v1";

const defaultLayouts: { [key: string]: any[] } = {
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
