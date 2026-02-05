const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authMiddleware } = require('../middlewares/auth');
const roleAuth = require('../middlewares/roleAuth');

router.use(authMiddleware);
router.use(roleAuth.isSuperAdmin);

router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompany);
router.get('/:id/stats', companyController.getCompanyStats);
router.post('/', companyController.createCompany);
router.put('/:id', companyController.updateCompany);
router.put('/:id/reset-quota', companyController.resetMonthlyQuota);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
