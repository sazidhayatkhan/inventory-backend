const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");


router.get("/", purchaseOrderController.getAllPurchaseOrders);
router.get("/:id", purchaseOrderController.getPurchaseOrderById);
router.post("/", purchaseOrderController.createPurchaseOrder);
router.put("/:id/status", purchaseOrderController.updatePurchaseOrderStatus);
router.delete("/:id", purchaseOrderController.deletePurchaseOrder);

module.exports = router;
