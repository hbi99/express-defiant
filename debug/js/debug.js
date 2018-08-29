
@@include('./jquery.js')
@@include('./codemirror/codemirror.js')
@@include('./codemirror/xml.js')
@@include('./codemirror/javascript.js')

((window, document) => {
	'use strict';

	var debug = {
		init: () => {
			
			CodeMirror.fromTextArea($('section.xslt-view textarea')[0], {
			        mode: "text/html",
					lineWrapping: false,
					lineNumbers: true
				})
				.setOption("theme", 'darcula');
			
			CodeMirror.fromTextArea($('section.json-view textarea')[0], {
			        mode: "application/ld+json",
					matchBrackets: true,
			        autoCloseBrackets: true,
					lineWrapping: false,
					lineNumbers: true
				})
				.setOption("theme", 'ambiance');

		}
	};

	$(window).ready(() => debug.init());

})(window, document);