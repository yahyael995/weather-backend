// D:\weather-backend\server.js (النسخة النهائية مع التوثيق)

// --- 1. استيراد المكتبات الأساسية ---
const express = require('express'); // لإدارة الخادم والمسارات (Routes)
const axios = require('axios');   // لإجراء طلبات HTTP لجلب البيانات من واجهات برمجة التطبيقات الخارجية
const cors = require('cors');     // للسماح للواجهة الأمامية (من نطاق مختلف) بالتحدث مع هذا الخادم

// --- 2. إعداد الخادم ---
const app = express();
const PORT = process.env.PORT || 3001; // استخدم المنفذ الذي يوفره Render، أو 3001 محليًا

// --- 3. تفعيل CORS ---
// هذا السطر يسمح لتطبيق Vercel (أو أي تطبيق آخر) بطلب البيانات من هذا الخادم
app.use(cors());

// --- 4. مسار افتراضي للتحقق من أن الخادم يعمل ---
app.get('/', (req, res) => {
  res.send('✅ Weather Backend is running!');
});

// --- 5. المسار الرئيسي لجلب بيانات الطقس ---
app.get('/weather', async (req, res) => {
  // استخراج البيانات من رابط الطلب (Query Parameters)
  const { city, lat, lon, units = 'celsius' } = req.query;

  // التحقق من وجود بيانات كافية (إما مدينة أو إحداثيات)
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'City or coordinates are required' });
  }

  try {
    let latitude, longitude, locationName, countryName;

    // --- الجزء أ: تحديد الإحداثيات واسم الموقع ---
    if (city) {
      // إذا تم توفير اسم مدينة، استخدم واجهة Geocoding لتحويله إلى إحداثيات
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
      // إذا تم توفير إحداثيات، استخدم واجهة Reverse Geocoding لتحويلها إلى اسم مدينة
      latitude = lat;
      longitude = lon;
      const reverseGeoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const reverseGeoRes = await axios.get(reverseGeoUrl );
      locationName = reverseGeoRes.data.city || `Lat: ${parseFloat(lat).toFixed(2)}`;
      countryName = reverseGeoRes.data.countryName || `Lon: ${parseFloat(lon).toFixed(2)}`;
    }

    // --- الجزء ب: جلب بيانات الطقس باستخدام الإحداثيات ---
    const tempUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weathercode,wind_speed_10m&hourly=temperature_2m,apparent_temperature,weathercode,is_day,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`;
    
    const weatherRes = await axios.get(weatherUrl );

    // --- الجزء ج: تجميع وإرسال الاستجابة النهائية ---
    res.json({
      location: { name: locationName, country: countryName },
      current: weatherRes.data.current,
      hourly: weatherRes.data.hourly,
      daily: weatherRes.data.daily,
    });

  } catch (error) {
  // Log the detailed error to the console on Render
  console.error("--- BACKEND ERROR ---");
  console.error("Timestamp:", new Date().toISOString());
  console.error("Error Message:", error.message);

  // Check if the error is from an external API (like Open-Meteo)
  if (error.response) {
    console.error("External API Status:", error.response.status);
    console.error("External API Data:", error.response.data);
  } else if (error.request) {
    console.error("No response received from external API. Request details:", error.request);
  } else {
    console.error("Error setting up the request:", error.message);
  }
  
  console.error("--- END OF ERROR ---");

  // Send a generic error message to the frontend
  res.status(500).json({ error: 'Failed to fetch data from external API' });
}

});

// --- 6. تشغيل الخادم ---
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
