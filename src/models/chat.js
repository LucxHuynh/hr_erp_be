const { DataTypes, Sequelize } = require('sequelize');  // Add Sequelize import
const { sequelize } = require('../config/database'); 
const User = require('./User');
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const Chat = sequelize.define(
  "Chat",
  {
    id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      defaultValue: () => generateRandomId(),
    },
    sender_id: {
      type: DataTypes.STRING(16),
      references: { model: User, key: "id" },
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.STRING(16),
      references: { model: User, key: "id" },
      allowNull: false,
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  { tableName: "chats", timestamps: false }
);

module.exports = Chat;
