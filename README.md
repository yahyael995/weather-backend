# Weather React - Backend Server ⚙️

This is the backend server for the [Weather React](https://github.com/yahyael995/weather-react ) application. It's a simple Node.js server built with Express that acts as a proxy to fetch data from third-party weather APIs.

**➡️ [Live API Endpoint](https://weather-backend-final.onrender.com) ⬅️** 
*(Replace with your actual Render URL)*

---

## 🎯 Purpose

The primary purpose of this server is to:
1.  **Hide API Keys:** Securely handle requests to weather APIs without exposing sensitive keys on the client-side.
2.  **Proxy Requests:** Act as an intermediary between the frontend application and the weather data providers (like Open-Meteo).
3.  **Format Data:** Potentially format or combine data from multiple sources before sending it to the frontend (though currently it's a direct proxy).

## 🛠️ Tech Stack

*   **Framework:** [Express.js](https://expressjs.com/ )
*   **HTTP Client:** [Axios](https://axios-http.com/ )
*   **CORS Handling:** [cors](https://www.npmjs.com/package/cors )
*   **Runtime:** [Node.js](https://nodejs.org/ )
*   **Deployment:** [Render](https://render.com/ )

## 🚀 Running Locally

To run this server on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/weather-backend.git
    cd weather-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will start and be available at `http://localhost:3001`.

---
