
const fs = require('fs');
const { promisify } = require('util');
const { resolve } = require('path');
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);

const getFile = async (filepath) => {
	const buffer = await readFile(filepath);
	return buffer.toString("utf8");
};

async function getFiles(dir) {
	const subdirs = await readdir(dir);
	const files = await Promise.all(subdirs.map(async (subdir) => {
		const res = resolve(dir, subdir);
		return (await stat(res)).isDirectory() ? getFiles(res) : res;
	}));
	return files.reduce((a, f) => a.concat(f), []);
}

module.exports = {
	getFile,
	getFiles,
};
