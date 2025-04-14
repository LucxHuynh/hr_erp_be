const leaveService = require("../../services/leaveService");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Yêu cầu nghỉ phép
const requestLeave = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token đã decode
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Thêm validation
    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: leaveType, startDate và endDate là bắt buộc"
      });
    }

    const leaveRequest = await leaveService.requestLeave(userId, leaveType, startDate, endDate, reason);
    res.status(200).json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Duyệt hoặc từ chối đơn nghỉ phép
const approveLeave = async (req, res) => {
  try {
    const { requestId, status } = req.body; // status: 'Approved' hoặc 'Rejected'
    const result = await leaveService.approveLeave(requestId, status);
    return res.status(200).json({ message: `Đơn nghỉ phép đã được ${status.toLowerCase()}.`, result });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Lấy số ngày phép còn lại của nhân viên
const getLeaveBalance = async (req, res) => {
  try {
    // Lấy userId từ token đã decode
    const userId = req.user.id;
    const balance = await leaveService.getLeaveBalance(userId);
    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Thêm controller để khởi tạo số ngày nghỉ phép
const initializeUserLeaveBalance = async (req, res) => {
  try {
    const { userId, initialDays } = req.body;
    const leaveBalance = await leaveService.initializeLeaveBalance(userId, initialDays || 12);
    res.status(200).json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cập nhật controller xử lý đơn nghỉ phép
const processLeaveRequest = async (req, res) => {
  try {
    const { requestId, status, rejectReason } = req.body;
    
    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết'
      });
    }

    if (status === 'Rejected' && !rejectReason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    const leaveRequest = await leaveService.approveLeave(requestId, status, rejectReason);
    
    res.status(200).json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy tất cả đơn nghỉ phép (cho admin và manager)
const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await leaveService.getAllLeaveRequests();
    res.status(200).json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy đơn nghỉ phép của user hiện tại
const getUserLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaveRequests = await leaveService.getUserLeaveRequests(userId);
    res.status(200).json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { 
  requestLeave, 
  approveLeave, 
  getLeaveBalance, 
  initializeUserLeaveBalance, 
  processLeaveRequest,
  getAllLeaveRequests,
  getUserLeaveRequests
};
