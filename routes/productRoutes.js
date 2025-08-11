const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Protect create, update, delete routes - only admins
router.post('/', authenticate, authorize('admin'), productController.createProduct);
router.put('/:id', authenticate, authorize('admin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

// Public routes - anyone can read products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
