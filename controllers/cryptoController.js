import axios from "axios";
import catchAsync from "../middlewares/catchAsync.js";

const COINGECKO_BASE_URL = process.env.COINGECKO_API_BASE || "https://api.coingecko.com/api/v3";

// Get top cryptocurrencies by market cap
export const getTopCoins = catchAsync(async (req, res) => {
  const { page = 1, per_page = 10 } = req.query;
  
  const { data } = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: Math.min(per_page, 100), // Limit to 100 max
      page,
      sparkline: false,
      price_change_percentage: "1h,24h,7d"
    },
  });

  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

// Get specific coin details
export const getCoinDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const { data } = await axios.get(`${COINGECKO_BASE_URL}/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: true,
      developer_data: false,
      sparkline: false
    }
  });

  res.status(200).json({
    success: true,
    data: {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image,
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      market_cap_rank: data.market_cap_rank,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      price_change_percentage_7d: data.market_data.price_change_percentage_7d,
      price_change_percentage_30d: data.market_data.price_change_percentage_30d,
      total_volume: data.market_data.total_volume.usd,
      high_24h: data.market_data.high_24h.usd,
      low_24h: data.market_data.low_24h.usd,
      circulating_supply: data.market_data.circulating_supply,
      total_supply: data.market_data.total_supply,
      max_supply: data.market_data.max_supply,
      description: data.description.en
    }
  });
});

// Get coin price history
export const getCoinHistory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { days = 7, interval } = req.query;

  const params = {
    vs_currency: "usd",
    days
  };

  if (interval) {
    params.interval = interval;
  }

  const { data } = await axios.get(`${COINGECKO_BASE_URL}/coins/${id}/market_chart`, {
    params
  });

  // Format data for easier frontend consumption
  const formattedData = {
    prices: data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
      date: new Date(timestamp).toISOString()
    })),
    market_caps: data.market_caps.map(([timestamp, market_cap]) => ({
      timestamp,
      market_cap,
      date: new Date(timestamp).toISOString()
    })),
    total_volumes: data.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      volume,
      date: new Date(timestamp).toISOString()
    }))
  };

  res.status(200).json({
    success: true,
    data: formattedData
  });
});

// Search coins
export const searchCoins = catchAsync(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search query is required"
    });
  }

  const { data } = await axios.get(`${COINGECKO_BASE_URL}/search`, {
    params: { query }
  });

  res.status(200).json({
    success: true,
    data: {
      coins: data.coins.slice(0, 10), // Limit to 10 results
      exchanges: data.exchanges.slice(0, 5),
      categories: data.categories.slice(0, 5)
    }
  });
});

// Get trending coins
export const getTrendingCoins = catchAsync(async (req, res) => {
  const { data } = await axios.get(`${COINGECKO_BASE_URL}/search/trending`);

  res.status(200).json({
    success: true,
    data: data.coins
  });
});


// Get global market data
export const getGlobalMarketData = catchAsync(async (req, res) => {
    const { data } = await axios.get(`${COINGECKO_BASE_URL}/global`);
    
    res.status(200).json({
        success: true,
        data: {
        total_market_cap: data.data.total_market_cap.usd,
        total_volume: data.data.total_volume.usd,
        market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h,
        active_cryptocurrencies: data.data.active_cryptocurrencies,
        markets: data.data.markets
        }
    });
    }   
);