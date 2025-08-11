const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");
const Joi = require("joi");

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Joi validation schema for product creation & update
const productValidationSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().hex().length(24).required(),
  supplier: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(0).required(),
  description: Joi.string().allow("").optional(),
});

// GET all products with pagination and optional search
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = search ? { name: new RegExp(search, "i") } : {};

  const products = await Product.find(filter)
    .populate([
      { path: "category", select: "name description" },
      { path: "supplier", select: "name" },
    ])
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Product.countDocuments(filter);

  const response = {
    total,
    page: Number(page),
    products,
  };

  res.json(response);
});

// GET one product by ID with category populated
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate([
      { path: "category", select: "name description" },
      { path: "supplier", select: "name" },
    ])
    .lean();

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
});

// POST create product
const createProduct = asyncHandler(async (req, res) => {
  const { error } = productValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // Check if category exists
  const categoryExists = await Category.findById(req.body.category).lean();
  if (!categoryExists) {
    return res.status(400).json({ message: "Invalid category ID" });
  }
  // Check if supplier exists
  const supplierExists = await Supplier.findById(req.body.supplier).lean();
  if (!supplierExists) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  const product = new Product(req.body);
  const savedProduct = await product.save();

  res.status(201).json(savedProduct);
});

// PUT update product by ID
const updateProduct = asyncHandler(async (req, res) => {
  const { error } = productValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const categoryExists = await Category.findById(req.body.category).lean();
  if (!categoryExists) {
    return res.status(400).json({ message: "Invalid category ID" });
  }
  const supplierExists = await Supplier.findById(req.body.supplier).lean();
  if (!supplierExists) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).lean();

  if (!updatedProduct)
    return res.status(404).json({ message: "Product not found" });

  res.json(updatedProduct);
});

// DELETE product by ID
const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id).lean();

  if (!deletedProduct)
    return res.status(404).json({ message: "Product not found" });

  res.json({ message: "Product deleted" });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
