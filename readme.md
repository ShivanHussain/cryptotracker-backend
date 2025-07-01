# 🪙 CryptoTracker API

A powerful backend API for tracking cryptocurrency prices, portfolios, user accounts, and market data — built using **Node.js**, **Express.js**, **MongoDB**, and **CoinGecko API**.



## 📦 Features

- 🔐 User Authentication (Register/Login/Logout)
- 👤 Profile management with Cloudinary profile uploads
- 📈 Real-time price updates via **WebSockets (Socket.IO)**
- 💼 User Portfolio with:
  - Asset Add/Update/Delete
  - Real-time valuation
  - Profit/loss calculation
- 🔎 Market Data:
  - Top coins
  - Coin details & history
  - Global market stats
  - Trending coins
  - Search functionality

---

## ⚙️ Tech Stack

| Layer     | Tech |
|-----------|------|
| Backend   | Node.js, Express.js |
| Database  | MongoDB (Mongoose) |
| Real-Time | Socket.IO |
| Auth      | JWT + Cookies |
| Media     | Cloudinary |
| API       | CoinGecko API |

---

## 📁 Project Structure
    backend/
    │
    ├── controllers/ # Business logic for auth, portfolio, crypto
    ├── middlewares/ # Error handlers, auth protectors, etc.
    ├── models/ # Mongoose schemas (User, Portfolio)
    ├── routes/ # API route declarations
    ├── .env # Environment variables
    ├── app.js # Express app + Socket.io setup
    ├── server.js # Server start + DB connect + Real-time job
    └── README.md # You're here!



---

## 🚀 Getting Started

### 1. Clone the repository

    ```bash
    git clone https://github.com/your-username/cryptotracker-backend.git
    cd cryptotracker-backend

### 2 . install Dependencies
    npm install

### 3. Create .env file
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    JWT_EXPIRES_IN=7d
    JWT_COOKIE_EXPIRE=7
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_key
    CLOUDINARY_API_SECRET=your_secret
    FRONTEND_URL=http://localhost:3000
    COINGECKO_API_BASE=https://api.coingecko.com/api/v3
    NODE_ENV=development

### 4. Start the server
    npm run dev



