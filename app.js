const path = require('path');
const createError = require('http-errors');

const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const { mkdirSync, existsSync } = require('fs');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const folders = ['uploads', 'uploads/images', 'uploads/documents', 'uploads/signatures'];
folders.forEach((folder) => {
	if (!existsSync(folder)) mkdirSync(folder);
});

// static files
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// live reload
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

const reload = livereload.createServer();
reload.server.once('connection', () => {
	setTimeout(() => {
		reload.refresh('/');
	}, 100);
});

reload.watch(path.join(__dirname, 'public'));
reload.watch(path.join(__dirname, 'views'));
app.use(connectLiveReload());

// routes
const apiRoute = require('./routes/api.route');
const indexRoute = require('./routes/index.route');
const userRouter = require('./routes/user.route');

app.use('/', indexRoute);
app.use('/api', apiRoute);
app.use('/user', userRouter);

app.use(function (req, res, next) {
	next(createError(404));
});

app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
