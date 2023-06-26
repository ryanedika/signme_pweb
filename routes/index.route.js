const express = require('express');
const router = express.Router();

const { authenticateRoute } = require('../middlewares/authenticate');

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
	res.render('dashboard', {
		user: res.user,
		title: 'SignMe Dashboard',
		message: 'Welcome Back!',
	});
});

module.exports = router;
