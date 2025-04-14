const { LeaveRequest, LeaveBalance, User } = require("../models");
const { Op } = require("sequelize");

const initializeLeaveBalance = async (userId) => {
  try {
    let leaveBalance = await LeaveBalance.findOne({
      where: { user_id: userId },
    });
    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        user_id: userId,
        total_days: 12,
        used_days: 0,
      });
    }
    return leaveBalance;
  } catch (error) {
    throw new Error("Không thể khởi tạo số ngày nghỉ phép: " + error.message);
  }
};

const requestLeave = async (userId, leaveType, startDate, endDate, reason = 'Office') => {
  try {
    const leaveBalance = await initializeLeaveBalance(userId);
    
    if (leaveBalance.total_days <= 0) {
      throw new Error("Bạn không có đủ ngày phép.");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (leaveBalance.total_days < diffDays) {
      throw new Error("Bạn không đủ số ngày phép để nghỉ.");
    }
    const leaveRequest = await LeaveRequest.create({ 
      user_id: userId, 
      leave_type: leaveType, 
      start_date: startDate, 
      end_date: endDate, 
      status: "Pending",
      reason: reason 
    });
    return leaveRequest;
  } catch (error) {
    throw new Error(error.message);
  }
};

const approveLeave = async (requestId, status, rejectReason = null) => {
  try {
    const leaveRequest = await LeaveRequest.findByPk(requestId);
    if (!leaveRequest) {
      throw new Error("Đơn nghỉ phép không tồn tại.");
    }

    if (leaveRequest.status !== "Pending") {
      throw new Error("Đơn nghỉ phép này đã được xử lý trước đó.");
    }

    switch (status) {
      case "Approved":
        const leaveBalance = await LeaveBalance.findOne({ 
          where: { user_id: leaveRequest.user_id } 
        });
        const start = new Date(leaveRequest.start_date);
        const end = new Date(leaveRequest.end_date);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        if (leaveBalance.total_days < diffDays) {
          throw new Error("Không đủ ngày phép để phê duyệt.");
        }
        
        leaveBalance.total_days -= diffDays;
        await leaveBalance.save();
        break;

      case "Rejected":
        if (!rejectReason) {
          throw new Error("Vui lòng cung cấp lý do từ chối.");
        }
        break;

      default:
        throw new Error("Trạng thái không hợp lệ.");
    }

    leaveRequest.status = status;
    leaveRequest.reject_reason = rejectReason;
    await leaveRequest.save();
    return leaveRequest;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getLeaveBalance = async (userId) => {
  try {
    const leaveBalance = await LeaveBalance.findOne({ where: { user_id: userId } });
    return leaveBalance ? leaveBalance.total_days : 0;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllLeaveRequests = async () => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'department', 'position']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    return leaveRequests;
  } catch (error) {
    throw new Error("Không thể lấy danh sách yêu cầu nghỉ phép: " + error.message);
  }
};

const getUserLeaveRequests = async (userId) => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    return leaveRequests;
  } catch (error) {
    throw new Error("Không thể lấy danh sách yêu cầu nghỉ phép của bạn: " + error.message);
  }
};

module.exports = { 
  requestLeave, 
  approveLeave, 
  getLeaveBalance,
  initializeLeaveBalance,
  getAllLeaveRequests,
  getUserLeaveRequests
};
