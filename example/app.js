'use strict';

const express = require('express')
const rebellious = require('..')
const app = express()

app.use(rebellious.mw({
	viewPath: "./views"
}));


app.get('/books', (req, res, next) => {
	const data = require('./json/books.json');
	req.render('books', data);
});

app.get('/movies', (req, res, next) => {
	req.render('movies');
});

app.get('/music', (req, res, next) => {
	req.render('music');
});

app.listen(3000)
