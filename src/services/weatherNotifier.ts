import cron from 'node-cron';
import { weatherService } from './weatherService';
import { conversationsService } from './conversations.service';

const USER_ID = '6864d1ec34c44422580deecc';
const EXPERIMENT_ID = '6864d778a1d7fae6443e44c5';

console.log('[Weather Notifier] Service Loading ✅');
// 通知逻辑
async function checkWeatherAndNotify() {
  try {
    const { weather, temp } = await weatherService.getCurrentWeather('Seattle');

    console.log(`[Weather Notifier] Temp: ${temp}°C, Weather: ${weather}`);

    if (temp < 22) {
      const message = {
        role: 'assistant',
        content: `提醒你，现在外面只有 ${temp}°C，需要保暖。`,
      };

      const conversationId = '686e321255d10cb600230195';

      await conversationsService.message(message, conversationId);

      console.log('[Weather Notifier] Cold Warning 🚨');
    } else {
      console.log('[Weather Notifier] Normal temperature ✅');
    }
  } catch (error) {
    console.error('[Weather Notifier] 检查天气时出错:', error.message);
  }
}

async function checkAirQualityAndNotify() {
  try {
    const aqi = await weatherService.getCurrentAirQuality('Seattle'); // 你要先实现这个函数

    console.log(`[Air Notifier] 当前 AQI: ${aqi}`);

    if (aqi >= 100) {
      const message = {
        role: 'assistant',
        content: `当前空气质量指数为 ${aqi}，已达不健康水平，建议佩戴口罩并减少户外活动 😷。`,
      };

      const conversationId = '686e321255d10cb600230195';
      await conversationsService.message(message, conversationId);

      console.log('[Air Notifier] Air Quality Sent 🚨');
    } else {
      console.log('[Air Notifier] Good Air Quality, go breath some air outside ✅');
    }
  } catch (error) {
    console.error('[Air Notifier] 获取空气质量失败:', error.message);
  }
}

async function checkUVAndNotify() {
  try {
    const uvIndex = await weatherService.getUVIndex('Seattle');

    console.log(`[UV Notifier] Today Max UV Index: ${uvIndex}`);

    if (uvIndex >= 6) {
      const level = uvIndex >= 11
        ? 'extreme'
        : uvIndex >= 8
        ? 'very high'
        : 'high';

      const message = {
        role: 'assistant',
        content: `🌞 The UV Index is ${uvIndex.toFixed(1)} (${level}). Please protect yourself: wear sunscreen, a hat, and sunglasses if you're heading out 🧴🧢😎.`,
      };

      const conversationId = '686e321255d10cb600230195';
      await conversationsService.message(message, conversationId);

      console.log('[UV Notifier] UV alert sent 🌞');
    } else {
      console.log('[UV Notifier] UV level is safe, no alert needed ✅');
    }
  } catch (error) {
    console.error('[UV Notifier] Failed to check UV index:', error.message);
  }
}

// 每3分钟执行一次
cron.schedule('*/20 * * * *', () => {
  console.log('[Weather Notifier] Checking Weather...');
  checkWeatherAndNotify();
  checkAirQualityAndNotify();
  checkUVAndNotify();
});
