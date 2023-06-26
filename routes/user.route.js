const express = require('express');
const router = express.Router();

const { authenticateRoute } = require('../middlewares/authenticate');

const BASE_URL = process.env.BASE_URL;

router.get('/profile', authenticateRoute, (req, res) => {
	try {
		fetch(`${BASE_URL}/api/profile`, {
			method: 'GET',
			headers: {
				contentType: 'application/json',
				Authorization: `Bearer ${req.cookies.token}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				res.render('user/profile', {
					title: 'SignMe Profile',
					user: data,
				});
			});
	} catch (error) {
		console.error('Error getting user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
