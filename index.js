"use strict";

const defiant = require("defiant.js");
const common = require("./src/common");
const chokidar = require("chokidar");

const rebellious = {
	mw: (settings) => {

		(async () => {
			rebellious.settings = settings;
			await rebellious.registerTemplates();

			chokidar
				.watch(`${rebellious.settings.viewPath}/*.{xsl,xslt}`, {ignored: /(^|[\/\\])\../})
				.on("unlink", rebellious.registerTemplates)
				.on("change", rebellious.registerTemplates);
		})();

		return (req, res, next) => {
			req.render = rebellious.render;
			rebellious.req = req;
			rebellious.res = res;
			next();
		}
	},
	registerTemplates: async (event) => {
		const files = await common.getFiles(rebellious.settings.viewPath);
		const xslt = await Promise.all(files.map(file => common.getFile(file)));

		await defiant.register_template(xslt.join("\n"));
	},
	render: async (name, data) => {
		let body;
		
		if (rebellious.req.query.debug === 'true') {
			body = await common.getFile(`${__dirname}/debug/debug.min.htm`);
		} else {
			try {
				body = await defiant.render(name, data);
			} catch (err) {
				body = "error: "+ err.toString();
			}
		}

		rebellious.res.send(body);
	}
};

exports = module.exports = rebellious;
