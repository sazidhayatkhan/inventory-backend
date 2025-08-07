require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Load DB connection
const connectDB = require('./config/db');

// Route files
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoriesRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
