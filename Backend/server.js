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

const allowedOrigins = new Set([
    'https://crm-project-frontend-xi.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]);

// Handle CORS and browser preflight requests before parsing or mounting routes
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && (allowedOrigins.has(origin) || origin.endsWith('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-api-version');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    next();
});

// Body parser with rawBody included for webhook signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// Enable CORS for Express responses and keep the allowlist consistent
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app')) {
            callback(null, origin || 'https://crm-project-frontend-xi.vercel.app');
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
