const User = require('./user');
const Document = require('./document');
const Request = require('./request');

Document.belongsTo(User, {
	as: 'owner',
	foreignKey: 'owner_id',
});

Document.hasMany(Request, {
	as: 'requests',
	foreignKey: 'document_id',
	onDelete: 'CASCADE',
});

Request.belongsTo(User, {
	as: 'sender',
	foreignKey: 'sender_id',
});

Request.belongsTo(User, {
	as: 'receiver',
	foreignKey: 'receiver_id',
});

Request.belongsTo(Document, {
	as: 'document',
	foreignKey: 'document_id',
});

User.hasMany(Document, {
	as: 'documents',
	foreignKey: 'owner_id',
});

User.hasMany(Request, {
	as: 'sent',
	foreignKey: 'sender_id',
});

User.hasMany(Request, {
	as: 'received',
	foreignKey: 'receiver_id',
});

module.exports = {
	User,
	Document,
	Request,
};
