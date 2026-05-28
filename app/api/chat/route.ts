export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages, model: clientModel } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: '消息格式无效' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: '服务器未配置 OpenAI API 密钥' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    // 多模型支持：OPENAI_MODEL 可填逗号分隔列表，客户端可指定
    const envModels = (process.env.OPENAI_MODEL || 'gpt-4o-mini').split(',').map(s => s.trim()).filter(Boolean);
    const model = clientModel || envModels[0];
    const systemPrompt = process.env.OPENAI_SYSTEM_PROMPT || '你是一个友好、专业的 AI 助手。请用简洁明了的中文回答用户的问题。';

    console.log('Chat API - Model:', model);
    console.log('Chat API - BaseURL:', baseURL);
    console.log('Chat API - Messages count:', messages.length);

    // 构建流式聊天完成请求
    const payload = {
      model,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: Message) => {
return { role: msg.role, content: msg.content };
        }),
      ],
    };

    console.log('Chat API - Calling (stream):', `${baseURL}/chat/completions`);

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error response:', response.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'API 请求失败',
          details: errorText,
          status: response.status
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 直接转发流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: '处理请求时发生错误',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
