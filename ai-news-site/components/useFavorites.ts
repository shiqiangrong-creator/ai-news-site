'use client';

import { useState, useEffect } from 'react';
import type { Article } from '@/lib/rss';

const STORAGE_KEY = 'ai-news-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('读取收藏失败:', error);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('保存收藏失败:', error);
      }
    }
  }, [favorites, mounted]);

  const toggleFavorite = (article: Article) => {
    setFavorites((prev) => {
      const isExists = prev.some((a) => a.id === article.id);
      if (isExists) {
        return prev.filter((a) => a.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  const isFavorited = (articleId: string) => {
    return favorites.some((a) => a.id === articleId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    clearFavorites,
  };
}
