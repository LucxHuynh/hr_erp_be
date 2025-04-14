const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const Performance_reviews = sequelize.define(
  "Performance_reviews",
  {
    id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      defaultValue: () => generateRandomId(),
    },
    user_id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    review_period: {
      type: DataTypes.ENUM("Monthly", "Quarterly", "Yearly"),
      defaultValue: "Monthly",
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    reviewer_id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    comments: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "performance_reviews",
    timestamps: false,
  }
);

module.exports = Performance_reviews;