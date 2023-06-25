const express = require('express');
const { authenticateRoute } = require('../middlewares/authenticate');
const router = express.Router();

const BASE_URL = process.env.BASE_URL;

router.get('/', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		try {
			fetch(`${BASE_URL}/api/documents`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${req.cookies.token}`,
				},
			})
				.then((res) => res.json())
				.then((data) => {
					res.render('document/index', {
						title: 'SignMe Documents',
						message: 'SignMe Documents',
						user: res.user,
						documents: data,
					});
				});
		} catch (error) {
			console.error('Error getting user profile:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
});

router.get('/create', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		res.render('document/create', {
			title: 'SignMe Create Document',
			message: 'Create Document',
			user: res.user,
		});
	}
});

router.get('/view/:id', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		try {
			fetch(`${BASE_URL}/api/documents/${req.params.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${req.cookies.token}`,
				},
			})
				.then((res) => res.json())
				.then((data) => {
					res.render('document/view', {
						title: 'SignMe View Document',
						message: 'View Document',
						user: res.user,
						document: data,
					});
				});
		} catch (error) {
			console.error('Error getting user profile:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
});

router.get('/edit/:id', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		try {
			fetch(`${BASE_URL}/api/documents/${req.params.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${req.cookies.token}`,
				},
			})
				.then((res) => res.json())
				.then((data) => {
					res.render('document/edit', {
						title: 'SignMe Edit Document',
						message: 'Edit Document',
						user: res.user,
						document: data,
					});
				});
		} catch (error) {
			console.error('Error getting user profile:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
});

module.exports = router;
