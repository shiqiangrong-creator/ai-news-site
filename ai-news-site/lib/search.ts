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
  private index: FlexSearch.Document<SearchableArticle, string[]>;

  constructor() {
    this.index = new FlexSearch.Document<SearchableArticle, string[]>({
      document: {
        id: 'id',
        index: ['title', 'summary', 'aiSummary', 'content', 'source'],
        store: true,
      },
      tokenize: 'forward',
      resolution: 9,
    });
  }

  addArticles(articles: SearchableArticle[]) {
    articles.forEach(article => {
      this.index.add(article);
    });
  }

  search(query: string, limit: number = 50): SearchableArticle[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.index.search(query, {
      limit,
      enrich: true,
    });

    // 合并所有搜索结果并去重
    const seen = new Set<string>();
    const merged: SearchableArticle[] = [];

    for (const fieldResult of results) {
      for (const item of fieldResult.result) {
        const doc = item.doc as SearchableArticle;
        if (doc && !seen.has(doc.id)) {
          seen.add(doc.id);
          merged.push(doc);
        }
      }
    }

    return merged;
  }

  clear() {
    this.index = new FlexSearch.Document<SearchableArticle, string[]>({
      document: {
        id: 'id',
        index: ['title', 'summary', 'aiSummary', 'content', 'source'],
        store: true,
      },
      tokenize: 'forward',
      resolution: 9,
    });
  }
}
