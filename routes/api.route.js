const express = require('express');
const router = express.Router();

const { uploadImages, uploadFile } = require('../middlewares/upload');
const { authenticateToken } = require('../middlewares/authenticate');

const UserController = require('../controllers/user.controller');
const DocumentController = require('../controllers/document.controller');
const RequestController = require('../controllers/request.controller');

// user

router.post('/register', UserController.registerUser);

router.post('/login', UserController.loginUser);

router.post('/logout', UserController.logoutUser);

router.get('/profile', authenticateToken, UserController.getUserProfile);

router.put('/profile', authenticateToken, uploadImages, UserController.updateUserProfile);

router.get('/users', authenticateToken, UserController.getAllUsers);

// document

router.get('/documents', authenticateToken, DocumentController.getUserDocuments);

router.post('/documents', authenticateToken, uploadFile, DocumentController.uploadUserDocuments);

router.get('/documents/:id', authenticateToken, DocumentController.getSingleDocument);

router.put('/documents/:id', authenticateToken, uploadFile, DocumentController.updateSingleDocument);

router.delete('/documents/:id', authenticateToken, DocumentController.deleteSingleDocument);

// request

router.get('/requests/outbox', authenticateToken, RequestController.getUserOutbox);

router.get('/requests/inbox', authenticateToken, RequestController.getUserInbox);

router.post('/requests', authenticateToken, RequestController.createRequest);

router.get('/requests/:id', authenticateToken, RequestController.getSingleRequest);

router.put('/requests/:id', authenticateToken, RequestController.updateSingleOutbox);

router.post('/requests/:id/cancel', authenticateToken, RequestController.cancelRequest);

router.post('/requests/:id/confirm', authenticateToken, RequestController.confirmRequest);

router.post('/requests/:id/reject', authenticateToken, RequestController.rejectRequest);

module.exports = router;
