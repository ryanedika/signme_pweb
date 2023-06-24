const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Document = sequelize.define(
	'Document',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		owner_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		file: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	}
);

Document.associate = (models) => {
	Document.belongsTo(models.User, {
		foreignKey: 'owner_id',
		as: 'owner',
	});
	Document.hasMany(models.Request, {
		foreignKey: 'document_id',
		as: 'requests',
	});
};

module.exports = Document;
