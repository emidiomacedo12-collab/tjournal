"use client";

import React from "react";

interface WidgetProps {
    id: string;
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
    hideHeader?: boolean;
    noPadding?: boolean;
    compact?: boolean;
}

export const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(
    ({ id, title, children, className, style, onMouseDown, onMouseUp, onTouchEnd, hideHeader, noPadding, compact }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                className={`bg-card rounded-xl border border-border shadow-md flex flex-col h-full overflow-hidden ${hideHeader ? 'draggable-handle' : ''} ${className}`}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
            >
                {!hideHeader && (
                    <div className={`draggable-handle border-b border-border flex items-center justify-between cursor-grab active:cursor-grabbing bg-zinc-900/50 ${compact ? 'p-2 px-3' : 'p-4'}`}>
                        <h3 className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold uppercase tracking-wider text-zinc-400`}>{title}</h3>
                        {!compact && (
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            </div>
                        )}
                    </div>
                )}
                <div className={`flex-1 overflow-auto custom-scrollbar ${noPadding ? 'p-0' : 'p-4'}`}>
                    {children}
                </div>
            </div>
        );
    }
);

Widget.displayName = "Widget";
