// D:\weather-backend\server.js (النسخة النهائية مع إصلاح كل الأخطاء الإملائية)

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Weather Backend is running!');
});

app.get('/weather', async (req, res) => {
  const { city, lat, lon, units = 'celsius' } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'City or coordinates are required' });
  }

  try {
    let latitude, longitude, locationName, countryName;

    if (city) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
      const geoRes = await axios.get(geoUrl );
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      const cityData = geoRes.data.results[0];
      latitude = cityData.latitude;
      longitude = cityData.longitude;
      locationName = cityData.name;
      countryName = cityData.country;
    } else {
      latitude = lat;
      longitude = lon;
      const reverseGeoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const reverseGeoRes = await axios.get(reverseGeoUrl );
      locationName = reverseGeoRes.data.city || `Lat: ${parseFloat(lat).toFixed(2)}`;
      countryName = reverseGeoRes.data.countryName || `Lon: ${parseFloat(lon).toFixed(2)}`;
    }

    const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    
    // --- هذا هو السطر الذي تم إصلاحه بالكامل ---
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weathercode,wind_speed_10m&hourly=temperature_2m,apparent_temperature,weathercode,is_day,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`;
    
    const weatherRes = await axios.get(weatherUrl );

    res.json({
      location: { name: locationName, country: countryName },
      current: weatherRes.data.current,
      hourly: weatherRes.data.hourly,
      daily: weatherRes.data.daily,
    });

  } catch (error) {
    console.error('Backend Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
