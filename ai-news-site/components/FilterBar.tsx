'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Article } from '@/lib/rss';

interface FilterBarProps {
  articles: Article[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({
  articles,
  selectedSource,
  onSourceChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用 useMemo 确保正确计算
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(article => {
      if (article.source) {
        counts[article.source] = (counts[article.source] || 0) + 1;
      }
    });
    return counts;
  }, [articles]);

  const sources = useMemo(() => {
    return ['全部', ...Object.keys(sourceCounts).sort()];
  }, [sourceCounts]);

  if (!mounted) {
    return <div className="filter-bar" style={{ padding: 20 }}>加载中...</div>;
  }
  
  // 没有文章数据时不显示筛选按钮
  if (articles.length === 0) {
    return (
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索文章标题、内容..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>暂无文章数据</p>
      </div>
    );
  }

  return (
    <div className="filter-bar">
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索文章标题、内容..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="search-clear"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="source-filters">
        {sources.map((source) => {
          const count = source === '全部' 
            ? articles.length 
            : sourceCounts[source] || 0;
          
          return (
            <button
              key={source}
              onClick={() => onSourceChange(source)}
              className={`source-btn ${selectedSource === source ? 'active' : ''}`}
            >
              {source}
              <span className="count">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
