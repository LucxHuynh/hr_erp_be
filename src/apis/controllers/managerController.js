const managerService = require('../../services/managerService');

const managerController = {
  // /**
  //  * Mark an employee as absent
  //  * @param {Object} req - Express request object
  //  * @param {Object} res - Express response object
  //  */
  // markAbsent: async (req, res) => {
  //   try {
  //     if (!req.user) {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Unauthorized: User not authenticated',
  //       });
  //     }
      
  //     const { userId, date } = req.body;
      
  //     if (!userId || !date) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Both userId and date are required'
  //       });
  //     }
      
  //     // Check if admin or authorized role
  //     if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
  //       return res.status(403).json({
  //         success: false,
  //         message: 'Unauthorized: Only managers and admins can mark users as absent'
  //       });
  //     }
      
  //     const attendance = await managerService.markAbsent(userId, date);
      
  //     return res.status(200).json({
  //       success: true,
  //       message: 'User marked as absent successfully',
  //       data: attendance
  //     });
  //   } catch (error) {
  //     console.error('❌ Error marking absence:', error);
  //     return res.status(400).json({
  //       success: false,
  //       message: 'Error marking absence: ' + error.message,
  //     });
  //   }
  // },

  /**
   * Get attendance records for all users for a specific date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllUsersAttendance: async (req, res) => {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // Check for admin or manager role
      if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only managers and admins can view all users attendance'
        });
      }
      
      // Get date from query params, default to today if not provided
      const { date } = req.query;
      
      console.log(`🔍 Fetching attendance for date: ${date || 'today'}`);
      
      // Get all users with their attendance data
      const usersAttendance = await managerService.getAllUsersAttendance(date);
      
      console.log(`✅ Retrieved ${usersAttendance.length} user attendance records`);
      
      // Structure the response
      return res.status(200).json({
        success: true,
        message: 'Users attendance data retrieved successfully',
        count: usersAttendance.length,
        date: date || new Date().toISOString().split('T')[0],
        data: usersAttendance
      });
    } catch (error) {
      console.error('❌ Error retrieving users attendance:', error);
      return res.status(400).json({
        success: false,
        message: 'Error retrieving users attendance: ' + error.message
      });
    }
  },
};

module.exports = managerController;