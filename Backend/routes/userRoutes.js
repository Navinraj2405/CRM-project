const express = require('express');
const router = express.Router();
const { getUsers, getUserPerformance } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Admin', 'Manager'), getUsers);

router.get('/performance', protect, authorize('Admin', 'Manager'), getUserPerformance);

module.exports = router;
