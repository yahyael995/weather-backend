// server.js (النسخة النهائية مع CORS)

const express = require('express');
const axios = require('axios');
const cors = require('cors'); // <-- هذا السطر مهم

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // <-- وهذا السطر مهم

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon, unit } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        temperature_unit: unit || 'celsius',
      },
    } );
    res.json(weatherResponse.data);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
