import { Schema, model } from "mongoose";

const portfolioSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true 
  },
  assets: [
    {
      coinId: {
        type: String,
        required: true
      },
      symbol: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      purchasePrice: {
        type: Number,
        required: true,
        min: 0
      },
      dateAdded: {
        type: Date,
        default: Date.now
      }
    },
  ],
  totalValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default model("Portfolio", portfolioSchema);