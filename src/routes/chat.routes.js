const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/generate', verifyToken, controller.generateCode);
router.get('/chats', verifyToken, controller.getChats);
router.get('/chats/:id', verifyToken, controller.getChat);

module.exports = router;
