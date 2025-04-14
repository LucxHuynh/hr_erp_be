const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { Op } = require("sequelize");

const attendanceService = {
  arrive: async (userId, check_in_time, gps_location) => {
    try {

      // Validate user ID
      if (!userId) {
        throw new Error('UserId is required');
      }

      // Validate GPS location
      if (!gps_location || typeof gps_location !== 'object') {
        throw new Error('Valid GPS location object is required');
      }

      // Create a clean GPS object to ensure we only store what we need
      const locationData = {
        latitude: parseFloat(gps_location.latitude),
        longitude: parseFloat(gps_location.longitude)
      };

      // Add optional accuracy if provided
      if (gps_location.accuracy) {
        locationData.accuracy = parseFloat(gps_location.accuracy);
      }

      // Define cutoff time (8:00 AM)
      const cutoffTime = new Date(check_in_time);
      cutoffTime.setHours(8, 0, 0, 0);

      // Determine check-in status
      let status = check_in_time > cutoffTime ? 'Late' : 'On time';

      // Check if user already has a check-in for today
      const today = new Date(check_in_time);
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingAttendance = await Attendance.findOne({
        where: {
          user_id: userId,
          check_in_time: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      });

      // if (existingAttendance) {
      //   throw new Error('You have already checked in today');
      // }

      // Create attendance record
      const attendance = await Attendance.create({
        user_id: userId,
        status,
        check_in_time, 
        gps_location: locationData,
        check_out_time: null
      });

      console.log('✅ Check-in recorded:', attendance.toJSON());

      return attendance;
    } catch (error) {
      console.error('❌ Error in attendanceService.arrive:', error);
      throw error;
    }
  },
  
  leave: async (userId, check_out_time, gps_location) => {
    try {
      // Find the most recent attendance record for the user without checkout time
      const attendance = await Attendance.findOne({
        where: {
          user_id: userId,
          check_out_time: null
        },
        order: [['check_in_time', 'DESC']]
      });
      
      if (!attendance) {
        throw new Error('No active check-in found. Please check in first.');
      }

      // Format GPS location if provided
      let locationData = attendance.gps_location;
      if (gps_location && typeof gps_location === 'object') {
        locationData = {
          ...locationData,
          checkout_latitude: parseFloat(gps_location.latitude),
          checkout_longitude: parseFloat(gps_location.longitude)
        };
        
        if (gps_location.accuracy) {
          locationData.checkout_accuracy = parseFloat(gps_location.accuracy);
        }
      }
      
      // Update checkout time and location
      attendance.check_out_time = check_out_time;
      attendance.gps_location = locationData;
      
      await attendance.save();

      return attendance;
    } catch (error) {
      console.error('❌ Error in attendanceService.leave:', error);
      throw error;
    }
  },

  /**
   * Get current user's attendance status for today
   * @param {String} userId - The ID of the user to check
   * @returns {Object} - User's attendance status for today
   */

  getCurrentUserStatus: async (userId) => {
    try {
      if (!userId) {
        throw new Error('UserId is required');
      }

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find today's attendance record for the user
      const attendance = await Attendance.findOne({
        where: {
          user_id: userId,
          check_in_time: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        order: [['check_in_time', 'DESC']]
      });
      
      // Return different responses based on attendance status
      if (!attendance) {
        return {
          is_checked_in: false,
          is_checked_out: false,
          status: 'Not Checked In',
          message: 'You haven\'t checked in today',
          attendance_data: null,
          today_date: today.toISOString().split('T')[0]
        };
      }
      
      if (attendance.check_out_time) {
        return {
          is_checked_in: true,
          is_checked_out: true,
          status: attendance.status,
          message: 'You have completed your check-in/out for today',
          attendance_data: {
            check_in_time: attendance.check_in_time,
            check_out_time: attendance.check_out_time,
            status: attendance.status,
            id: attendance.id
          },
          today_date: today.toISOString().split('T')[0]
        };
      }
      
      return {
        is_checked_in: true,
        is_checked_out: false,
        status: attendance.status,
        message: 'You\'re currently checked in',
        attendance_data: {
          check_in_time: attendance.check_in_time,
          status: attendance.status,
          id: attendance.id
        },
        today_date: today.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('❌ Error in attendanceService.getCurrentUserStatus:', error);
      throw error;
    }
  },

  /**
   * Get all attendance history for a user
   * @param {String} userId - User ID to get history for
   * @param {String} startDate - Optional filter by start date (YYYY-MM-DD)
   * @param {String} endDate - Optional filter by end date (YYYY-MM-DD)
   * @param {String} status - Optional filter by status
   * @returns {Array} - All attendance records matching filters
   */
  getUserAttendanceHistory: async (userId, startDate = null, endDate = null, status = null) => {
    try {
      if (!userId) {
        throw new Error('UserId is required');
      }
        
      // Build where clause
      const whereClause = {
        user_id: userId
      };
        
      // Add date range filter if provided
      if (startDate || endDate) {
        whereClause.check_in_time = {};
          
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          whereClause.check_in_time[Op.gte] = start;
        }
          
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          whereClause.check_in_time[Op.lte] = end;
        }
      }
        
      // Add status filter if provided
      if (status) {
        whereClause.status = status;
      }
        
      // Get all records matching the criteria, ordered by date (most recent first)
      const attendanceRecords = await Attendance.findAll({
        where: whereClause,
        order: [['check_in_time', 'DESC']],
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'full_name', 'department', 'position']
          }
        ]
      });
        
      // Format the records for better readability
      const formattedRecords = attendanceRecords.map(record => {
        // Get plain object
        const attendance = record.toJSON ? record.toJSON() : record;
        const user = attendance.User || {};
          
        // Calculate duration if both check-in and check-out times exist
        let duration = null;
        if (attendance.check_in_time && attendance.check_out_time) {
          const checkIn = new Date(attendance.check_in_time);
          const checkOut = new Date(attendance.check_out_time);
          const durationMs = checkOut - checkIn;
            
          // Format as hours and minutes
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          duration = `${hours}h ${minutes}m`;
        }
          
        return {
          id: attendance.id,
          date: new Date(attendance.check_in_time).toISOString().split('T')[0],
          day_of_week: new Date(attendance.check_in_time).toLocaleDateString('en-US', { weekday: 'long' }),
          check_in_time: attendance.check_in_time,
          check_out_time: attendance.check_out_time || null,
          status: attendance.status,
          duration: duration,
          user_name: user.full_name,
          department: user.department || 'Not assigned',
          position: user.position || 'Not assigned'
        };
      });
        
      return formattedRecords;
    } catch (error) {
      console.error('❌ Error in attendanceService.getUserAttendanceHistory:', error);
      throw error;
    }
  }
};

module.exports = attendanceService;
