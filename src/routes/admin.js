const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');

// Admin authentication routes
router.get('/admin/login', adminAuthController.getAdminLogin);
router.post('/admin/login', adminAuthController.postAdminLogin);
router.get('/admin/logout', adminAuthController.adminLogout);

// Admin dashboard routes (protected)
router.get('/admin/dashboard', adminAuthController.requireAdmin, adminController.getDashboard);

// User management routes
router.get('/admin/users', adminAuthController.requireAdmin, adminController.getUsers);
router.get('/admin/users/:id', adminAuthController.requireAdmin, adminController.getUserProfile);
router.post('/admin/users/:id/suspend', adminAuthController.requireAdmin, adminController.suspendUser);
router.post('/admin/users/:id/unsuspend', adminAuthController.requireAdmin, adminController.unsuspendUser);
router.delete('/admin/users/:id', adminAuthController.requireAdmin, adminController.deleteUser);
router.post('/admin/users/:id/xp', adminAuthController.requireAdmin, adminController.updateUserXP);
router.post('/admin/users/:id/badge', adminAuthController.requireAdmin, adminController.awardBadge);

// Challenge management routes
router.get('/admin/challenges', adminAuthController.requireAdmin, adminController.getChallenges);
router.get('/admin/challenges/create', adminAuthController.requireAdmin, adminController.getCreateChallenge);
router.post('/admin/challenges/create', adminAuthController.requireAdmin, adminController.createChallenge);
router.get('/admin/challenges/:id/edit', adminAuthController.requireAdmin, adminController.getEditChallenge);
router.post('/admin/challenges/:id/edit', adminAuthController.requireAdmin, adminController.updateChallenge);
router.delete('/admin/challenges/:id', adminAuthController.requireAdmin, adminController.deleteChallenge);

module.exports = router;
