const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		switch (file.fieldname) {
			case 'image':
				cb(null, 'uploads/images');
				break;
			case 'file':
				cb(null, 'uploads/documents');
				break;
			case 'signature':
				cb(null, 'uploads/signatures');
				break;
			default:
				cb(null, 'uploads/images');
				break;
		}
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now();
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	},
});

module.exports = {
	uploadImages: multer({ storage }).fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'signature', maxCount: 1 },
	]),
	uploadFile: multer({ storage }).single('file'),
};
