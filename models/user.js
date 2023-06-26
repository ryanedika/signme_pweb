const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const User = sequelize.define(
	'User',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		fullname: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				is: /^[a-zA-Z\s]+$/,
				len: [3, 50],
			},
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true,
			},
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		instance: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		signature: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	}
);

module.exports = User;
