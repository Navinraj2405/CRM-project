const mongoose = require('mongoose');

const leadSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    source: {
        type: String,
        enum: ['Website', 'Facebook Ads', 'Referral', 'Cold Call', 'Other'],
        default: 'Website'
    },
    status: {
        type: String,
        enum: ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Lost'],
        default: 'New Lead'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    },
    followUpDate: {
        type: Date
    },
    activityLogs: [{
        action: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
