const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const crypto = require("crypto");

const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.STRING(16), // Change to STRING with length 10
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
    },
    status: {
      type: DataTypes.ENUM("On time", "Late", "Absent", "Leave"),
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gps_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "attendance",
    timestamps: false,
  }
);

module.exports = Attendance;
