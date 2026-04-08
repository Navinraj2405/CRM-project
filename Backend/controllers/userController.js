const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top users (for dashboard)
// @route   GET /api/users/performance
// @access  Private/Admin
const getUserPerformance = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['Executive', 'Manager'] } }).select('-password');
        
        // Simulating performance scores since we don't have complex metrics modelled yet
        const performance = users.map(user => ({
            _id: user._id,
            name: user.name,
            role: user.role,
            leadsAssigned: Math.floor(Math.random() * 50) + 10,
            conversionRate: Math.floor(Math.random() * 80) + 10
        }));

        res.status(200).json(performance.sort((a, b) => b.conversionRate - a.conversionRate));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, getUserPerformance };
