import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI client – API key should be stored in OPENAI_API_KEY env variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
            temperature: 0.2,
        });
        const reply = completion.choices[0].message?.content || "";
        return NextResponse.json({ reply });
    } catch (error) {
        console.error("AI Assistant error:", error);
        return NextResponse.json({ reply: "Error processing request." }, { status: 500 });
    }
}
