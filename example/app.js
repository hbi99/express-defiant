'use strict';

const express = require('express')
const rebellious = require('..')
const app = express()

app.use(rebellious({
	env: 'dev',
	viewPath: './views'
}));


app.get('/tests', (req, res, next) => {
	const data = {
		books: require('./json/books.json'),
		authors: require('./json/authors.json'),
		categories: require('./json/categories.json')
	}
	req.render('tests', data);
});

app.get('/books', (req, res, next) => {
	const data = require('./json/books.json')
	req.render('books', data);
});

app.get('/authors', (req, res, next) => {
	const data = require('./json/authors.json')
	req.render('authors', data);
});

app.listen(3000)
