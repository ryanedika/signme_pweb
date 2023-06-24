const express = require('express');
const { authenticateRoute } = require('../middlewares/authenticate');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index', {
		title: 'SignMe',
	});
});

router.get('/login', authenticateRoute, (req, res) => {
	if (res.user) res.redirect('/dashboard');
	else {
		res.render('login', {
			title: 'SignMe Login',
		});
	}
});

router.get('/register', authenticateRoute, (req, res) => {
	if (res.user) res.redirect('/dashboard');
	else {
		res.render('register', {
			title: 'SignMe Register',
		});
	}
});

router.get('/dashboard', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		res.render('dashboard', {
			title: 'SignMe Dashboard',
			user: res.user,
		});
	}
});

module.exports = router;
