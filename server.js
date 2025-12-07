// D:\weather-backend\server.js (The final, 100% correct version)

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https' );
const selfSigned = require('self-signed');

const app = express();
const port = 3001;

app.use(cors());

app.get('/weather', async (req, res) => {
  const { city, lat, lon, units = 'celsius' } = req.query;

  let latitude, longitude, locationName, countryName;

  try {
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

    } else if (lat && lon) {
      latitude = lat;
      longitude = lon;
      const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const geoRes = await axios.get(geoUrl );
      locationName = geoRes.data.city || `Lat: ${parseFloat(lat).toFixed(2)}`;
      countryName = geoRes.data.countryName || `Lon: ${parseFloat(lon).toFixed(2)}`;

    } else {
      return res.status(400).json({ error: 'City or coordinates are required' });
    }

    const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode,windspeed_10m&hourly=temperature_2m,apparent_temperature,weathercode,is_day,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`;

    
    const weatherRes = await axios.get(weatherUrl );

    const responseData = {
      location: { name: locationName, country: countryName },
      current: weatherRes.data.current,
      hourly: weatherRes.data.hourly,
      daily: weatherRes.data.daily,
    };

    res.json(responseData);

  } catch (error) {
    console.error('Backend Error:', error.message);
    if (error.response) {
        console.error('External API Response:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

const pems = selfSigned.generate(
  null,
  {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
    clientCertificate: true,
    extensions: [{ name: 'commonName', value: 'localhost' }]
  }
);

https.createServer({
  key: pems.private,
  cert: pems.cert,
}, app ).listen(port, () => {
  console.log(`✅ Backend server is running on https://localhost:${port}` );
});
