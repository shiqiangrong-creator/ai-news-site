import Parser from 'rss-parser';

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: '量子位' | '机器之心';
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
      source: '量子位' as const,
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('量子位RSS获取失败:', error);
    return [];
  }
}

export async function fetchJiQiZhiXin(): Promise<Article[]> {
  try {
    const feed = await parser.parseURL('https://rsshub.app/jiqizhixin');
    return feed.items.map((item) => ({
      id: `jqzx-${Buffer.from(item.link || item.title || Date.now().toString()).toString('base64').slice(0, 20)}`,
      title: item.title || '无标题',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: '机器之心' as const,
      summary: item.contentSnippet || item.description || '',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('机器之心RSS获取失败:', error);
    return [];
  }
}

export async function fetchAllNews(): Promise<Article[]> {
  const [quantumBit, jiQiZhiXin] = await Promise.all([
    fetchQuantumBit(),
    fetchJiQiZhiXin(),
  ]);

  const allArticles = [...quantumBit, ...jiQiZhiXin];
  
  // 按时间排序，最新的在前
  allArticles.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return allArticles;
}
