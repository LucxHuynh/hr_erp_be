const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const crypto = require("crypto");

// Helper function to generate random string of length 16
const generateRandomId = () => {
    return crypto.randomBytes(8).toString("hex"); // 8 bytes = 16 hex characters
};

const Payroll = sequelize.define(
    "Payroll",
    {
        id: {
            type: DataTypes.STRING(16),
            primaryKey: true,
            defaultValue: () => generateRandomId(),
        },
        employee_id: {
            type: DataTypes.STRING(16),
            references: { model: User, key: "id" },
            allowNull: false,
        },
        base_salary: { type: DataTypes.FLOAT, allowNull: false },
        allowances: { type: DataTypes.FLOAT, defaultValue: 0 },
        deductions: { type: DataTypes.FLOAT, defaultValue: 0 },
        social_insurance: { type: DataTypes.FLOAT, defaultValue: 0 },
        health_insurance: { type: DataTypes.FLOAT, defaultValue: 0 },
        unemployment_insurance: { type: DataTypes.FLOAT, defaultValue: 0 },
        personal_income_tax: { type: DataTypes.FLOAT, defaultValue: 0 },
        total_deductions: { type: DataTypes.FLOAT, defaultValue: 0 },
        net_salary: { type: DataTypes.FLOAT, allowNull: false },
        pay_period: { type: DataTypes.STRING, allowNull: false },
        region: { type: DataTypes.STRING, defaultValue: 'I' },
        status: { type: DataTypes.STRING, defaultValue: 'Pending' },
        created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    },
    { tableName: "payrolls", timestamps: false }
);

module.exports = Payroll;
