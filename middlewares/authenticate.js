const jwt = require('jsonwebtoken');

function generateToken(user) {
	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
			fullname: user.fullname,
			instance: user.instance,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '2h' }
	);
	return token;
}

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

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
		return next();
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			res.user = null;
			res.clearCookie('token');
			return next();
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
