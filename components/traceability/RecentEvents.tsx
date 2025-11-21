"use client"

import { ChevronRight } from "lucide-react";

interface Event {
    type: string;
    code: string;
    description: string;
    time: string;
    location: string;
    href?: string;
}

interface RecentEventsProps {
    events: Event[];
}

export function RecentEvents({ events }: RecentEventsProps) {
    const typeColors: Record<string, string> = {
        RM: "bg-green-500",
        PL: "bg-blue-500",
        PI: "bg-amber-500",
        PF: "bg-purple-500",
        NC: "bg-red-500",
        PCC: "bg-slate-500"
    };

    return (
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-1">Eventos recentes</h3>
            <p className="text-sm text-muted-foreground mb-4">Últimos marcos ao longo da cadeia</p>

            <div className="space-y-1.5">
                {events.map((event, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                        <div className={`w-2 h-2 rounded-full ${typeColors[event.type]} flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-sm">{event.type}</span>
                                <span className="text-xs text-muted-foreground truncate">{event.description}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {event.time} · {event.location}
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
