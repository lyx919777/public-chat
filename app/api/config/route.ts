import { NextResponse } from 'next/server';

export async function GET() {
  // 检查环境变量是否存在
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const apiKeyPrefix = process.env.OPENAI_API_KEY 
    ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' 
    : '未配置';
  
  // 解析多模型：逗号分隔，去空白
  const modelEnv = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const models = modelEnv.split(',').map((s) => s.trim()).filter(Boolean);
  
  return NextResponse.json({
    models,
    defaultModel: models[0] || 'gpt-4o-mini',
    baseUrl: process.env.OPENAI_BASE_URL || '未配置',
    hasApiKey,
    apiKeyPrefix,
    // 添加调试信息
    envKeys: Object.keys(process.env).filter(key => 
      key.startsWith('OPENAI_') || key.startsWith('NEXT_')
    )
  });
}