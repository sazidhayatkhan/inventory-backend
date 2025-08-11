require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const faqRoutes = require('./routes/faqRoutes'); 
const supplierRoutes = require('./routes/supplierRoutes');
const sctockRoutes = require('./routes/stockRoutes')
const salesOrderRoutes = require('./routes/salesOrderRoutes')
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes')

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/supplier',supplierRoutes)
app.use('/api/faqs', faqRoutes);
app.use('/api/stock-movement',sctockRoutes);
app.use('/api/sales-order',salesOrderRoutes);
app.use('/api/purchase-order',purchaseOrderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
