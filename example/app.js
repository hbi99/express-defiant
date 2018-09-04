'use strict';

const express = require('express')
const rebellious = require('..')
const app = express()

app.use(rebellious.mw({
	viewPath: './views',
	env: 'dev'
}));


app.get('/books', (req, res, next) => {
	const data = {
		books: require('./json/books.json'),
		author: require('./json/authors.json'),
		category: require('./json/categories.json')
	}
	req.render('books', data);
});

app.get('/movies', (req, res, next) => {
	req.render('movies');
});

app.get('/music', (req, res, next) => {
	req.render('music');
});

app.listen(3000)
