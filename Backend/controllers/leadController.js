const Lead = require('../models/Lead');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
    try {
        let query = {};
        
        // Executives can only see assigned leads, Managers and Admins see all
        if (req.user.role === 'Executive') {
            query.assignedTo = req.user._id;
        }

        // Apply filters
        if (req.query.status) query.status = req.query.status;
        if (req.query.source) query.source = req.query.source;
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { phone: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name')
                            .populate('activityLogs.user', 'name');
        
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        
        // Check permission
        if (req.user.role === 'Executive' && lead.assignedTo._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this lead' });
        }
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a lead
// @route   POST /api/leads
// @access  Private (Manager/Admin)
const createLead = async (req, res) => {
    try {
        const lead = await Lead.create(req.body);
        
        // Add activity log
        lead.activityLogs.push({
            action: 'Lead Created',
            user: req.user._id
        });
        await lead.save();

        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
    try {
        let lead = await Lead.findById(req.params.id);
        
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        // Check permission
        if (req.user.role === 'Executive' && lead.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this lead' });
        }

        const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Log update activity
        updatedLead.activityLogs.push({
            action: 'Lead Updated',
            user: req.user._id
        });
        await updatedLead.save();

        res.status(200).json(updatedLead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Manager/Admin)
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        await lead.deleteOne();
        res.status(200).json({ message: 'Lead removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Public webhook to capture lead
// @route   POST /api/webhook/leads
// @access  Public
const captureLead = async (req, res) => {
    try {
        const lead = await Lead.create({
            ...req.body,
            source: 'Website',
            status: 'New Lead'
        });
        res.status(201).json({ message: 'Lead captured successfully', leadId: lead._id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead, captureLead };
