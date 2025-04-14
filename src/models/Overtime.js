const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Overtime = sequelize.define(
  "Overtime",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    hours: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "overtime",
    timestamps: false,
  }
);
  
  module.exports = Overtime;
