// server/src/services/newsService.ts
import axios from 'axios';

const NEWS_API_KEY = 'ca6e656e0fa24514a4a74e07c7a7b752';
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

export const newsService = {
  /**
   * 获取指定主题的头条新闻
   * @param topic 如 'politics', 'technology', 'seattle'
   * @param country 国家代码，如 'us'
   */
  async getTopHeadlines(topic: string, country: string = 'us'): Promise<string[]> {
    const res = await axios.get(NEWS_API_URL, {
      params: {
        q: topic,
        language: 'en',
        country,
        apiKey: NEWS_API_KEY,
        pageSize: 3,
      },
    });

    if (!res.data.articles.length) return [];

    return res.data.articles.map((article) => {
      return `• ${article.title} (${article.source.name})`;
    });
  },
};
