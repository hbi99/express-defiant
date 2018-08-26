'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const util = require('util');
const defiant = require('defiant.js');

const getFile = async (filepath) => {
	const readFile = util.promisify(fs.readFile);

	const buffer = await readFile(filepath);
	return buffer.toString("utf8");
};

const rebellious = {
	middleware: (options) => {
		//console.log(options);
		return (req, res, next) => {
			req.render = rebellious.render;
			rebellious.res = res;
			next();
		}
	},
	render: async (name, data) => {
		const file = await getFile('./example/views/index.xsl');

		await defiant.register_template(file);

		const body = await defiant.render(name, data);
		
		rebellious.res.send(body);
	}
};

exports = module.exports = rebellious;
