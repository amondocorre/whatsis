const express = require('express');
const router = express.Router();
const senderController = require('../controllers/senderController');
const { authMiddleware, isAdmin } = require('../middlewares/auth');
const { senderValidation } = require('../middlewares/validator');
const { validateSenderQuota } = require('../middlewares/quotaValidator');

router.post('/', authMiddleware, isAdmin, validateSenderQuota, senderValidation, senderController.createSender);

router.get('/', authMiddleware, senderController.getAllSenders);

router.get('/:id', authMiddleware, senderController.getSender);

router.put('/:id', authMiddleware, isAdmin, senderValidation, senderController.updateSender);

router.delete('/:id', authMiddleware, isAdmin, senderController.deleteSender);

router.post('/:id/initialize', authMiddleware, senderController.initializeWhatsApp);

router.post('/:id/disconnect', authMiddleware, senderController.disconnectWhatsApp);

router.get('/:id/qr', authMiddleware, senderController.getQRCode);

router.get('/:id/status', authMiddleware, senderController.getConnectionStatus);

module.exports = router;
