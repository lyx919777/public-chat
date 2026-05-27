import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    model: process.env.OPENAI_MODEL || '未配置',
    baseUrl: process.env.OPENAI_BASE_URL || '未配置',
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
}