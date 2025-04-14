const mongoose = require('mongoose');
const { INTEGER } = require('sequelize');

const EmployeeDocumentSchema = new mongoose.Schema({
  employeeId: { type: String, ref: "Employee", required: true }, // Changed from Number to String
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Đường dẫn file
  fileType: { type: String, enum: ["pdf", "jpg", "png"], required: true },
  uploadedAt: { type: Date, default: Date.now },
  isDelete: { type: Boolean, default: false },
});

module.exports = mongoose.model('EmployeeDocument', EmployeeDocumentSchema);