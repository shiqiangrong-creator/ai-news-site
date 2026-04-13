import Parser from 'rss-parser';

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary: string;
  aiSummary?: string;
  content?: string;
}

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description'],
  },
});

export async function fetchQuantumBit(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://www.qbitai.com/feed');
    return feed.items.map((item) => ({
      id: `qb-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: '量子位',
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('量子位RSS获取失败:', error);
    return [];
  }
}

export async function fetchOpenAI(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://openai.com/news/rss.xml');
    return feed.items.slice(0, 20).map((item) => ({
      id: `openai-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: 'OpenAI',
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('OpenAI RSS获取失败:', error);
    return [];
  }
}

export async function fetchDeepMind(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://deepmind.google/blog/rss.xml');
    return feed.items.slice(0, 20).map((item) => ({
      id: `dm-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: 'DeepMind',
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('DeepMind RSS获取失败:', error);
    return [];
  }
}

export async function fetchTechCrunch(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://techcrunch.com/feed/');
    // 过滤AI相关文章
    return feed.items
      .filter(item => {
        const text = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
        return text.includes('ai') || text.includes('artificial intelligence') || 
               text.includes('machine learning') || text.includes('gpt') ||
               text.includes('llm') || text.includes('openai') || text.includes('deepmind');
      })
      .slice(0, 15)
      .map((item) => ({
        id: `tc-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
        title: item.title || '无标题',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'TechCrunch',
        summary: item.contentSnippet || item.description || '',
        content: item['content:encoded'] || item.content || item.contentSnippet || '',
      }));
  } catch (error) {
    console.error('TechCrunch RSS获取失败:', error);
    return [];
  }
}

export async function fetchMITTechReview(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://www.technologyreview.com/feed/');
    return feed.items.slice(0, 15).map((item) => ({
      id: `mit-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: 'MIT Tech Review',
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('MIT Tech Review RSS获取失败:', error);
    return [];
  }
}

export async function fetchAIBase(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://www.aibase.com/rss');
    return feed.items.slice(0, 20).map((item) => ({
      id: `aibase-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: 'AIbase',
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('AIbase RSS获取失败:', error);
    return [];
  }
}

export async function fetchInfoQAI(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://ai.infoq.cn/feed');
    return feed.items.slice(0, 20).map((item) => ({
      id: `infoq-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: 'InfoQ AI',
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('InfoQ AI RSS获取失败:', error);
    return [];
  }
}

export async function fetchAllNews(): Promise<Article[]> {
  const [quantumBit, openai, deepmind, techcrunch, mit, aibase, infoq] = await Promise.all([
    fetchQuantumBit(),
    fetchOpenAI(),
    fetchDeepMind(),
    fetchTechCrunch(),
    fetchMITTechReview(),
    fetchAIBase(),
    fetchInfoQAI(),
  ]);

  const allArticles = [...quantumBit, ...openai, ...deepmind, ...techcrunch, ...mit, ...aibase, ...infoq];
  
  // 按时间排序，最新的在前
  allArticles.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return allArticles;
}
