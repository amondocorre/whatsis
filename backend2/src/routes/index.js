const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const senderRoutes = require('./senderRoutes');
const messageRoutes = require('./messageRoutes');
const planRoutes = require('./planRoutes');
const companyRoutes = require('./companyRoutes');

router.use('/auth', authRoutes);
router.use('/senders', senderRoutes);
router.use('/messages', messageRoutes);
router.use('/plans', planRoutes);
router.use('/companies', companyRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date()
  });
});

module.exports = router;
