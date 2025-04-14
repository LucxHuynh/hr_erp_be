const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Changed from Number to String
  type: {
    type: String,
    enum: [
      "ACCOUNT_CREATED",
      "PROJECT_ASSIGNED",
      "TASK_UPDATED",
      "PROJECT_REMOVED",
    ],
    required: true,
  },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
