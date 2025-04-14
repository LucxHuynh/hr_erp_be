const attendanceService = require('../../services/attendanceService');

const attendanceController = {
  /**
   * Handle employee check-in
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  arrive: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        console.error('❌ Authentication error: User ID not found in request.');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated',
        });
      }

      const userId = req.user.id; 
      const { gps_location } = req.body;
      const check_in_time = new Date(); 

      // Validate GPS location format
      if (!gps_location || !gps_location.latitude || !gps_location.longitude) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GPS format. Must include latitude and longitude.',
        });
      }

      const attendance = await attendanceService.arrive(userId, check_in_time, gps_location);
      
      return res.status(200).json({
        success: true,
        message: 'Check-in recorded successfully',
        data: attendance,
      });
    } catch (error) {
      console.error('❌ Error recording check-in:', error);
      return res.status(400).json({
        success: false,
        message: 'Error recording check-in: ' + error.message,
      });
    }
  },

  /**
   * Handle employee check-out
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  leave: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated',
        });
      }
      
      const userId = req.user.id;
      const check_out_time = new Date();
      const { gps_location } = req.body;
      
      const attendance = await attendanceService.leave(userId, check_out_time, gps_location);
      
      return res.status(200).json({
        success: true,
        message: 'Check-out recorded successfully',
        data: attendance
      });
    } catch (error) {
      console.error('❌ Error recording check-out:', error);
      return res.status(400).json({
        success: false,
        message: 'Error recording check-out: ' + error.message,
      });
    }
  },

  /**
   * Get current user's attendance status for today
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCurrentUserStatus: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated'
        });
      }
      
      const userId = req.user.id;
      
      // Call the service method to get the user's current status
      const statusData = await attendanceService.getCurrentUserStatus(userId);
      
      return res.status(200).json({
        success: true,
        message: 'User attendance status retrieved successfully',
        data: statusData
      });
    } catch (error) {
      console.error('❌ Error retrieving user status:', error);
      return res.status(400).json({
        success: false,
        message: 'Error retrieving user status: ' + error.message
      });
    }
  },

  /**
   * Get current user's attendance history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserAttendanceHistory: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated'
        });
      }
      
      const userId = req.user.id;
      const { startDate, endDate, status } = req.query;
      
      // Get all attendance history for the user
      const attendanceHistory = await attendanceService.getUserAttendanceHistory(
        userId, 
        startDate, 
        endDate, 
        status
      );
      
      return res.status(200).json({
        success: true,
        message: 'User attendance history retrieved successfully',
        count: attendanceHistory.length,
        data: attendanceHistory
      });
    } catch (error) {
      console.error('❌ Error retrieving user attendance history:', error);
      return res.status(400).json({
        success: false,
        message: 'Error retrieving user attendance history: ' + error.message
      });
    }
  }
};

module.exports = attendanceController;