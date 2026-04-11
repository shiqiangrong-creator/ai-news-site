import ArticleList from '@/components/ArticleList';
import { fetchAllNews } from '@/lib/rss';

// 生成静态页面参数
export const dynamic = 'force-static';
export const revalidate = 21600; // 每6小时重新生成

async function getArticles() {
  try {
    const articles = await fetchAllNews();
    return articles;
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
}

export default async function Home() {
  const articles = await getArticles();

  return (
    <main>
      <ArticleList initialArticles={articles} />
    </main>
  );
}
