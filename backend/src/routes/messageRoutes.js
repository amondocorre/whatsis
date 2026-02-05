const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { validateMessageQuota } = require('../middlewares/quotaValidator');

router.post('/upload', authMiddleware, upload.single('file'), messageController.uploadExcel);

router.post('/campaign', authMiddleware, validateMessageQuota, messageController.createCampaign);

router.post('/send', authMiddleware, validateMessageQuota, messageController.sendMessages);

router.get('/campaigns', authMiddleware, messageController.getCampaigns);

router.get('/campaigns/:id', authMiddleware, messageController.getCampaignById);

router.get('/campaigns/:id/logs', authMiddleware, messageController.getCampaignLogs);

router.post('/test', authMiddleware, messageController.testSendMessage);

module.exports = router;
