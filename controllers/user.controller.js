const bcrypt = require('bcrypt');
const { User } = require('../models/models');
const { Op: Operands } = require('sequelize');

const { unlinkSync } = require('fs');
const { generateToken } = require('../middlewares/authenticate');

const BASE_URL = process.env.BASE_URL;

async function registerUser(req, res) {
	try {
		const { fullname, username, email, instance, password } = req.body;

		if (!fullname || !username || !email || !instance || !password) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const findUser = await User.findOne({
			where: {
				[Operands.or]: [{ email: email }, { username: username }],
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

async function getUserProfile(req, res) {
	try {
		const { id } = res.user;

		const user = await User.findByPk(id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		return res.status(200).json({
			id: user.id,
			fullname: user.fullname,
			username: user.username,
			instance: user.instance,
			image: `${BASE_URL}/${user.image}`,
			signature: `${BASE_URL}/${user.signature}`,
			email: user.email,
		});
	} catch (error) {
		console.error('Error retrieving user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function updateUserProfile(req, res) {
	try {
		const { id } = res.user;
		const { fullname, username, email, instance } = req.body;
		const { image, signature } = req.files;

		const findUser = await User.findByPk(id);
		if (!findUser) return res.status(404).json({ message: 'User not found' });

		const data = {
			fullname,
			username,
			email,
			instance,
		};

		if (image) {
			data.image = image[0].path.replace(/\\/g, '/');
			findUser.image && unlinkSync(findUser.image);
		}

		if (signature) {
			data.signature = signature[0].path.replace(/\\/g, '/');
			findUser.signature && unlinkSync(findUser.signature);
		}

		const updatedUser = await findUser.update(data);
		const token = generateToken(updatedUser);

		return res
			.status(200)
			.cookie('token', token, { httpOnly: true })
			.json({ message: 'User profile updated successfully', token });
	} catch (error) {
		console.error('Error updating user profile:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function logoutUser(req, res) {
	try {
		return res.status(200).clearCookie('token').json({ message: 'User logged out successfully' });
	} catch (error) {
		console.error('Error logging out user:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function getAllUsers(req, res) {
	try {
		const users = await User.findAll({
			attributes: ['id', 'fullname', 'username', 'instance', 'email', 'image'],
		});

		return res.status(200).json(users);
	} catch (error) {
		console.error('Error getting all users:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

module.exports = {
	registerUser,
	loginUser,
	getUserProfile,
	logoutUser,
	updateUserProfile,
	getAllUsers,
};
