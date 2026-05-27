import { NextResponse } from 'next/server';

export async function GET() {
  // 收集环境变量信息（只显示是否配置，不显示值）
  const debugInfo = {
    // OpenAI 相关
    OPENAI_API_KEY: {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0,
      prefix: process.env.OPENAI_API_KEY?.substring(0, 10) || null,
    },
    OPENAI_BASE_URL: {
      exists: !!process.env.OPENAI_BASE_URL,
      value: process.env.OPENAI_BASE_URL || null,
    },
    OPENAI_MODEL: {
      exists: !!process.env.OPENAI_MODEL,
      value: process.env.OPENAI_MODEL || null,
    },
    OPENAI_SYSTEM_PROMPT: {
      exists: !!process.env.OPENAI_SYSTEM_PROMPT,
      length: process.env.OPENAI_SYSTEM_PROMPT?.length || 0,
    },
    // Next.js 相关
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    // 所有环境变量键（前50个）
    allEnvKeys: Object.keys(process.env).slice(0, 50),
    // 测试直接读取
    directRead: {
      apiKey: process.env.OPENAI_API_KEY ? 'EXISTS' : 'MISSING',
      baseUrl: process.env.OPENAI_BASE_URL || 'MISSING',
      model: process.env.OPENAI_MODEL || 'MISSING',
    },
  };

  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
