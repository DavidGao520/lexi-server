import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!WEATHER_API_KEY) {
  throw new Error('Missing OPENWEATHER_API_KEY in environment variables.');
}

// 基础 URL
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export const weatherService = {
  /**
   * 获取当前天气信息
   * @param city 城市名称，默认为 Seattle
   * @returns { weather: string, temp: number }
   */
  async getCurrentWeather(city = 'Seattle') {
    const res = await axios.get(WEATHER_BASE_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric', // 摄氏度
      },
    });

    const weather = res.data.weather[0].description;
    const temp = res.data.main.temp;

    return { weather, temp };
  },

    /**
 * 获取 UV 指数（默认城市为 Seattle）
 */
async getUVIndex(city = 'Seattle'): Promise<number> {
  const { lat, lon } = await this.getCityCoordinates(city);

  const res = await axios.get(`https://api.openweathermap.org/data/2.5/uvi`, {
    params: {
      lat,
      lon,
      appid: WEATHER_API_KEY,
    },
  });

  return res.data.value; // 直接返回 UV Index 数值（如 6.75）
},

  /**
   * 获取当前空气质量（估算为美国 AQI 值）
   * @param city 城市名称，默认为 Seattle
   * @returns AQI 数值
   */
  async getCurrentAirQuality(city = 'Seattle'): Promise<number> {
    const { lat, lon } = await this.getCityCoordinates(city);

    const res = await axios.get(AIR_POLLUTION_URL, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
      },
    });

    const aqiLevel = res.data.list[0].main.aqi;
    return this.mapOpenWeatherAqiToUS(aqiLevel);
  },
    
  /**
   * 获取城市的坐标（经纬度）
   */
  async getCityCoordinates(city: string): Promise<{ lat: number; lon: number }> {
    const res = await axios.get(GEO_URL, {
      params: {
        q: city,
        limit: 1,
        appid: WEATHER_API_KEY,
      },
    });

    const data = res.data[0];
    return { lat: data.lat, lon: data.lon };
  },

  /**
   * 将 OpenWeather AQI 等级（1-5）映射为美国标准 AQI 数值
   */
  mapOpenWeatherAqiToUS(level: number): number {
    switch (level) {
      case 1: return 30;   // Good
      case 2: return 70;   // Fair
      case 3: return 110;  // Moderate
      case 4: return 160;  // Poor
      case 5: return 210;  // Very Poor
      default: return 100;
    }
  },
};
