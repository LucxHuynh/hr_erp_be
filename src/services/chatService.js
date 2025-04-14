const Chat = require('../models/chat');
const User = require('../models/User');
const { Op } = require('sequelize');

const chatService = {
    sendMessage: async (messageData) => {
        try {
            const chat = await Chat.create({
                sender_id: messageData.sender_id,
                receiver_id: messageData.receiver_id,
                message: messageData.content,
                created_at: messageData.created_at
            });
            return chat;
        } catch (error) {
            throw error;
        }
    },

    getMessages: async (userId1, userId2) => {
        try {
          console.log(`Fetching messages between ${userId1} and ${userId2}`);
          const messages = await Chat.findAll({
            where: {
              [Op.or]: [
                { sender_id: userId1, receiver_id: userId2 },
                { sender_id: userId2, receiver_id: userId1 }
              ]
            },
            order: [['timestamp', 'ASC']]
          });
          
          console.log(`Found ${messages.length} messages`);
          return messages;
        } catch (error) {
          console.error('Error fetching messages:', error);
          throw error;
        }
    },

    getChatList: async (user_id) => {
        return await Chat.findAll({
            where: {
                [Op.or]: [
                    { sender_id: user_id },
                    { receiver_id: user_id }
                ]
            },
            attributes: ['sender_id', 'receiver_id'],
            group: ['sender_id', 'receiver_id']
        });
    },

    getAllEmployees: async (currentUserId) => {
        try {
            return await User.findAll({
                where: {
                    id: { [Op.ne]: currentUserId }
                },
                attributes: ['id', 'full_name', 'email', 'position']
            });
        } catch (error) {
            throw error;
        }
    }

};

module.exports = chatService;
