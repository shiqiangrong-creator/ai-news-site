'use client';

import { useState, useEffect } from 'react';
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

  // 计算各来源的文章数量
  const sourceCounts = articles.reduce((acc, article) => {
    acc[article.source] = (acc[article.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sources = ['全部', ...Object.keys(sourceCounts).sort()];

  if (!mounted) {
    return null;
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
