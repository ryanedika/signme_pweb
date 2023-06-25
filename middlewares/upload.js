const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = `uploads/${file.fieldname}`;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now();
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	},
});

const multerDoc = multer({
	storage: storage,
	limits: { fileSize: 5000000 },
	fileFilter: (req, file, cb) => {
		const filetypes = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
		if (mimetype && extname) return cb(null, true);
		cb('Error: File upload only supports the following filetypes - ' + filetypes);
	},
});

const multerImage = multer({
	storage: storage,
	limits: { fileSize: 2000000 },
	fileFilter: (req, file, cb) => {
		const filetypes = /jpeg|jpg|png|gif/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
		if (mimetype && extname) return cb(null, true);
		cb('Error: Image upload only supports the following filetypes - ' + filetypes);
	},
});

module.exports = {
	uploadImages: multerImage.fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'signature', maxCount: 1 },
	]),
	uploadFile: multerDoc.single('file'),
};
