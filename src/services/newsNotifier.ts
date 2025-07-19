// server/src/services/newsNotice.ts
import { newsService } from './newsService';
import { conversationsService } from './conversations.service';
import cron from 'node-cron';

const CURRENT_CONVERSATION_ID = '686e321255d10cb600230195'; // 替换为动态值或配置
const USER_ID = '6864d1ec34c44422580deecc';
const EXPERIMENT_ID = '6864d778a1d7fae6443e44c5';

console.log('[News Notifier] Searching ✅');
/**
 * 主动发送新闻提醒（按主题）
 */
export async function sendNewsNotice(topic: string = 'seattle') {
  try {
    const headlines = await newsService.getTopHeadlines(topic);

    if (headlines.length === 0) {
      console.log(`[News Notifier] No headlines found for topic: ${topic}`);
      return;
    }

    const message = {
      role: 'assistant',
      content: `📰 Here are today's top stories about *${topic}*:\n\n${headlines.join('\n')}`,
    };

    await conversationsService.message(message, CURRENT_CONVERSATION_ID);

    console.log(`[News Notifier] Sent news reminder for topic: ${topic} 🗞️`);
  } catch (err) {
    console.error('[News Notifier] Failed to fetch news:', err.message);
  }
}

cron.schedule('*/2 * * * *', () => {
    console.log('[News Notifier] Checking News...');
  sendNewsNotice('seattle'); // 每天早上 9 点推送 Seattle 新闻
  sendNewsNotice('politics'); // 或推送政治新闻
});