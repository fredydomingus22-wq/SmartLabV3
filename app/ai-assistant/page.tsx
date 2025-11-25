"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("/api/ai/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });
            const data = await res.json();
            const assistantMsg = { role: "assistant", content: data.reply };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (e) {
            console.error(e);
            setMessages((prev) => [...prev, { role: "assistant", content: "Error communicating with AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto my-8">
            <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex-1 overflow-y-auto max-h-96 space-y-2">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
                            <span className={msg.role === "user" ? "bg-primary text-primary-foreground px-3 py-1 rounded" : "bg-muted text-muted-foreground px-3 py-1 rounded"}>
                                {msg.content}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Ask the assistant..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={loading}
                    />
                    <Button onClick={sendMessage} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
