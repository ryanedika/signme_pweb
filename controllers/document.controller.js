const Document = require('../models/document');

const { unlinkSync } = require('fs');
const { Op: Operands } = require('sequelize');
const path = require('path');
const BASE_URL = process.env.BASE_URL;

function simpleTimeFormat(date) {
	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};

	return new Intl.DateTimeFormat('en-US', options).format(date);
}

async function getUserDocuments(req, res) {
	try {
		const { id } = res.user;

		const documents = await Document.findAll({
			where: { owner_id: id },
		});

		documents.forEach((document) => {
			document.dataValues.created_at = simpleTimeFormat(document.dataValues.created_at);
			document.dataValues.updated_at = simpleTimeFormat(document.dataValues.updated_at);
		});

		return res.status(200).json(documents);
	} catch (error) {
		console.error('Error getting user documents:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function uploadUserDocuments(req, res) {
	try {
		const { id } = res.user;
		const { path } = req.file;
		const { title, description } = req.body;

		const data = {
			title,
			description,
			file: path.replace(/\\/g, '/'),
			owner_id: id,
		};

		const document = await Document.create(data);
		return res.status(201).json(document);
	} catch (error) {
		console.error('Error uploading user documents:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

const getSingleDocument = async (req, res) => {
	try {
		const { id } = res.user;
		const { id: document_id } = req.params;

		const document = await Document.findOne({
			where: { id: document_id, owner_id: id },
		});

		document.dataValues.created_at = simpleTimeFormat(document.dataValues.created_at);
		document.dataValues.updated_at = simpleTimeFormat(document.dataValues.updated_at);
		document.dataValues.file = `${BASE_URL}/${document.dataValues.file}`;

		if (!document) return res.status(404).json({ message: 'Document not found' });
		return res.status(200).json(document);
	} catch (error) {
		console.error('Error getting single document:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

const updateSingleDocument = async (req, res) => {
	try {
		const { id } = res.user;
		const { id: document_id } = req.params;
		const { title, description } = req.body;

		const document = await Document.findOne({
			where: { id: document_id, owner_id: id },
		});
		if (!document) return res.status(404).json({ error: 'Document not found' });

		const data = {
			title,
			description,
		};

		if (req.file) {
			unlinkSync(document.file);
			console.log(req.file);
			const { path } = req.file;
			data.file = path.replace(/\\/g, '/');
		}

		await document.update(data);
		return res.status(200).json({ message: 'Document updated successfully' });
	} catch (error) {
		console.error('Error updating single document:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

const deleteSingleDocument = async (req, res) => {
	try {
		const { id } = res.user;
		const { id: document_id } = req.params;

		const document = await Document.findOne({
			where: { id: document_id, owner_id: id },
		});

		if (!document) return res.status(404).json({ message: 'Document not found' });

		unlinkSync(document.file);
		await document.destroy();
		return res.status(200).json({ message: 'Document deleted successfully' });
	} catch (error) {
		console.error('Error deleting single document:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

module.exports = {
	getUserDocuments,
	uploadUserDocuments,
	getSingleDocument,
	updateSingleDocument,
	deleteSingleDocument,
};
