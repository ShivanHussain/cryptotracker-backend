import { connect } from "mongoose";
import { config } from "dotenv";
import { server, io } from "./app.js";
import axios from "axios";
import cloudinary from "cloudinary";

config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/crypto-tracker";

// Real-time price updates
const startPriceUpdates = () => {
    setInterval(async () => {
        try {
            const { data } = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
                params: {
                    vs_currency: "usd",
                    order: "market_cap_desc",
                    per_page: 10,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: "1h,24h,7d"
                }
            });

            // Emit real-time price updates to all connected clients
            io.emit("price-update", {
                timestamp: new Date().toISOString(),
                data
            });

        } catch (error) {
            console.error("Error fetching price updates:", error.message);
        }
    }, 30000); // Update every 30 seconds
};

// Connect to MongoDB and start server
connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);

            // Start real-time price updates
            startPriceUpdates();
            console.log("Real-time price updates started");
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });




//SETUP CLOUDINARY
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("Process terminated");
    });
});