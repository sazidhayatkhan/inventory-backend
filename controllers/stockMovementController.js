const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

const addStockMovement = async (req, res) => {
  const { product, type, quantity, remarks } = req.body;

  if (!['IN', 'OUT'].includes(type)) {
    return res.status(400).json({ message: "Type must be 'IN' or 'OUT'" });
  }

  try {
    const productData = await Product.findById(product);
    if (!productData) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (type === 'OUT' && productData.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock quantity' });
    }

    // Create stock movement record
    const stockMovement = new StockMovement({ product, type, quantity, remarks });
    await stockMovement.save();

    // Update product quantity
    productData.quantity = type === 'IN'
      ? productData.quantity + quantity
      : productData.quantity - quantity;

    await productData.save();

    res.status(201).json({ message: 'Stock movement recorded', stockMovement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addStockMovement
};
