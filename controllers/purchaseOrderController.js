const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const StockMovement = require("../models/StockMovement");
const Joi = require("joi");

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Joi validation schema
const purchaseOrderValidationSchema = Joi.object({
  supplier: Joi.string().hex().length(24).required(),
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

// GET all purchase orders with pagination and optional supplier search
const getAllPurchaseOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = search
    ? { supplierName: new RegExp(search, "i") }
    : {};

  // Populate supplier and products
  const purchaseOrders = await PurchaseOrder.find(filter)
    .populate([
      { path: "supplier", select: "name" },
      { path: "items.product", select: "name category supplier" },
    ])
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await PurchaseOrder.countDocuments(filter);

  res.json({
    total,
    page: Number(page),
    purchaseOrders,
  });
});

// GET one purchase order by ID
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate([
      { path: "supplier", select: "name" },
      { path: "items.product", select: "name category supplier" },
    ])
    .lean();

  if (!order)
    return res.status(404).json({ message: "Purchase order not found" });

  res.json(order);
});

// POST create purchase order
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { error } = purchaseOrderValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { supplier, items } = req.body;

  // Validate supplier exists
  const supplierExists = await Supplier.findById(supplier).lean();
  if (!supplierExists) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  // Validate products and calculate totalAmount
  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findById(item.product).lean();
    if (!product) {
      return res.status(400).json({ message: `Product not found: ${item.product}` });
    }
    totalAmount += item.price * item.quantity;
  }

  const purchaseOrder = new PurchaseOrder({
    supplier,
    items,
    totalAmount,
  });

  const savedOrder = await purchaseOrder.save();

  // Update stock & create stock movements
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });

    const movement = new StockMovement({
      product: item.product,
      type: "IN",
      quantity: item.quantity,
      remarks: `Purchase Order #${savedOrder._id}`,
    });
    await movement.save();
  }

  res.status(201).json(savedOrder);
});

// PUT update purchase order status only
const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).lean();

  if (!updatedOrder)
    return res.status(404).json({ message: "Purchase order not found" });

  res.json(updatedOrder);
});

// DELETE purchase order by ID
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await PurchaseOrder.findByIdAndDelete(req.params.id).lean();

  if (!deletedOrder)
    return res.status(404).json({ message: "Purchase order not found" });

  res.json({ message: "Purchase order deleted" });
});

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
};
