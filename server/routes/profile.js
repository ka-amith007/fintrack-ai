const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.put('/', updateProfile);
router.put('/password', changePassword);

module.exports = router;
