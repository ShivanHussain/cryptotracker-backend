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

```
backend/
│
├── controllers/          # Business logic for auth, portfolio, crypto
├── middlewares/          # Error handlers, auth protectors, etc.
├── models/               # Mongoose schemas (User, Portfolio)
├── routes/               # API route declarations
├── .env                  # Environment variables
├── app.js                # Express app + Socket.io setup
├── server.js             # Server start + DB connect + Real-time job
└── README.md             # You're here!
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cryptotracker-backend.git
cd cryptotracker-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
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
```

### 4. Start the server

```bash
npm run dev
```

The API will run at: `http://localhost:5000`

---

## 🌐 API Endpoints

### 🔐 Auth

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET  | `/api/auth/me` | Get current logged in user |
| PUT  | `/api/auth/profile` | Update profile |
| PUT  | `/api/auth/change-password` | Change password |

### 💼 Portfolio

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/portfolio` | Get user portfolio |
| POST | `/api/portfolio/add` | Add crypto to portfolio |
| PUT | `/api/portfolio/update` | Update crypto in portfolio |
| DELETE | `/api/portfolio/remove` | Remove crypto from portfolio |

### 📊 Crypto Market

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/crypto/top` | Top coins by market cap |
| GET | `/api/crypto/:id` | Get specific coin details |
| GET | `/api/crypto/:id/history?days=7` | Get historical price |
| GET | `/api/crypto/search?query=btc` | Search coins |
| GET | `/api/crypto/trending` | Get trending coins |
| GET | `/api/crypto/global` | Global market stats |

---

## 🔄 Real-time Price Updates (Socket.IO)

- Socket connects to `ws://localhost:5000`
- Events:
  - `price-update`: Emits every 30 seconds with top coin prices
  - `join-room` / `leave-room`: Optional for grouping

---

## 🧪 Testing

Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) with the following:
- Set `Authorization: Bearer <token>` header after login
- Upload `profilePicture` via form-data in `register` or `update-profile` API

---

## 📷 Profile Image Upload (Cloudinary)

- Accepts image in `req.files.profilePicture`
- Automatically uploads to Cloudinary folder `Profile_Pictures`

---

## 🛠️ Future Improvements

- Notifications for price alerts
- Frontend dashboard with charts
- Social login (Google OAuth)
- Daily portfolio summary email

---

## 👨‍💻 Author

**Shivan Hussain**  
_MERN Developer | AI Enthusiast_

GitHub: [@shivankhan](https://github.com/shivankhan)

---

