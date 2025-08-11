const express = require('express');
const router = express.Router();
const sctockMovementController  = require('../controllers/stockMovementController');

router.post('/', sctockMovementController.addStockMovement);
router.get('/',sctockMovementController.getStockMovements)

module.exports = router;
