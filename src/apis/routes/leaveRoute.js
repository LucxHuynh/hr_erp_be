const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Route test
router.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

// Route yêu cầu nghỉ phép - tất cả user đều có thể yêu cầu
router.post(
  "/request", 
  authMiddleware, 
  leaveController.requestLeave
);

// Route khởi tạo số ngày nghỉ phép - chỉ admin
router.post(
  '/initialize-balance',
  authMiddleware,
  roleMiddleware(['Admin']),
  leaveController.initializeUserLeaveBalance
);

// Route xử lý đơn nghỉ phép - manager hoặc admin
router.post(
  '/process-request',
  authMiddleware,
  roleMiddleware(['Manager', 'Admin']),
  leaveController.processLeaveRequest
);

// Route lấy số ngày nghỉ phép còn lại - user đã đăng nhập
router.get(
  "/balance", 
  authMiddleware, 
  leaveController.getLeaveBalance
);

// Route lấy tất cả đơn nghỉ phép - cho admin và manager
router.get(
  "/all-requests", 
  authMiddleware, 
  roleMiddleware(['Manager', 'Admin']),
  leaveController.getAllLeaveRequests
);

// Route lấy đơn nghỉ phép của user hiện tại
router.get(
  "/my-requests", 
  authMiddleware, 
  leaveController.getUserLeaveRequests
);

module.exports = router;