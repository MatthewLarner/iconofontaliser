var fs = require('fs'),
	glob = require('glob'),
	util = require('util'),
	jsonFormat = require('json-format'),
	config = {},
	svgPath = process.argv[2] || './';

function getFiles() {
	var charmap = [];
	glob('**/*.svg', null, function(error, files) {
		for (i=0; i< files.length; i++) {
			charmap.push({"unicode" : String.fromCharCode(i+197), "file": files[i]});
		}
		config.id = "cfc-icon";
		config.familyname = "CFC Icon Font";
		config.copyright = "PNI";
		config.charmap = charmap;
		fs.writeFile('config.json', jsonFormat(config), function(error) {
			console.log(error || 'done.');
		})
	});
};


module.exports = getFiles();
