const { Document, Request } = require('../models/models');

const { unlinkSync } = require('fs');
const { simpleTimeFormat } = require('../utilities/formatter');

const BASE_URL = process.env.BASE_URL;

async function getUserDocuments(req, res) {
	try {
		const { id } = res.user;

		const documents = await Document.findAll({
			where: { owner_id: id },
		});

		documents.forEach((document) => {
			document.dataValues.file = `${BASE_URL}/${document.dataValues.file}`;
			document.dataValues.created_at = simpleTimeFormat(document.dataValues.created_at);
			document.dataValues.updated_at = simpleTimeFormat(document.dataValues.updated_at);
		});

		return res.status(200).json(documents);
	} catch (error) {
		console.error('Error getting user documents:', error);
		return res.status(500).json({ error: 'Internal server error' });
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

		await Document.create(data);
		return res.status(201).json({ message: 'Document updated successfully' });
	} catch (error) {
		console.error('Error uploading user documents:', error);
		return res.status(500).json({ error: 'Internal server error' });
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

		if (!document) return res.status(404).json({ error: 'Document not found' });
		return res.status(200).json(document);
	} catch (error) {
		console.error('Error getting single document:', error);
		return res.status(500).json({ error: 'Internal server error' });
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
			include: [
				{
					model: Request,
					as: 'requests',
				},
			],
		});
		if (!document) return res.status(404).json({ error: 'Document not found' });
		if (document.requests.length > 0)
			return res.status(400).json({ error: 'Cannot delete document that ascociated with requests' });

		unlinkSync(document.file);

		await document.destroy();
		return res.status(200).json({ message: 'Document deleted successfully' });
	} catch (error) {
		console.error('Error deleting single document:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

module.exports = {
	getUserDocuments,
	uploadUserDocuments,
	getSingleDocument,
	updateSingleDocument,
	deleteSingleDocument,
};
