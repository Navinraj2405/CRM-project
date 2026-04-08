const { Cashfree, CFEnvironment } = require('cashfree-pg');
const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

// We will use the constructor properly below and don't need top-level assignments.

// @desc    Create a Cashfree payment session / order
// @route   POST /api/payment/create-order
// @access  Public (for initial landing page signup/payment or CRM checkout)
exports.createOrder = async (req, res) => {
    try {
        const { planId, amount, customerEmail, customerPhone, leadId } = req.body;

        // Generate a random order ID for this checkout request
        const customOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const customerId = `cust_${Date.now()}`;

        const request = {
            order_amount: amount || 99.00,
            order_currency: "INR",
            order_id: customOrderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: customerPhone || "9999999999",
                customer_email: customerEmail || "test@example.com"
            },
            order_meta: {
                return_url: "http://localhost:5173/login?order_id={order_id}"
            }
        };

        const cashfreeInstance = new Cashfree(
            process.env.CASHFREE_ENVIRONMENT === 'SANDBOX' ? CFEnvironment.SANDBOX : CFEnvironment.PRODUCTION,
            process.env.CASHFREE_APP_ID,
            process.env.CASHFREE_SECRET_KEY
        );

        // v5 requires ONLY the request payload, the API version is handled internally
        const response = await cashfreeInstance.PGCreateOrder(request);
        
        console.log("Cashfree Order Created successfully");

        // Save payment to DB as pending
        await Payment.create({
            order_id: customOrderId,
            amount: request.order_amount,
            status: 'pending',
            customer_id: customerId,
            customer_email: request.customer_details.customer_email,
            customer_phone: request.customer_details.customer_phone,
            lead_id: leadId || null,
            payment_session_id: response.data.payment_session_id
        });

        res.status(200).json({
            success: true,
            payment_session_id: response.data.payment_session_id,
            order_id: customOrderId
        });
    } catch (error) {
        console.error("Error creating Cashfree order:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create payment session",
            error: error.response?.data?.message || "Internal Server Error"
        });
    }
};

// @desc    Handle Cashfree Webhook callback
// @route   POST /api/payment/webhook
// @access  Public (Cashfree Server)
exports.handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const rawBody = req.rawBody; // Populated by express.json.verify in server.js

        if (!signature || !timestamp || !rawBody) {
            return res.status(400).send('Missing webhook headers or body');
        }

        // Cashfree webhook verification using SDK (make sure SDK version supports your approach)
        try {
            const cashfreeInstance = new Cashfree(
                process.env.CASHFREE_ENVIRONMENT === 'SANDBOX' ? CFEnvironment.SANDBOX : CFEnvironment.PRODUCTION,
                process.env.CASHFREE_APP_ID,
                process.env.CASHFREE_SECRET_KEY
            );
            cashfreeInstance.PGVerifyWebhookSignature(signature, rawBody, timestamp);
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return res.status(400).send('Invalid Signature');
        }

        // Signature verified, now process the payload
        // The parsed JSON payload should be available in req.body
        const payload = req.body;
        console.log("Webhook payload verified:", JSON.stringify(payload));

        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderId = payload.data.order.order_id;
            const paymentStatus = payload.data.payment.payment_status;

            if (paymentStatus === 'SUCCESS') {
                // Update payment to SUCCESS
                const payment = await Payment.findOneAndUpdate(
                    { order_id: orderId },
                    { status: 'success' },
                    { new: true }
                );

                if (payment && payment.lead_id) {
                    // Mark lead as 'Converted'
                    await Lead.findByIdAndUpdate(payment.lead_id, { status: 'Converted' });
                    console.log(`Lead ${payment.lead_id} marked as Converted for order ${orderId}`);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        res.status(500).send('Internal Server Error');
    }
};
