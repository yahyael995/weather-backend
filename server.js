// D:\weather-backend\server.js (The "Hello World" Test)
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// This is the ONLY endpoint. It ignores all parameters.
app.get('/weather', (req, res) => {
  console.log(`✅ Received a request at /weather. Sending "Hello World".`);
  res.status(200).json({ message: "Hello from the backend!" });
});

app.listen(port, () => {
  console.log(`✅ Backend server is running on port ${port} in TEST MODE.`);
});
