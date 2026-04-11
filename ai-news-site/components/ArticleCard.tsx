import type { Article } from '@/lib/rss';

interface ArticleCardProps {
  article: Article;
  isFavorited: boolean;
  onToggleFavorite: (article: Article) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins <= 1 ? '刚刚' : `${diffMins}分钟前`;
  }
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }
  if (diffHours < 48) {
    return '昨天';
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function ArticleCard({ article, isFavorited, onToggleFavorite }: ArticleCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(article);
  };

  return (
    <article className="article-card">
      <div className="article-header">
        <span className={`source-tag source-${article.source === '量子位' ? 'qb' : 'jqzx'}`}>
          {article.source}
        </span>
        <span className="article-time">{formatDate(article.pubDate)}</span>
      </div>
      
      <h3 className="article-title">
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>
      
      {article.aiSummary && (
        <p className="ai-summary">
          <span className="ai-badge">AI摘要</span>
          {article.aiSummary}
        </p>
      )}
      
      <p className="article-summary">
        {article.summary.slice(0, 150)}
        {article.summary.length > 150 ? '...' : ''}
      </p>
      
      <div className="article-footer">
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="read-more"
        >
          阅读原文 →
        </a>
        <button 
          onClick={handleFavoriteClick}
          className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
          aria-label={isFavorited ? '取消收藏' : '收藏'}
        >
          {isFavorited ? '★' : '☆'}
        </button>
      </div>
    </article>
  );
}
