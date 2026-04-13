'use client';

import { useState, useMemo } from 'react';
import type { Article } from '@/lib/rss';
import ArticleCard from './ArticleCard';
import FilterBar from './FilterBar';
import { useFavorites } from './useFavorites';
import { ArticleSearch } from '@/lib/search';

interface ArticleListProps {
  initialArticles: Article[];
}

export default function ArticleList({ initialArticles }: ArticleListProps) {
  const [articles] = useState<Article[]>(initialArticles);
  const [selectedSource, setSelectedSource] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites, toggleFavorite, isFavorited, clearFavorites } = useFavorites();

  // 使用 useMemo 优化搜索
  const searchEngine = useMemo(() => {
    const engine = new ArticleSearch();
    engine.addArticles(articles);
    return engine;
  }, [articles]);

  // 根据筛选条件获取文章
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // 来源筛选
    if (selectedSource !== '全部') {
      filtered = filtered.filter((a) => a.source === selectedSource);
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const searchResults = searchEngine.search(searchQuery);
      const searchIds = new Set(searchResults.map((r) => r.id));
      filtered = filtered.filter((a) => searchIds.has(a.id));
    }

    return filtered;
  }, [articles, selectedSource, searchQuery, searchEngine]);

  const displayedArticles = showFavorites ? favorites : filteredArticles;

  return (
    <div className="container">
      <header className="header">
        <h1 className="site-title">
          <span className="title-icon">🤖</span>
          AI 资讯聚合
        </h1>
        <p className="site-subtitle">汇聚量子位、AIbase、InfoQ等优质AI资讯源</p>
      </header>

      <FilterBar
        articles={articles}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="list-header">
        <div className="tabs">
          <button
            onClick={() => setShowFavorites(false)}
            className={`tab ${!showFavorites ? 'active' : ''}`}
          >
            全部文章 ({filteredArticles.length})
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className={`tab ${showFavorites ? 'active' : ''}`}
          >
            我的收藏 ({favorites.length})
          </button>
        </div>
        
        {showFavorites && favorites.length > 0 && (
          <button onClick={clearFavorites} className="clear-btn">
            清空收藏
          </button>
        )}
      </div>

      {displayedArticles.length === 0 ? (
        <div className="empty-state">
          {showFavorites ? (
            <>
              <span className="empty-icon">☆</span>
              <p>暂无收藏文章</p>
              <p className="empty-hint">点击文章卡片上的 ☆ 即可收藏</p>
            </>
          ) : (
            <>
              <span className="empty-icon">🔍</span>
              <p>没有找到相关文章</p>
              <p className="empty-hint">尝试调整搜索关键词或筛选条件</p>
            </>
          )}
        </div>
      ) : (
        <div className="article-list">
          {displayedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isFavorited={isFavorited(article.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <footer className="footer">
        <p>数据来源：量子位 · AIbase · InfoQ AI · OpenAI · DeepMind · TechCrunch · MIT Tech Review</p>
        <p>由 DeepSeek AI 提供摘要支持 | 最后更新：{new Date().toLocaleString('zh-CN')}</p>
      </footer>
    </div>
  );
}
