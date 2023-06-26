const jwt = require('jsonwebtoken');
const BASE_URL = process.env.BASE_URL;

function generateToken(user) {
	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
			fullname: user.fullname,
			instance: user.instance,
			image: `${BASE_URL}/${user.image}`,
			signature: `${BASE_URL}/${user.signature}`,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '2h' }
	);
	return token;
}

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

	if (!token) {
		res.user = null;
		res.clearCookie('token');
		res.status(401).json({ message: 'Access token not found' });
		return;
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			res.user = null;
			res.clearCookie('token');
			res.status(403).json({ message: 'Invalid access token' });
			return;
		}

		res.user = user;
		next();
	});
}

function authenticateRoute(req, res, next) {
	const token = req.cookies.token;

	if (!token) {
		res.user = null;
		res.clearCookie('token');
		req.url === '/login' || req.url === '/register' ? next() : res.redirect('/');
		return;
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			res.user = null;
			res.clearCookie('token');
			req.url === '/login' || req.url === '/register' ? next() : res.redirect('/');
			return;
		}

		res.user = user;
		next();
	});
}

module.exports = {
	generateToken,
	authenticateToken,
	authenticateRoute,
};
