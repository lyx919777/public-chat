import { NextResponse } from 'next/server';

export async function GET() {
  // 检查环境变量是否存在
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const apiKeyPrefix = process.env.OPENAI_API_KEY 
    ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' 
    : '未配置';
  
  return NextResponse.json({
    model: process.env.OPENAI_MODEL || '未配置',
    baseUrl: process.env.OPENAI_BASE_URL || '未配置',
    hasApiKey,
    apiKeyPrefix,
    // 添加调试信息
    envKeys: Object.keys(process.env).filter(key => 
      key.startsWith('OPENAI_') || key.startsWith('NEXT_')
    )
  });
}