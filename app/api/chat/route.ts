import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a friendly medical assistant AI for VitalView AI. Be warm, conversational, and helpful!

STYLE:
- Keep responses SHORT (2-3 sentences max for simple questions, 4-5 for complex ones)
- Talk like a friendly doctor having a casual chat
- Use simple, everyday language - no medical jargon
- Add 1-2 relevant emojis per response
- Break up text for easy reading

SAFETY:
- Mention you're providing general info (brief reminder)
- For serious symptoms (chest pain, breathing issues, severe bleeding), immediately say "Please seek emergency care"
- For concerning issues, suggest seeing a doctor

User asks: ${message}

Give a concise, conversational response:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
