const Lead = require('../models/Lead');

// @desc    Get dashboard reports and analytics
// @route   GET /api/reports
// @access  Private
const getDashboardReports = async (req, res) => {
    try {
        let query = {};
        
        // Match query for role
        if (req.user.role === 'Executive') {
            query.assignedTo = req.user._id;
        }

        const totalLeads = await Lead.countDocuments(query);
        const newLeadsToday = await Lead.countDocuments({
            ...query,
            createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
        });
        const convertedLeads = await Lead.countDocuments({ ...query, status: 'Converted' });
        const lostLeads = await Lead.countDocuments({ ...query, status: 'Lost' });

        // Lead by status for pie chart
        const leadsByStatus = await Lead.aggregate([
            { $match: query },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Revenue overview (Simulating a $500 value per converted lead)
        const revenueOverview = convertedLeads * 500;

        res.status(200).json({
            stats: {
                totalLeads,
                newLeadsToday,
                convertedLeads,
                lostLeads,
                revenueOverview
            },
            charts: {
                leadsByStatus: leadsByStatus.map(item => ({ name: item._id, value: item.count }))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardReports };
