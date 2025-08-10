require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const faqRoutes = require('./routes/faqRoutes'); 

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/faqs', faqRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
