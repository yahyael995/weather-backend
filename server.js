// D:\weather-backend\server.js (The 100% Correct Data Structure Fix)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.WEATHER_API_KEY;

app.use(cors());

app.get('/weather', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key is missing on the server.' });
  }

  const { city, lat, lon } = req.query;
  let queryParam;

  if (city) {
    queryParam = city;
  } else if (lat && lon) {
    queryParam = `${lat},${lon}`;
  } else {
    return res.status(400).json({ error: 'City or coordinates are required' });
  }

  const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${queryParam}&days=7&aqi=no&alerts=no`;

  try {
    const apiResponse = await axios.get(weatherUrl );
    const data = apiResponse.data;

    // --- THE CRITICAL FIX IS HERE ---
    // We need to filter the hourly data to only include hours from the current time onwards.
    const now = new Date();
    const relevantHours = data.forecast.forecastday[0].hour.filter(h => new Date(h.time_epoch * 1000) >= now);

    const responseData = {
      location: {
        name: data.location.name,
        country: data.location.country,
      },
      current: {
        temperature_2m: data.current.temp_c,
        apparent_temperature: data.current.feelslike_c,
        is_day: data.current.is_day,
        weather_code: data.current.condition.code,
        wind_speed_10m: data.current.wind_kph,
      },
      hourly: {
        // We now use the filtered 'relevantHours' array
        time: relevantHours.map(h => h.time),
        temperature_2m: relevantHours.map(h => h.temp_c),
        weather_code: relevantHours.map(h => h.condition.code),
        is_day: relevantHours.map(h => h.is_day),
        precipitation_probability: relevantHours.map(h => h.chance_of_rain),
      },
      daily: {
        time: data.forecast.forecastday.map(d => d.date),
        temperature_2m_max: data.forecast.forecastday.map(d => d.day.maxtemp_c),
        temperature_2m_min: data.forecast.forecastday.map(d => d.day.mintemp_c),
        weather_code: data.forecast.forecastday.map(d => d.day.condition.code),
      },
    };
    // --- END OF CRITICAL FIX ---

    res.json(responseData);

  } catch (error) {
    console.error("--- BACKEND ERROR ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("External API Status:", error.response.status);
      console.error("External API Data:", error.response.data);
    }
    console.error("--- END OF ERROR ---");
    res.status(500).json({ error: 'Failed to fetch data from external API.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend server is running on port ${port} with WeatherAPI.com`);
});
