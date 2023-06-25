const express = require('express');
const { authenticateToken } = require('../middlewares/authenticate');

const router = express.Router();
const { uploadImages, uploadFile } = require('../middlewares/upload');

const UserController = require('../controllers/user.controller');
const DocumentController = require('../controllers/document.controller');

router.post('/register', UserController.registerUser);

router.post('/login', UserController.loginUser);

router.post('/logout', UserController.logoutUser);

router.get('/profile', authenticateToken, UserController.getUserProfile);

router.post('/profile', authenticateToken, uploadImages, UserController.updateUserProfile);

router.get('/documents', authenticateToken, DocumentController.getUserDocuments);

router.post('/documents', authenticateToken, uploadFile, DocumentController.uploadUserDocuments);

router.get('/documents/:id', authenticateToken, DocumentController.getSingleDocument);

router.put('/documents/:id', authenticateToken, uploadFile, DocumentController.updateSingleDocument);

router.delete('/documents/:id', authenticateToken, DocumentController.deleteSingleDocument);

module.exports = router;
