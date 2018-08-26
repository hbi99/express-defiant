'use strict';

var express = require('express')
var rebellious = require('..')

var app = express()


app.use(rebellious.middleware({
	viewPath: "./views"
}))


app.get('/', (ctx, res) => {
	const data = {
		"store": {
			"book": [{
				"title": "The Lord of the Rings",
				"author": "J. R. R. Tolkien",
				"category": "Fiction",
				"price": 22.99,
			   },
			   {
			   	"title": "Moby Dick",
				"author": "Herman Melville",
				"category": "Fiction",
				"price": 8.99
			   }]
		   	}
		};
	ctx.render('index', data);
})

app.listen(3000)
