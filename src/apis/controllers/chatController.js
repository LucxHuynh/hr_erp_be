const chatService = require('../../services/chatService');

class ChatController {
    async sendMessage(req, res) {
        try {
            const { receiver_id, message } = req.body;
            const sender_id = req.user.id;

            const chat = await chatService.sendMessage({
                sender_id,
                receiver_id,
                content: message,
                created_at: new Date()
            });

            // Sử dụng socket để gửi tin nhắn realtime
            const io = req.app.get('io');
            io.to(receiver_id.toString()).emit('receiveMessage', {
                ...chat.toJSON(),
                sender_id,
                receiver_id,
                message
            });

            res.status(201).json({
                success: true,
                data: chat
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to send message'
            });
        }
    }

    async getAllEmployees(req, res) {
        try {
          const currentUserId = req.user.id;
          const employees = await chatService.getAllEmployees(currentUserId);
          
          // Đảm bảo employees là một mảng
          if (!Array.isArray(employees)) {
            console.error('Employees is not an array:', employees);
            return res.status(200).json({
              success: true,
              data: [] // Trả về mảng rỗng nếu không phải là mảng
            });
          }
          
          res.status(200).json({
            success: true,
            data: employees
          });
        } catch (error) {
          console.error('Error fetching employees:', error);
          res.status(400).json({
            success: false,
            message: 'Failed to fetch employees'
          });
        }
      }

    async getMessages(req, res) {
        try {
            const { user1_id, user2_id } = req.params;
            const messages = await chatService.getMessages(user1_id, user2_id);
            
            // Đảm bảo messages là một mảng
            if (!Array.isArray(messages)) {
            console.error('Messages is not an array:', messages);
            return res.status(200).json({
                success: true,
                data: [] // Trả về mảng rỗng nếu không phải là mảng
            });
            }
            
            res.status(200).json({
            success: true,
            data: messages
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(400).json({
            success: false,
            message: 'Failed to fetch messages'
            });
        }
    }
      

    async markMessageAsRead(req, res) {
        try {
          const { messageId } = req.params;
          // Sửa lại để import Chat model đúng cách
          const Chat = require('../../models/chat');
          const message = await Chat.update(
            { read: true }, // Sửa is_read thành read để khớp với schema
            { where: { id: messageId } }
          );
      
          if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
          }
      
          res.status(200).json({ success: true, message: 'Message marked as read' });
        } catch (error) {
          console.error('Error marking message as read:', error);
          res.status(500).json({ success: false, message: 'Failed to mark message as read' });
        }
    }

    async getUserStatus(req, res) {
        try {
          const { userId } = req.params;
          // Cần định nghĩa connectedUsers hoặc lấy từ socket
          const io = req.app.get('io');
          const socketModule = require('../../socket');
          const connectedUsers = Array.from(socketModule.getConnectedUsers().values());
          const isOnline = connectedUsers.some(user => user.id === userId);
      
          res.status(200).json({ success: true, isOnline });
        } catch (error) {
          console.error('Error checking user status:', error);
          res.status(500).json({ success: false, message: 'Failed to check user status' });
        }
    }   
}

module.exports = new ChatController();