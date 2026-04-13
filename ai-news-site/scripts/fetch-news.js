// 抓取最新AI资讯并生成摘要
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser();

// RSS源配置
const RSS_SOURCES = [
  { name: '量子位', url: 'https://www.qbitai.com/feed', id: 'qb' },
  { name: 'AIbase', url: 'https://www.aibase.com/rss', id: 'aibase' },
  { name: 'InfoQ AI', url: 'https://ai.infoq.cn/feed', id: 'infoq' },
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', id: 'openai' },
  { name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml', id: 'dm' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', id: 'tc' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', id: 'mit' },
];

// DeepSeek API 生成摘要
async function generateAISummary(title, content) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return null;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI资讯编辑，请用中文为以下AI相关文章生成一个简洁的摘要（100字以内）。'
          },
          {
            role: 'user',
            content: `标题：${title}\n\n内容：${content?.slice(0, 1000) || '无内容'}`
          }
        ],
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('AI摘要生成失败:', error.message);
    return null;
  }
}

// 过滤AI相关文章
function isAIRelated(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  const keywords = ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 
                    'gpt', 'llm', 'neural', '人工智能', '机器学习', '深度学习', 
                    '大模型', 'openai', 'deepmind', 'claude', 'gemini'];
  return keywords.some(kw => text.includes(kw));
}

async function fetchAllNews() {
  const allArticles = [];
  
  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在获取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const items = feed.items
        .filter(item => isAIRelated(item.title, item.contentSnippet))
        .slice(0, 15);
      
      for (const item of items) {
        const article = {
          id: `${source.id}-${Buffer.from(item.link || item.title).toString('base64').slice(0, 20)}`,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source: source.name,
          summary: item.contentSnippet?.slice(0, 300) || '',
        };
        
        // 为前5篇生成AI摘要
        if (allArticles.length < 5 && process.env.DEEPSEEK_API_KEY) {
          article.aiSummary = await generateAISummary(item.title, item.contentSnippet);
        }
        
        allArticles.push(article);
      }
      
      console.log(`✓ ${source.name}: ${items.length} 篇文章`);
    } catch (error) {
      console.error(`✗ ${source.name} 获取失败:`, error.message);
    }
  }
  
  // 按时间排序
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  return allArticles;
}

async function main() {
  console.log('开始抓取AI资讯...');
  console.log('时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  
  const articles = await fetchAllNews();
  
  // 保存到数据文件
  const dataPath = path.join(__dirname, '../data/articles.json');
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(articles, null, 2));
  
  console.log(`\n完成! 共抓取 ${articles.length} 篇文章`);
  console.log(`数据已保存到: ${dataPath}`);
}

main().catch(console.error);
