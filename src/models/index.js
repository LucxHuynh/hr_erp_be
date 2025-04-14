const { sequelize } = require('../config/database');
const Attendance = require('./Attendance');
const Overtime = require('./Overtime');
const User = require('./User');
const Project = require("./Project");
const Task = require("./Task");
const ProjectMember = require("./ProjectMember"); // Import model mới
const Payroll = require('./payroll');
const Chat = require('./chat');
const LeaveRequest = require('./leaveRequest');
const LeaveBalance = require('./leaveBalance');
const Performance_reviews = require('./performance_reviews');

// **Thiết lập quan hệ**
User.hasMany(Task, { foreignKey: "user_id" });
Task.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });

User.hasMany(ProjectMember, { foreignKey: "user_id" });
ProjectMember.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(ProjectMember, { foreignKey: "project_id" });
ProjectMember.belongsTo(Project, { foreignKey: "project_id" });

// Thiết lập quan hệ giữa User và LeaveRequest
User.hasMany(LeaveRequest, { foreignKey: "user_id" });
LeaveRequest.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Thiết lập quan hệ giữa User và LeaveBalance
User.hasOne(LeaveBalance, { foreignKey: "user_id" });
LeaveBalance.belongsTo(User, { foreignKey: "user_id" });

// Thiết lập quan hệ giữa User và Payroll
User.hasMany(Payroll, { foreignKey: "employee_id", as: "payrolls" });
Payroll.belongsTo(User, { foreignKey: "employee_id", as: "employee" });

// **Thiết lập quan hệ**
// User.hasMany(Task, { foreignKey: "user_id" });
// Task.belongsTo(User, { foreignKey: "user_id" });

// Project.hasMany(Task, { foreignKey: "project_id" });
// Task.belongsTo(Project, { foreignKey: "project_id" });

// User.hasMany(ProjectMember, { foreignKey: "user_id" });
// ProjectMember.belongsTo(User, { foreignKey: "user_id" });

// Project.hasMany(ProjectMember, { foreignKey: "project_id" });
// ProjectMember.belongsTo(Project, { foreignKey: "project_id" });
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    await sequelize.sync({ alter: true }); // Cập nhật bảng nếu thay đổi
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

syncDatabase();

module.exports = { User, Project, Task, ProjectMember, Payroll, Chat, LeaveRequest, LeaveBalance, Performance_reviews };
