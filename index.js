'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const util = require('util');

const xDefiant = {
	middleware: (options) => {
		//console.log(options);
		return (req, res, next) => {
			req.render = xDefiant.render;
			xDefiant.res = res;
			next();
		}
	},
	render: function(name, data) {
		xDefiant.res.send('123');
	}
};

exports = module.exports = xDefiant;
