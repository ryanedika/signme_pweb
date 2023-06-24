const express = require('express');
const { authenticateToken } = require('../middlewares/authenticate');

const router = express.Router();
const UserController = require('../controllers/user.controller');

router.post('/register', UserController.registerUser);

router.post('/login', UserController.loginUser);

router.get('/profile/:id', authenticateToken, UserController.getUserProfile);

module.exports = router;
