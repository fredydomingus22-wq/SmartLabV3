"use client"

interface TimelineEvent {
    type: string;
    code: string;
    description: string;
    time: string;
    color: string;
}

interface QuickTimelineProps {
    events: TimelineEvent[];
}

export function QuickTimeline({ events }: QuickTimelineProps) {
    return (
        <div className="bg-card border rounded-xl p-6">
            <h3 className="text-base font-bold mb-1">Timeline rápida</h3>
            <p className="text-sm text-muted-foreground mb-4">Principais eventos</p>

            <div className="space-y-3">
                {events.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full ${event.color} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{event.type}</div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{event.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
