const express = require('express');
const router = express.Router();
const salesOrderController  = require('../controllers/salesOrderController');

router.get("/", salesOrderController.getAllSalesOrders);
router.get("/:id", salesOrderController.getSalesOrderById);
router.post("/", salesOrderController.createSalesOrder);
router.put("/:id/status", salesOrderController.updateSalesOrderStatus);
router.delete("/:id", salesOrderController.deleteSalesOrder);

module.exports = router;