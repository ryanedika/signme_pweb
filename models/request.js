const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Request = sequelize.define(
	'Request',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		sender_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		receiver_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		document_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'pending',
		},
	},
	{
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	}
);

module.exports = Request;
