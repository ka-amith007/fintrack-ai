const express = require('express');
const router = express.Router();
const { getSummary, getCharts, getInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getSummary);
router.get('/charts', getCharts);
router.get('/insights', getInsights);

module.exports = router;
