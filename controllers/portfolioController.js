
import Portfolio from "../models/portfolio.js";
import catchAsync from "../middlewares/catchAsync.js";
import axios from "axios";

const COINGECKO_BASE_URL = process.env.COINGECKO_API_BASE || "https://api.coingecko.com/api/v3";

// Get user portfolio 
export const getPortfolio = catchAsync(async (req, res) => {
  const userId = req.user.id; // Get from authenticated user

  let userPortfolio = await Portfolio.findOne({ user: userId }).populate('user', 'username firstName lastName');

  if (!userPortfolio) {
    userPortfolio = await Portfolio.create({
      user: userId,
      assets: []
    });
  }

  // Calculate current portfolio value
  if (userPortfolio.assets && userPortfolio.assets.length > 0) {
    const coinIds = userPortfolio.assets.map(asset => asset.coinId).join(',');
    
    try {
      const { data: priceData } = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
        params: {
          ids: coinIds,
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      });

      let totalValue = 0;
      const updatedAssets = userPortfolio.assets.map(asset => {
        const currentPrice = priceData[asset.coinId]?.usd || 0;
        const currentValue = asset.amount * currentPrice;
        const profitLoss = currentValue - (asset.amount * asset.purchasePrice);
        const profitLossPercentage = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
        
        totalValue += currentValue;

        return {
          ...asset.toObject(),
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercentage,
          priceChange24h: priceData[asset.coinId]?.usd_24h_change || 0
        };
      });

      userPortfolio = {
        ...userPortfolio.toObject(),
        assets: updatedAssets,
        totalValue
      };
    } catch (error) {
      console.error('Error fetching current prices:', error.message);
    }
  }

  res.status(200).json({
    success: true,
    data: userPortfolio
  });
});

// Add asset to portfolio
export const addAssetToPortfolio = catchAsync(async (req, res) => {
  const userId = req.user.id; // Get from authenticated user
  const { coinId, symbol, name, amount, purchasePrice } = req.body;

  // Validate input
  if (!coinId || !symbol || !name || !amount || !purchasePrice) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: coinId, symbol, name, amount, purchasePrice"
    });
  }

  // Validate amount and purchasePrice
  if (amount <= 0 || purchasePrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount and purchase price must be greater than 0"
    });
  }

  let portfolio = await Portfolio.findOne({ user: userId });

  // If portfolio doesn't exist, create a new one
  if (!portfolio) {
    portfolio = new Portfolio({ user: userId, assets: [] });
  }

  // Check if asset already exists in portfolio
  const existingAssetIndex = portfolio.assets.findIndex(asset => asset.coinId === coinId);

  if (existingAssetIndex !== -1) {
    // Update existing asset 
    const existingAsset = portfolio.assets[existingAssetIndex];
    const totalAmount = existingAsset.amount + amount;
    const avgPurchasePrice = ((existingAsset.amount * existingAsset.purchasePrice) + (amount * purchasePrice)) / totalAmount;
    
    portfolio.assets[existingAssetIndex] = {
      ...existingAsset,
      amount: totalAmount,
      purchasePrice: avgPurchasePrice,
      dateAdded: new Date()
    };
  } else {
    // Add new asset
    portfolio.assets.push({
      coinId,
      symbol: symbol.toLowerCase(),
      name,
      amount,
      purchasePrice
    });
  }

  await portfolio.save();

  res.status(201).json({
    success: true,
    message: "Asset added to portfolio successfully",
    data: portfolio
  });
});

// Remove asset from portfolio
export const removeAssetFromPortfolio = catchAsync(async (req, res) => {
  const userId = req.user.id; // Get from authenticated user
  const { coinId } = req.body;

  const portfolio = await Portfolio.findOne({ user: userId });

  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: "Portfolio not found"
    });
  }

  // Check if asset exists in portfolio
  portfolio.assets = portfolio.assets.filter(asset => asset.coinId !== coinId);
  await portfolio.save();

  res.status(200).json({
    success: true,
    message: "Asset removed from portfolio successfully",
    data: portfolio
  });
});

// Update asset in portfolio 
export const updateAssetInPortfolio = catchAsync(async (req, res) => {
  const userId = req.user.id; // Get from authenticated user
  const { coinId, amount, purchasePrice } = req.body;

  const portfolio = await Portfolio.findOne({ user: userId });

  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: "Portfolio not found"
    });
  }

  const assetIndex = portfolio.assets.findIndex(asset => asset.coinId === coinId);

  // Check if asset exists in portfolio
  if (assetIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Asset not found in portfolio"
    });
  }

  if (amount !== undefined) portfolio.assets[assetIndex].amount = amount;
  if (purchasePrice !== undefined) portfolio.assets[assetIndex].purchasePrice = purchasePrice;

  await portfolio.save();

  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    data: portfolio
  });
});
