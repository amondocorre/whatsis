const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authMiddleware } = require('../middlewares/auth');
const roleAuth = require('../middlewares/roleAuth');

router.use(authMiddleware);
router.use(roleAuth.isSuperAdmin);

router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlan);
router.post('/', planController.createPlan);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
