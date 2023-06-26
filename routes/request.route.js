const express = require('express');
const router = express.Router();

const { authenticateRoute } = require('../middlewares/authenticate');

const BASE_URL = process.env.BASE_URL;

router.get('/outbox', authenticateRoute, (req, res) => {
	try {
		fetch(`${BASE_URL}/api/requests/outbox`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${req.cookies.token}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				res.render('request/outbox', {
					title: 'SignMe Outbox',
					message: 'User Outbox',
					user: res.user,
					requests: data,
				});
			});
	} catch (error) {
		console.error('Error getting user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

router.get('/inbox', authenticateRoute, (req, res) => {
	try {
		fetch(`${BASE_URL}/api/requests/inbox`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${req.cookies.token}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				res.render('request/inbox', {
					title: 'SignMe Inbox',
					message: 'User Inbox',
					user: res.user,
					requests: data,
				});
			});
	} catch (error) {
		console.error('Error getting user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

router.get('/create', authenticateRoute, (req, res) => {
	try {
		Promise.all([
			fetch(`${BASE_URL}/api/documents`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${req.cookies.token}`,
				},
			}).then((res) => res.json()),

			fetch(`${BASE_URL}/api/users`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${req.cookies.token}`,
				},
			}).then((res) => res.json()),
		])
			.then((data) => {
				res.render('request/create', {
					title: 'SignMe Create Request',
					message: 'Create Request',
					user: res.user,
					documents: data[0],
					users: data[1],
				});
			})
			.catch((error) => {
				console.error('Error getting user profile:', error);
				return res.status(500).json({ message: 'Internal server error' });
			});
	} catch (error) {
		console.error('Error getting user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

router.get('/edit/:id', authenticateRoute, (req, res) => {
	try {
		const urls = [
			`${BASE_URL}/api/documents`,
			`${BASE_URL}/api/users`,
			`${BASE_URL}/api/requests/${req.params.id}`,
		];

		Promise.all(
			urls.map((url) =>
				fetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${req.cookies.token}`,
					},
				}).then((res) => res.json())
			)
		)
			.then((data) => {
				res.render('request/edit', {
					title: 'SignMe Edit Request',
					message: 'Edit Request',
					user: res.user,
					documents: data[0],
					users: data[1],
					request: data[2],
				});
			})
			.catch((error) => {
				console.error('Error getting user profile:', error);
				return res.status(500).json({ message: 'Internal server error' });
			});
	} catch (error) {
		console.error('Error getting user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
