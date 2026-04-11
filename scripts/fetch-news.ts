/**
 * 新闻抓取脚本
 * 用于 GitHub Actions 定时任务
 * 使用方法: npx ts-node scripts/fetch-news.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';

// 类型定义
interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: '量子位' | '机器之心';
  summary: string;
  aiSummary?: string;
  content?: string;
}

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 获取 DeepSeek API Key
function getApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }
  return apiKey;
}

// 生成唯一ID
function generateId(prefix: string, content: string): string {
  return `${prefix}-${Buffer.from(content).toString('base64').slice(0, 20)}`;
}

// 格式化日期
function formatDate(date: Date): string {
  return date.toISOString();
}

// RSS 解析器
const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description'],
  },
});

// 获取量子位文章
async function fetchQuantumBit(): Promise<Article[]> {
  console.log('📡 正在获取量子位 RSS...');
  try {
    const feed = await parser.parseURL('https://www.qbitai.com/feed');
    const articles: Article[] = feed.items.slice(0, 30).map((item) => ({
      id: generateId('qb', item.link || item.title || Date.now().toString()),
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || formatDate(new Date()),
      source: '量子位' as const,
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
    console.log(`✅ 获取到 ${articles.length} 篇量子位文章`);
    return articles;
  } catch (error) {
    console.error('❌ 量子位 RSS 获取失败:', error);
    return [];
  }
}

// 获取机器之心文章
async function fetchJiQiZhiXin(): Promise<Article[]> {
  console.log('📡 正在获取机器之心 RSS...');
  try {
    const feed = await parser.parseURL('https://rsshub.app/jiqizhixin');
    const articles: Article[] = feed.items.slice(0, 30).map((item) => ({
      id: generateId('jqzx', item.link || item.title || Date.now().toString()),
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || formatDate(new Date()),
      source: '机器之心' as const,
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
    console.log(`✅ 获取到 ${articles.length} 篇机器之心文章`);
    return articles;
  } catch (error) {
    console.error('❌ 机器之心 RSS 获取失败:', error);
    return [];
  }
}

// 调用 DeepSeek API 生成摘要
async function generateSummary(
  title: string,
  content: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个AI资讯摘要助手。请根据以下文章内容，生成一段不超过100字的中文摘要，简洁概括文章的核心内容和亮点。只需要输出摘要内容，不要其他解释。',
          },
          {
            role: 'user',
            content: `文章标题：${title}\n\n文章内容：${content.slice(0, 2000)}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    let summary = data.choices[0]?.message?.content?.trim() || '';
    
    if (summary.length > 100) {
      summary = summary.slice(0, 97) + '...';
    }
    
    return summary;
  } catch (error) {
    console.error('摘要生成失败:', error);
    return '';
  }
}

// 主函数
async function main() {
  console.log('🚀 开始抓取 AI 资讯...\n');

  const startTime = Date.now();
  
  // 获取所有文章
  const [quantumBit, jiQiZhiXin] = await Promise.all([
    fetchQuantumBit(),
    fetchJiQiZhiXin(),
  ]);

  let allArticles = [...quantumBit, ...jiQiZhiXin];
  
  // 按时间排序
  allArticles.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  console.log(`\n📊 共获取 ${allArticles.length} 篇文章\n`);

  // 生成 AI 摘要
  const apiKey = getApiKey();
  console.log('🤖 开始生成 AI 摘要...\n');

  for (let i = 0; i < allArticles.length; i++) {
    const article = allArticles[i];
    try {
      const summary = await generateSummary(
        article.title,
        article.content || article.summary,
        apiKey
      );
      article.aiSummary = summary;
      
      const progress = ((i + 1) / allArticles.length * 100).toFixed(0);
      console.log(`[${progress}%] 已生成: ${article.title.slice(0, 40)}...`);
      
      // 避免 API 频率限制
      if (i < allArticles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (error) {
      console.error(`❌ 文章 "${article.title}" 摘要生成失败`);
    }
  }

  // 保存数据
  const outputPath = path.join(__dirname, '..', 'data', 'articles.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputData = {
    updatedAt: formatDate(new Date()),
    articles: allArticles,
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ 完成！共处理 ${allArticles.length} 篇文章`);
  console.log(`⏱️ 用时: ${elapsed}秒`);
  console.log(`📁 数据已保存到: ${outputPath}`);
}

main().catch(console.error);
