"use strict";

const defiant = require("defiant.js");
const common = require("./src/common");
const { basename } = require('path');
const chokidar = require("chokidar");

const rebellious = {
	mw: (settings) => {

		if (settings.env === "dev") {
			const express = require("express");
			const app = express();
			app.use(express.static("../debug"));
			app.listen(3001);
		}

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
		const viewPath = rebellious.settings.viewPath;
		const files = await common.getFiles(viewPath);
		const xslt = await Promise.all(files.map(file => common.getFile(file)));

		rebellious.allXslt = xslt.map((file, index) => {
			const filename = basename(files[index]);
			return `<!-- START: ${filename} -->\n${file}\n<!-- END: ${filename} -->\n`;
		}).join("\n");

		await defiant.register_template(rebellious.allXslt);
	},
	render: async (name, data) => {
		let body;
		
		if (rebellious.req.query.debug === "true") {
			body = await common.getFile(`${__dirname}/debug/build/index.htm`);
			body = body.replace(/<\!-- XSLT-Placeholder -->/i, `<!-- ACTIVE: ${name} -->\n${rebellious.allXslt}`);
			body = body.replace(/<\!-- JSON-Placeholder -->/i, JSON.stringify(data, false, '   '));
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

exports = module.exports = rebellious.mw;
