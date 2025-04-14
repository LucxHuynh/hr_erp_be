const express = require('express');
const ChatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Gửi tin nhắn
router.post('/send', authMiddleware, ChatController.sendMessage);

// Lấy lịch sử chat giữa 2 người
router.get('/messages/:user1_id/:user2_id', authMiddleware, ChatController.getMessages);

// Lấy danh sách chat gần đây
// router.get('/chat-list', authMiddleware, ChatController.getChatList);

// Lấy danh sách nhân viên có thể chat
router.get('/employees', authMiddleware, ChatController.getAllEmployees);

// // Đánh dấu tin nhắn đã đọc
router.put('/mark-read/:messageId', authMiddleware, ChatController.markMessageAsRead);

// // Kiểm tra trạng thái online
router.get('/status/:userId', authMiddleware, ChatController.getUserStatus);

module.exports = router;