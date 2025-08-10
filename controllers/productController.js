const Product = require('../models/Product');
const Category = require('../models/Category');

// GET all products (with category populated)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name description');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET one product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create product
const createProduct = async (req, res) => {
  const { name, category, quantity, description } = req.body;

  try {
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    const product = new Product({ name, category, quantity, description });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update product by ID
const updateProduct = async (req, res) => {
  const { name, category, quantity, description } = req.body;

  try {
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, quantity, description },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE product by ID
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
