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
			user: res.user,
			title: 'SignMe Dashboard',
			message: 'Welcome Back!',
		});
	}
});

router.get('/documents', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		res.render('document/index', {
			user: res.user,
			title: 'SignMe Documents',
			message: 'Your Documents',
		});
	}
});

router.get('/inbox', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		res.render('request/inbox', {
			user: res.user,
			title: 'SignMe Inbox',
			message: 'Document Sign Inbox',
		});
	}
});

router.get('/requests/outbox', authenticateRoute, (req, res) => {
	if (!res.user) res.redirect('/login');
	else {
		res.render('request/outbox', {
			user: res.user,
			title: 'SignMe Outbox',
			message: 'Document Sign Outbox',
		});
	}
});

module.exports = router;
