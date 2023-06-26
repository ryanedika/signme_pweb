const { Request, User, Document } = require('../models/models');
const { Op: Operands } = require('sequelize');

const { simpleTimeFormat } = require('../utilities/formatter');

const BASE_URL = process.env.BASE_URL;

async function getUserOutbox(req, res) {
	try {
		const { id } = res.user;

		const requests = await Request.findAll({
			where: { sender_id: id },
			include: [
				{
					model: User,
					as: 'receiver',
					attributes: ['id', 'fullname', 'image'],
				},
				{
					model: Document,
					as: 'document',
					attributes: ['id', 'title', 'description', 'file'],
				},
			],
		});

		requests.forEach((request) => {
			request.dataValues.receiver.image = `${BASE_URL}/${request.dataValues.receiver.image}`;
			request.dataValues.document.file = `${BASE_URL}/${request.dataValues.document.file}`;
			request.dataValues.created_at = simpleTimeFormat(request.dataValues.created_at);
			request.dataValues.updated_at = simpleTimeFormat(request.dataValues.updated_at);
		});

		return res.status(200).json(requests);
	} catch (error) {
		console.error('Error getting user requests:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function getUserInbox(req, res) {
	try {
		const { id } = res.user;

		const requests = await Request.findAll({
			where: { receiver_id: id, status: { [Operands.ne]: 'cancelled' } },
			include: [
				{
					model: User,
					as: 'sender',
					attributes: ['id', 'fullname', 'image'],
				},
				{
					model: Document,
					as: 'document',
					attributes: ['id', 'title', 'description', 'file'],
				},
			],
		});

		requests.forEach((request) => {
			request.dataValues.sender.image = `${BASE_URL}/${request.dataValues.sender.image}`;
			request.dataValues.document.file = `${BASE_URL}/${request.dataValues.document.file}`;
			request.dataValues.created_at = simpleTimeFormat(request.dataValues.created_at);
			request.dataValues.updated_at = simpleTimeFormat(request.dataValues.updated_at);
		});

		return res.status(200).json(requests);
	} catch (error) {
		console.error('Error getting user requests:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function createRequest(req, res) {
	try {
		const { id } = res.user;
		const { recipient, document } = req.body;

		Promise.all([User.findOne({ where: { id: recipient } }), Document.findOne({ where: { id: document } })]).then(
			async (data) => {
				const [recipient, document] = data;
				if (!recipient || !document) return res.status(404).json({ message: 'User or document not found' });
			}
		);

		const data = {
			sender_id: id,
			receiver_id: recipient,
			document_id: document,
		};

		await Request.create(data);
		return res.status(201).json({ message: 'Request created successfully' });
	} catch (error) {
		console.error('Error creating request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function getSingleOutbox(req, res) {
	try {
		const { id } = req.params;
		const { id: user_id } = res.user;

		const request = await Request.findOne({
			where: { id: id, sender_id: user_id },
			include: [
				{
					model: User,
					as: 'sender',
					attributes: ['id', 'fullname', 'image'],
				},
				{
					model: User,
					as: 'receiver',
					attributes: ['id', 'fullname', 'image'],
				},
				{
					model: Document,
					as: 'document',
					attributes: ['id', 'title', 'description', 'file'],
				},
			],
		});

		if (!request) return res.status(404).json({ message: 'Request not found' });

		request.dataValues.sender.image = `${BASE_URL}/${request.dataValues.sender.image}`;
		request.dataValues.receiver.image = `${BASE_URL}/${request.dataValues.receiver.image}`;
		request.dataValues.document.file = `${BASE_URL}/${request.dataValues.document.file}`;
		request.dataValues.created_at = simpleTimeFormat(request.dataValues.created_at);
		request.dataValues.updated_at = simpleTimeFormat(request.dataValues.updated_at);

		return res.status(200).json(request);
	} catch (error) {
		console.error('Error getting user request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function updateSingleOutbox(req, res) {
	try {
		const { id } = req.params;
		const { id: user_id } = res.user;
		const { recipient, document } = req.body;

		const request = await Request.findOne({ where: { id: id, sender_id: user_id } });
		if (!request) return res.status(404).json({ message: 'Request not found' });

		const data = {
			sender_id: user_id,
			receiver_id: recipient,
			document_id: document,
		};

		await request.update(data);
		return res.status(200).json({ message: 'Request updated successfully' });
	} catch (error) {
		console.error('Error updating user request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function cancelRequest(req, res) {
	try {
		const { id } = req.params;
		const { id: user_id } = res.user;

		const request = await Request.findOne({ where: { id: id, sender_id: user_id } });
		if (!request) return res.status(404).json({ message: 'Request not found' });

		await request.update({ status: 'cancelled' });
		return res.status(200).json({ message: 'Request cancelled successfully' });
	} catch (error) {
		console.error('Error cancelling user request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = {
	getUserOutbox,
	getUserInbox,
	createRequest,
	getSingleOutbox,
	updateSingleOutbox,
	cancelRequest,
};
