const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require("./User");
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const LeaveBalance = sequelize.define("LeaveBalance", {
  id: {
    type: DataTypes.STRING(16),
    primaryKey: true,
    defaultValue: () => generateRandomId(),
  },
  user_id: {
    type: DataTypes.STRING(16),
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: process.env.DEFAULT_LEAVE_DAYS || 12, // Lấy từ .env
  },
});

module.exports = LeaveBalance;
