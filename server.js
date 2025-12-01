// D:\weather-react\weather-backend\server.js (The ABSOLUTE FINAL, CORRECTED version)

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

app.get('/weather', async (req, res) => {
  const { city, units = 'celsius' } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
    const geoRes = await axios.get(geoUrl );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { latitude, longitude, name, country } = geoRes.data.results[0];
    const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherUrl = `https://api.open-meteo.com/v1/forecast`;
    
    const weatherRes = await axios.get(weatherUrl, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode,windspeed_10m',
        // THIS IS THE CORRECTED PART: ',time' has been removed from hourly and daily
        hourly: 'temperature_2m,apparent_temperature,weathercode,is_day,precipitation_probability',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        temperature_unit: tempUnit,
      }
    } );

    // The API returns 'time' for current weather, so we can use it directly.
    const currentWeatherData = weatherRes.data.current;

    const responseData = {
      location: { name, country },
      current: currentWeatherData,
      hourly: weatherRes.data.hourly,
      daily: weatherRes.data.daily,
    };

    res.json(responseData);

  } catch (error) {
    console.error('Backend Error:', error.message);
    if (error.response) {
        console.error('API Error Data:', error.response.data);
        return res.status(error.response.status).json({ error: error.response.data.reason || 'Error from external API' });
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend server is running on http://localhost:${port}` );
});
