const SalesOrder = require("../models/SalesOrder");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const Joi = require("joi");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Joi validation schema for sales order creation
const salesOrderValidationSchema = Joi.object({
  customerName: Joi.string().required(),
  customerEmail: Joi.string().email().allow("").optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

// GET all sales orders with pagination and optional search by customer name
const getAllSalesOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = search ? { customerName: new RegExp(search, "i") } : {};

  const orders = await SalesOrder.find(filter)
    .populate([
      { path: "items.product", select: "name category supplier" },
    ])
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await SalesOrder.countDocuments(filter);

  res.json({
    total,
    page: Number(page),
    orders,
  });
});

// GET one sales order by ID
const getSalesOrderById = asyncHandler(async (req, res) => {
  const order = await SalesOrder.findById(req.params.id)
    .populate([
      { path: "items.product", select: "name category supplier" },
    ])
    .lean();

  if (!order) return res.status(404).json({ message: "Sales order not found" });

  res.json(order);
});

// POST create sales order
const createSalesOrder = asyncHandler(async (req, res) => {
  const { error } = salesOrderValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { customerName, customerEmail, items } = req.body;
  let totalAmount = 0;

  // Validate stock
  for (const item of items) {
    const product = await Product.findById(item.product).lean();
    if (!product) {
      return res.status(400).json({ message: `Product not found: ${item.product}` });
    }
    if (product.quantity < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    totalAmount += item.price * item.quantity;
  }

  // Create sales order
  const order = new SalesOrder({
    customerName,
    customerEmail,
    items,
    totalAmount,
  });

  const savedOrder = await order.save();

  // Update stock & create stock movements
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });

    const movement = new StockMovement({
      product: item.product,
      type: "OUT",
      quantity: item.quantity,
      remarks: `Sale Order #${savedOrder._id}`,
    });
    await movement.save();
  }

  res.status(201).json(savedOrder);
});

// PUT update sales order status only
const updateSalesOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updatedOrder = await SalesOrder.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).lean();

  if (!updatedOrder)
    return res.status(404).json({ message: "Sales order not found" });

  res.json(updatedOrder);
});

// DELETE sales order by ID
const deleteSalesOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await SalesOrder.findByIdAndDelete(req.params.id).lean();

  if (!deletedOrder)
    return res.status(404).json({ message: "Sales order not found" });

  res.json({ message: "Sales order deleted" });
});

module.exports = {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
};
