const User = require('./user');
const Document = require('./document');
const Request = require('./request');

Document.belongsTo(User, {
	foreignKey: 'owner_id',
	as: 'owner',
});

Document.hasMany(Request, {
	foreignKey: 'document_id',
	as: 'requests',
});

Request.belongsTo(User, {
	foreignKey: 'sender_id',
	as: 'sender',
});

Request.belongsTo(User, {
	foreignKey: 'receiver_id',
	as: 'receiver',
});

Request.belongsTo(Document, {
	foreignKey: 'document_id',
	as: 'document',
});

User.hasMany(Document, {
	foreignKey: 'owner_id',
	as: 'documents',
});

User.hasMany(Request, {
	foreignKey: 'sender_id',
	as: 'sent',
});

User.hasMany(Request, {
	foreignKey: 'receiver_id',
	as: 'received',
});

module.exports = {
	User,
	Document,
	Request,
};
