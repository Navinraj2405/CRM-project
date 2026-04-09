const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser with rawBody included for webhook signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin || '*'); // Dynamically allow all origins (including Vercel preview environments)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-version']
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
// Public API endpoint for capturing leads from landing pages
app.post('/api/webhook/leads', require('./controllers/leadController').captureLead);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
