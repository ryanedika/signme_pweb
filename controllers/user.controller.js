const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../middlewares/authenticate');
const { Op } = require('sequelize');

async function registerUser(req, res) {
	try {
		const { fullname, username, email, instance, password } = req.body;

		if (!fullname || !username || !email || !instance || !password) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const findUser = await User.findOne({
			where: {
				[Op.or]: [{ email: email }, { username: username }],
			},
		});

		if (findUser) {
			return res.status(409).json({
				message: 'User already exists',
				error: findUser.email === email ? 'Email already in use' : 'Username already in use',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await User.create({
			fullname,
			username,
			instance,
			email,
			password: hashedPassword,
		});

		const token = generateToken(newUser);
		return res
			.status(201)
			.cookie('token', token, { httpOnly: true })
			.json({ message: 'User created successfully', token });
	} catch (error) {
		console.error('Error registering user:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function loginUser(req, res) {
	try {
		const { email, password } = req.body;
		const findUser = await User.findOne({
			where: { email },
		});
		if (!findUser) return res.status(401).json({ message: 'Invalid credentials', error: 'User not found' });

		const validate = await bcrypt.compare(password, findUser.password);
		if (!validate) return res.status(401).json({ message: 'Invalid credentials', error: 'Incorrect password' });

		const token = generateToken(findUser);
		return res
			.status(201)
			.cookie('token', token, { httpOnly: true })
			.json({ message: 'User logged in successfully', token });
	} catch (error) {
		console.error('Error logging in user:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function getAllUser(req, res) {
	try {
		const currentUser = req.user;
		const user = await User.findByPk(currentUser.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json({ user });
	} catch (error) {
		console.error('Error retrieving current user:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function getUserProfile(req, res) {
	const { id } = req.params;

	try {
		const user = await User.findByPk(id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		return res.status(200).json({
			id: user.id,
			fullname: user.fullname,
			username: user.username,
			instance: user.instance,
			image: user.image,
			signature: user.signature,
			email: user.email,
		});
	} catch (error) {
		console.error('Error retrieving user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

module.exports = {
	registerUser,
	loginUser,
	getAllUser,
	getUserProfile,
};
