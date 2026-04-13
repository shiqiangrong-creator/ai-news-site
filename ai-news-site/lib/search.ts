'use client';

import FlexSearch from 'flexsearch';

export interface SearchableArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  aiSummary?: string;
  content?: string;
}

export class ArticleSearch {
  private index: FlexSearch.Document<SearchableArticle>;
  private articles: Map<string, SearchableArticle> = new Map();

  constructor() {
    this.index = new FlexSearch.Document<SearchableArticle>({
      document: {
        id: 'id',
        index: ['title', 'summary', 'aiSummary', 'content', 'source'],
      },
      tokenize: 'forward',
      resolution: 9,
    });
  }

  addArticles(articles: SearchableArticle[]) {
    articles.forEach(article => {
      this.index.add(article);
      this.articles.set(article.id, article);
    });
  }

  search(query: string, limit: number = 50): SearchableArticle[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.index.search(query, { limit });

    // 合并所有搜索结果并去重
    const seen = new Set<string>();
    const merged: SearchableArticle[] = [];

    for (const fieldResult of results) {
      for (const id of fieldResult.result) {
        const doc = this.articles.get(id as string);
        if (doc && !seen.has(doc.id)) {
          seen.add(doc.id);
          merged.push(doc);
        }
      }
    }

    return merged;
  }

  clear() {
    this.index = new FlexSearch.Document<SearchableArticle>({
      document: {
        id: 'id',
        index: ['title', 'summary', 'aiSummary', 'content', 'source'],
      },
      tokenize: 'forward',
      resolution: 9,
    });
    this.articles.clear();
  }
}
