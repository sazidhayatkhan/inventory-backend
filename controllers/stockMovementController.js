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

const getStockMovements = async (req, res) => {
  try {
    const { startDate, endDate, type, product, page = 1, limit = 10, sortField = 'date', sortOrder = 'desc' } = req.query;
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Type filter (IN/OUT)
    if (type) {
      filter.type = type.toUpperCase();
    }

    // Product filter
    if (product) {
      filter.product = product;
    }

    // Convert pagination params to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Sorting
    const sort = {};
    sort[sortField] = sortOrder.toLowerCase() === 'asc' ? 1 : -1;

    // Fetch with filters, pagination, sorting
    const movements = await StockMovement.find(filter)
      .populate('product', 'name category')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Count total for pagination info
    const total = await StockMovement.countDocuments(filter);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: movements
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addStockMovement,
  getStockMovements
};
