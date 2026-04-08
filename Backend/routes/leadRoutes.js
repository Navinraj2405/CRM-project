const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Base route: /api/leads
router.route('/')
    .get(protect, getLeads)
    .post(protect, authorize('Admin', 'Manager'), createLead);

router.route('/:id')
    .get(protect, getLeadById)
    .put(protect, updateLead)
    .delete(protect, authorize('Admin', 'Manager'), deleteLead);

module.exports = router;
