const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const managerController = require('../controllers/managerController');
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/**
 * @route   POST /api/attendance/check-in
 * @desc    Record employee check-in with GPS location
 * @access  Private (All authenticated users)
 */
router.post('/check-in',
  authMiddleware,
  attendanceController.arrive);

/**
 * @route   POST /api/attendance/check-out
 * @desc    Record employee check-out
 * @access  Private (All authenticated users)
 */
router.post('/check-out',
  authMiddleware,
  attendanceController.leave);

/**
 * @route   GET /api/attendance/user/:userId
 * @desc    Get attendance records for a specific user
 * @access  Private (Own records or Admin/Manager)
 */
router.get('/currentuser',
  authMiddleware,
  attendanceController.getCurrentUserStatus);

router.get('/user',
  authMiddleware,
  roleMiddleware(['Manager', 'Admin']),
  managerController.getAllUsersAttendance);

/**
 * @route   GET /api/attendance/history
 * @desc    Get current user's attendance history
 * @access  Private (All authenticated users)
 */
router.get('/history',
  authMiddleware,
  attendanceController.getUserAttendanceHistory);

module.exports = router;