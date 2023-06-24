const express = require('express');
const { authenticateRoute } = require('../middlewares/authenticate');
const router = express.Router();

const BASE_URL = process.env.BASE_URL;

router.get('/profile', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		try {
			fetch(`${BASE_URL}/api/profile/${res.user.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${req.cookies.token}`,
				},
			})
				.then((res) => res.json())
				.then((data) => {
					console.log(data);
					res.render('user/profile', {
						title: 'SignMe Profile',
						user: data,
					});
				});
		} catch (error) {
			console.error('Error getting user profile:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
});

module.exports = router;
