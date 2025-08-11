const Supplier = require('../models/Supplier');
const Joi = require('joi');

// Async handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Joi validation schema
const supplierValidationSchema = Joi.object({
  name: Joi.string().required(),
  contactPerson: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]+$/).required(),
  email: Joi.string().email().required(),
  address: Joi.string().required()
});

// Create supplier
const createSupplier = asyncHandler(async (req, res) => {
  const { error } = supplierValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const supplier = new Supplier(req.body);
  const savedSupplier = await supplier.save();

  res.status(201).json(savedSupplier);
});

// Get suppliers (with pagination & search)
const getSuppliers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = search ? { name: new RegExp(search, 'i') } : {};

  const suppliers = await Supplier
    .find(filter, 'name contactPerson phone email')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Supplier.countDocuments(filter);

  res.json({ total, page: Number(page), suppliers });
});

// Get supplier by ID
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).lean();
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  res.json(supplier);
});

// Update supplier
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).lean();

  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  res.json(supplier);
});

// Delete supplier
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id).lean();
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  res.json({ message: 'Supplier deleted successfully' });
});

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};
