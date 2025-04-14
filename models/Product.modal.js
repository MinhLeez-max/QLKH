const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'cái' // hoặc kg, hộp,...
  },
  importPrice: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number,
    required: true
  },
  supplier: {
    type: String
  },
  importDate: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
