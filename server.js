// D:\weather-backend\server.js (The 100% Correct and Final Production Version)
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.get('/weather', async (req, res) => {
  // We read city, lat, lon, and units from the request query
  const { city, lat, lon, units = 'celsius' } = req.query;

  try {
    let latitude, longitude;

    // --- BLOCK 1: Get Coordinates ---
    // If a city is provided, we use the geocoding API to get its coordinates.
    if (city) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city )}&count=1&language=en&format=json`;
      const geoRes = await axios.get(geoUrl);

      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      latitude = geoRes.data.results[0].latitude;
      longitude = geoRes.data.results[0].longitude;
    
    // If lat and lon are provided directly, we use them.
    } else if (lat && lon) {
      latitude = lat;
      longitude = lon;
    
    // If neither is provided, it's a bad request.
    } else {
      return res.status(400).json({ error: 'City or coordinates are required' });
    }

    // --- BLOCK 2: Get Weather Data using the coordinates from Block 1 ---
    const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,weather_code,is_day,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`;
    
    const weatherRes = await axios.get(weatherUrl );

    // --- BLOCK 3: Get Location Name (Reverse Geocoding) ---
    // We do this last. We use the definitive coordinates to find the location name.
    const reverseGeoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const reverseGeoRes = await axios.get(reverseGeoUrl );
    
    const locationName = reverseGeoRes.data.city || `Lat: ${parseFloat(latitude).toFixed(2)}`;
    const countryName = reverseGeoRes.data.countryName || `Lon: ${parseFloat(longitude).toFixed(2)}`;

    // --- BLOCK 4: Combine and Send Response ---
    const responseData = {
      location: { name: locationName, country: countryName },
      current: weatherRes.data.current,
      hourly: weatherRes.data.hourly,
      daily: weatherRes.data.daily,
    };

    res.json(responseData);

  } catch (error) {
    // This is our excellent error logging block
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
  console.log(`✅ Backend server is running on port ${port}`);
});
