const express = require('express');
const { authenticateToken } = require('../middlewares/authenticate');

const router = express.Router();
const UserController = require('../controllers/user.controller');
const { uploadImages } = require('../middlewares/upload');

router.post('/register', UserController.registerUser);

router.post('/login', UserController.loginUser);

router.get('/profile/:id', authenticateToken, UserController.getUserProfile);

router.post('/profile/:id', uploadImages, UserController.updateUserProfile);

router.post('/logout', UserController.logoutUser);

module.exports = router;
