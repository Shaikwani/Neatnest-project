const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');

// ✅ Fix: file is in controllers folder, not middleware folder
const { verifyToken } = require('../controllers/auth.middleware');

router.post('/register',  controller.register);
router.post('/login',     controller.login);
router.get('/me',         verifyToken, controller.getMe);
router.put('/fcm-token',  verifyToken, controller.updateFcmToken);

module.exports = router;