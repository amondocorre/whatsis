const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { isSuperAdmin } = require('../middlewares/roleAuth');
const { loginValidation, registerValidation } = require('../middlewares/validator');

router.post('/register', registerValidation, authController.register);

router.post('/login', loginValidation, authController.login);

router.get('/profile', authMiddleware, authController.getProfile);

router.put('/users/:id', authMiddleware, isSuperAdmin, authController.updateUser);

router.delete('/users/:id', authMiddleware, isSuperAdmin, authController.deleteUser);

module.exports = router;
