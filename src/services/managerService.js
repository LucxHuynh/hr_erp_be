const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { Op } = require("sequelize");

// Ensure associations are available
try {
  // Define the association between User and Attendance if not already defined elsewhere
  if (!User.associations.Attendances) {
    User.hasMany(Attendance, { 
      foreignKey: 'user_id', 
      sourceKey: 'id', 
      as: 'Attendances' 
    });
  }

  if (!Attendance.associations.User) {
    Attendance.belongsTo(User, { 
      foreignKey: 'user_id', 
      targetKey: 'id',
      as: 'User'
    });
  }
  
  console.log('✅ Manager service associations defined successfully');
} catch (error) {
  console.error('❌ Error defining associations in managerService:', error);
}

const managerService = {
  // /**
  //  * Mark an employee as absent
  //  * @param {Number} userId - The ID of the user to mark as absent
  //  * @param {String} date - Date string in YYYY-MM-DD format
  //  * @returns {Object} - The created attendance record
  //  */
  // markAbsent: async (userId, date) => {
  //   try {
  //     // Convert string date to Date object
  //     const absentDate = new Date(date);
  //     if (isNaN(absentDate.getTime())) {
  //       throw new Error('Invalid date format. Please use YYYY-MM-DD');
  //     }
      
  //     absentDate.setHours(0, 0, 0, 0);
      
  //     // Check if date is in the future
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
      
  //     if (absentDate > today) {
  //       throw new Error('Cannot mark absence for future dates');
  //     }
      
  //     // Check if attendance record already exists for this date
  //     const nextDay = new Date(absentDate);
  //     nextDay.setDate(absentDate.getDate() + 1);
      
  //     const existingRecord = await Attendance.findOne({
  //       where: {
  //         user_id: userId,
  //         check_in_time: {
  //           [Op.gte]: absentDate,
  //           [Op.lt]: nextDay
  //         }
  //       }
  //     });
      
  //   //   if (existingRecord) {
  //   //     throw new Error('Attendance record already exists for this date');
  //   //   }
      
  //     // Create absence record
  //     const attendance = await Attendance.create({
  //       user_id: userId,
  //       status: 'Absent',
  //       check_in_time: absentDate,
  //       check_out_time: absentDate, // Same as check-in for absence
  //       gps_location: null
  //     });
      
  //     return attendance;
  //   } catch (error) {
  //     console.error('❌ Error in managerService.markAbsent:', error);
  //     throw error;
  //   }
  // },

  /**
   * Get attendance records for all active users for today or a specified date
   * @param {String|null} date - Optional date string (YYYY-MM-DD)
   * @returns {Array} - Formatted user attendance records
   */
  getAllUsersAttendance: async (date = null) => {
    try {
      // Set default date to today if not provided
      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      console.log(`Retrieving attendance for date: ${targetDate.toISOString().split('T')[0]}`);
      
      // Step 1: Get all active users
      const users = await User.findAll({
        where: {
          isDelete: false,
          status: 'Active'
        },
        attributes: ['id', 'full_name', 'department', 'position', 'role'],
        order: [
          ['department', 'ASC'],
          ['full_name', 'ASC']
        ],
        raw: true // Return plain objects instead of model instances
      });
      
      console.log(`Found ${users.length} active users`);
      
      // Step 2: Get today's attendance records for all users
      const attendanceRecords = await Attendance.findAll({
        where: {
          check_in_time: {
            [Op.gte]: targetDate,
            [Op.lt]: nextDay
          }
        },
        raw: true // Return plain objects instead of model instances
      });
      
      console.log(`Found ${attendanceRecords.length} attendance records for today`);
      
      // Step 3: Create a map for quick lookup of attendance by user_id
      const attendanceByUser = {};
      attendanceRecords.forEach(record => {
        attendanceByUser[record.user_id] = record;
      });
      
      // Step 4: Combine user data with attendance data
      const formattedResults = users.map(user => ({
        id: user.id,
        full_name: user.full_name,
        department: user.department || 'Unassigned',
        position: user.position || 'N/A',
        role: user.role,
        attendance_status: attendanceByUser[user.id] ? attendanceByUser[user.id].status : 'Not Recorded',
        check_in_time: attendanceByUser[user.id] ? attendanceByUser[user.id].check_in_time : null,
        check_out_time: attendanceByUser[user.id] ? attendanceByUser[user.id].check_out_time : null
      }));
      
      return formattedResults;
    } catch (error) {
      console.error('❌ Error in managerService.getAllUsersAttendance:', error);
      throw error;
    }
  },
  
  /**
   * Get attendance statistics for dashboard
   * @param {String|null} date - Optional date string (YYYY-MM-DD)
   * @param {String|null} department - Optional department filter
   * @returns {Object} - Attendance statistics
   */
  // getAttendanceStats: async (date = null, department = null) => {
  //   try {
  //     // Set default date to today if not provided
  //     const targetDate = date ? new Date(date) : new Date();
  //     targetDate.setHours(0, 0, 0, 0);
      
  //     const nextDay = new Date(targetDate);
  //     nextDay.setDate(nextDay.getDate() + 1);
      
  //     // Build where clause for department filtering
  //     const whereClause = {
  //       isDelete: false,
  //       status: 'Active'
  //     };
      
  //     if (department) {
  //       whereClause.department = department;
  //     }
      
  //     // Get total active users
  //     const totalUsers = await User.count({
  //       where: whereClause
  //     });
      
  //     // Get attendance records for the day
  //     const attendanceWhere = {
  //       check_in_time: {
  //         [Op.gte]: targetDate,
  //         [Op.lt]: nextDay
  //       }
  //     };
      
  //     // If department filter is applied, get only users from that department
  //     let userIds = [];
  //     if (department) {
  //       const deptUsers = await User.findAll({
  //         attributes: ['id'],
  //         where: whereClause,
  //         raw: true
  //       });
  //       userIds = deptUsers.map(user => user.id);
        
  //       if (userIds.length > 0) {
  //         attendanceWhere.user_id = {
  //           [Op.in]: userIds
  //         };
  //       }
  //     }
      
  //     // Count users by attendance status
  //     const presentCount = await Attendance.count({
  //       where: {
  //         ...attendanceWhere,
  //         status: {
  //           [Op.in]: ['On time', 'Late']
  //         }
  //       }
  //     });
      
  //     const lateCount = await Attendance.count({
  //       where: {
  //         ...attendanceWhere,
  //         status: 'Late'
  //       }
  //     });
      
  //     const absentCount = await Attendance.count({
  //       where: {
  //         ...attendanceWhere,
  //         status: 'Absent'
  //       }
  //     });
      
  //     const leaveCount = await Attendance.count({
  //       where: {
  //         ...attendanceWhere,
  //         status: 'Leave'
  //       }
  //     });
      
  //     // Calculate not recorded (users with no attendance record for the day)
  //     const recordedCount = presentCount + absentCount + leaveCount;
  //     const notRecordedCount = totalUsers - recordedCount;
      
  //     // Format date for display
  //     const formattedDate = targetDate.toISOString().split('T')[0];
      
  //     return {
  //       date: formattedDate,
  //       department: department || 'All Departments',
  //       total_users: totalUsers,
  //       present_count: presentCount,
  //       on_time_count: presentCount - lateCount,
  //       late_count: lateCount,
  //       absent_count: absentCount,
  //       leave_count: leaveCount,
  //       not_recorded_count: notRecordedCount > 0 ? notRecordedCount : 0,
  //       attendance_rate: totalUsers > 0 ? (presentCount / totalUsers * 100).toFixed(2) : 0,
  //       punctuality_rate: presentCount > 0 ? ((presentCount - lateCount) / presentCount * 100).toFixed(2) : 0
  //     };
  //   } catch (error) {
  //     console.error('❌ Error in managerService.getAttendanceStats:', error);
  //     throw error;
  //   }
  // }
};

module.exports = managerService;