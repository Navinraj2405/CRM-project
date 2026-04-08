const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    customer_id: {
        type: String
    },
    customer_email: {
        type: String
    },
    customer_phone: {
        type: String
    },
    lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    payment_session_id: {
        type: String
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
