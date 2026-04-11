const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateAISummary(
  title: string,
  content: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个AI资讯摘要助手。请根据以下文章内容，生成一段不超过100字的中文摘要，简洁概括文章的核心内容和亮点。只需要输出摘要内容，不要其他解释。',
          },
          {
            role: 'user',
            content: `文章标题：${title}\n\n文章内容：${content.slice(0, 2000)}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data: DeepSeekResponse = await response.json();
    const summary = data.choices[0]?.message?.content?.trim() || '';
    
    // 确保摘要不超过100字
    if (summary.length > 100) {
      return summary.slice(0, 97) + '...';
    }
    
    return summary;
  } catch (error) {
    console.error('AI摘要生成失败:', error);
    return '';
  }
}

export async function generateSummariesBatch(
  articles: Array<{ id: string; title: string; content: string }>,
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const total = articles.length;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    try {
      const summary = await generateAISummary(
        article.title,
        article.content,
        apiKey
      );
      results.set(article.id, summary);
      console.log(`[${i + 1}/${total}] 已生成摘要: ${article.title.slice(0, 30)}...`);
    } catch (error) {
      console.error(`文章 "${article.title}" 摘要生成失败:`, error);
      results.set(article.id, '');
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }

    // 避免API频率限制
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
