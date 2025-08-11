const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  address: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
