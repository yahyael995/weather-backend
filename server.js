// D:\weather-backend\server.js (Final, Robust Version)
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Render sets the PORT environment variable.
const port = process.env.PORT || 3001;

app.use(cors());

app.get('/weather', async (req, res) => {
  const { city, lat, lon, units = 'celsius' } = req.query;

  let latitude, longitude, locationName, countryName;

  try {
    // --- Geocoding Logic ---
    // This block determines the latitude and longitude.
    if (city) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city )}&count=1&language=en&format=json`;
      const geoRes = await axios.get(geoUrl);

      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      const cityData = geoRes.data.results[0];
      latitude = cityData.latitude;
      longitude = cityData.longitude;
      locationName = cityData.name;
      countryName = cityData.country;

    } else if (lat && lon) {
      // Use Open-Meteo's reverse geocoding for consistency
      const reverseGeoUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
      const geoRes = await axios.get(reverseGeoUrl );
      
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
         // Fallback if reverse geocoding fails
        locationName = `Lat: ${parseFloat(lat).toFixed(2)}`;
        countryName = `Lon: ${parseFloat(lon).toFixed(2)}`;
      } else {
        const cityData = geoRes.data.results[0];
        locationName = cityData.name;
        countryName = cityData.country;
      }
      latitude = lat;
      longitude = lon;

    } else {
      return res.status(400).json({ error: 'City or coordinates are required' });
    }

    // --- Weather Fetching Logic ---
    const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,weather_code,is_day,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`;
    
    const weatherRes = await axios.get(weatherUrl );

    const responseData = {
      location: { name: locationName, country: countryName },
      current: weatherRes.data.current,
      hourly: weatherRes.data.hourly,
      daily: weatherRes.data.daily,
    };

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
  console.log(`✅ Backend server is running on port ${port}`);
});
