const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  quantity: { type: Number, required: true, min: 0 },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', itemSchema);