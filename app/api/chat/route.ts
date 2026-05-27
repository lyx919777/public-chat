import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: '服务器未配置 OpenAI API 密钥' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 配置 OpenAI 客户端，支持自定义 baseURL
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL,
    });

    const model = openai(process.env.OPENAI_MODEL || 'gpt-4o-mini');

    const { text } = await generateText({
      model,
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: process.env.OPENAI_SYSTEM_PROMPT || '你是一个友好、专业的 AI 助手。请用简洁明了的中文回答用户的问题。',
    });

    return Response.json({ message: { role: 'assistant', content: text } });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: '处理请求时发生错误' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
