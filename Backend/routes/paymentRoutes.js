const express = require('express');
const router = express.Router();
const { createOrder, handleWebhook } = require('../controllers/paymentController');

// POST /api/payment/create-order
router.post('/create-order', createOrder);

// POST /api/payment/webhook
router.post('/webhook', handleWebhook);

module.exports = router;
