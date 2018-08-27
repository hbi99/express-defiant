"use strict";

const defiant = require("defiant.js");
const common = require("./src/common");

const rebellious = {
	mw: (settings) => {
		rebellious.settings = settings;

		const chokidar = require('chokidar');
		chokidar
			.watch('./views/*.{xsl,xslt}', {ignored: /(^|[\/\\])\../})
			.on('add', rebellious.register_templates)
			.on('unlink', rebellious.register_templates)
			.on('change', rebellious.register_templates);

		(async () => {
			await rebellious.register_templates(settings);
		})();

		return (req, res, next) => {
			req.render = rebellious.render;
			rebellious.res = res;
			next();
		}
	},
	register_templates: async () => {
		const files = await common.getFiles(rebellious.settings.viewPath);
		const xslt = await Promise.all(files.map(file => common.getFile(file)));

		await defiant.register_template(xslt.join("\n"));
	},
	render: async (name, data) => {
		const body = await defiant.render(name, data);
		rebellious.res.send(body);
	}
};

exports = module.exports = rebellious;
