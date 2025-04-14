const express = require('express');
const PayrollController = require('../controllers/payrollController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Lấy tất cả bảng lương (chỉ Admin & Accountant)
router.get('/all', authMiddleware, roleMiddleware(['Admin', 'Accountant']), PayrollController.getAllPayrolls);

// Tạo bảng lương (chỉ Admin & Accountant)
router.post('/create', authMiddleware, roleMiddleware(['Admin', 'Accountant']), PayrollController.createPayroll);

// Cập nhật bảng lương (chỉ Admin & Accountant)
router.put('/update/:payrollId', authMiddleware, roleMiddleware(['Admin', 'Accountant']), PayrollController.updatePayroll);

// Lấy lịch sử nhận lương của nhân viên (có thể lọc theo tháng)
router.get('/history/:employeeId/:month?', authMiddleware, PayrollController.getPayrollHistory);

// Thống kê lương
router.get('/statistics', authMiddleware, roleMiddleware(['Admin', 'Accountant']), PayrollController.getPayrollStatistics);

// Xuất bảng lương (PDF)
router.get('/export/:employeeId', authMiddleware, PayrollController.exportPayroll);

// Xóa bảng lương (chỉ Admin & Accountant)
router.delete('/delete/:payrollId', authMiddleware, roleMiddleware(['Admin', 'Accountant']), PayrollController.deletePayroll);

module.exports = router;