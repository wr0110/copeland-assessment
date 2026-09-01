export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    baseUrl: process.env.OPENWEATHER_BASE_URL ?? 'https://api.openweathermap.org',
    units: process.env.OPENWEATHER_UNITS ?? 'metric',
  },
});
