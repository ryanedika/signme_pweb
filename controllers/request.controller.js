const { Request, User, Document } = require('../models/models');
const sequelize = require('sequelize');
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

		if (!requests) return res.status(404).json({ message: 'No requests found' });

		requests.forEach((request) => {
			request.dataValues.receiver.image = request.dataValues.receiver.image
				? `${BASE_URL}/${request.dataValues.receiver.image}`
				: null;
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
			request.dataValues.sender.image = request.dataValues.sender.image
				? `${BASE_URL}/${request.dataValues.sender.image}`
				: null;
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

		Promise.all([
			User.findOne({ where: { id: recipient } }),
			Document.findOne({
				where: {
					[Operands.and]: [
						{ id: document },
						sequelize.literal(
							`id NOT IN (SELECT document_id FROM Requests WHERE sender_id = ${id} OR receiver_id = ${id})`
						),
					],
				},
			}),
		]).then(async (data) => {
			const [recipient, document] = data;
			if (!recipient || !document) return res.status(404).json({ message: 'User or document not found' });

			const newRequest = {
				sender_id: id,
				receiver_id: recipient.dataValues.id,
				document_id: document.dataValues.id,
			};

			await Request.create(newRequest);
			return res.status(201).json({ message: 'Request created successfully' });
		});
	} catch (error) {
		console.error('Error creating request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function getSingleRequest(req, res) {
	try {
		const { id } = req.params;
		const { id: user_id } = res.user;

		const request = await Request.findOne({
			where: {
				id: id,
				[Operands.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
			},
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

		request.dataValues.sender.image = request.dataValues.sender.image
			? `${BASE_URL}/${request.dataValues.sender.image}`
			: null;

		request.dataValues.receiver.image = request.dataValues.receiver.image
			? `${BASE_URL}/${request.dataValues.receiver.image}`
			: null;

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

		const request = await Request.findOne({ where: { id: id, sender_id: user_id, status: 'pending' } });
		if (!request) return res.status(404).json({ message: 'Request not found or status is not pending' });

		await request.update({ status: 'cancelled' });
		return res.status(200).json({ message: 'Request cancelled successfully' });
	} catch (error) {
		console.error('Error cancelling user request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

const { PDFDocument } = require('pdf-lib');
const { readFileSync, writeFileSync } = require('fs');

async function confirmRequest(req, res) {
	try {
		const { id } = req.params;
		const { id: user_id } = res.user;

		const user = await User.findOne({ where: { id: user_id } });
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (!user.dataValues.signature) return res.status(404).json({ message: 'User signature not found' });

		const request = await Request.findOne({
			where: { id: id, receiver_id: user_id, status: 'pending' },
			include: [{ model: Document, as: 'document' }],
		});
		if (!request) return res.status(404).json({ message: 'Request not found or status is not pending' });

		// read pdf file and add user signature to it
		const pdf = await PDFDocument.load(readFileSync(request.dataValues.document.file));

		// read signature image [iamge file]
		const signature = readFileSync(user.dataValues.signature);
		const ext = user.dataValues.signature.split('.').pop();

		// add user signature in the first page of the pdf file
		// const pngImage = await pdf.embedPng(signature);
		// const pngDims = pngImage.scale(0.5);
		// const pages = pdf.getPages();
		// const firstPage = pages[0];

		// file can be jpeg, png, or jpg
		const image = ext === 'png' ? await pdf.embedPng(signature) : await pdf.embedJpg(signature);
		const pages = pdf.getPages();
		const firstPage = pages[0];

		firstPage.drawImage(image, {
			x: firstPage.getWidth() - 100,
			y: firstPage.getHeight() - 100,
			width: 100,
			height: 100,
		});

		// save the pdf file
		const pdfBytes = await pdf.save();
		writeFileSync(request.dataValues.document.file, pdfBytes);

		await request.update({ status: 'confirmed' });
		return res.status(200).json({ message: 'Request confirmed successfully' });
	} catch (error) {
		console.error('Error confirming user request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function rejectRequest(req, res) {
	try {
		const { id } = req.params;
		const { id: user_id } = res.user;

		const request = await Request.findOne({ where: { id: id, receiver_id: user_id, status: 'pending' } });
		if (!request) return res.status(404).json({ message: 'Request not found or status is not pending' });

		await request.update({ status: 'rejected' });
		return res.status(200).json({ message: 'Request rejected successfully' });
	} catch (error) {
		console.error('Error rejecting user request:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = {
	getUserOutbox,
	getUserInbox,
	createRequest,
	getSingleRequest,
	updateSingleOutbox,
	cancelRequest,
	confirmRequest,
	rejectRequest,
};
