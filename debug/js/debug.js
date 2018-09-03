
@@include('./jquery.js')
@@include('./defiant.js')
@@include('./codemirror/codemirror.js')
@@include('./codemirror/xml.js')
@@include('./codemirror/javascript.js')

((window, document) => {
	'use strict';

	// enable search trace, for visual highlighting
	Defiant.env = 'development';

	var debug = {
		init: () => {
			var self = debug;

			// fast references
			self.win = $(window);
			self.doc = $(document);
			self.body = $('body');

			self.doEvent('initiate-editors');
		},
		doEvent: (event, el, orgEvent) => {
			var self = debug,
				cmd  = (typeof(event) === 'string') ? event : event.type,
				data,
				matches,
				trace,
				editor,
				cursor,
				line,
				xpath,
				i, il,
				srcEl;
			//console.log(cmd);
			switch(cmd) {
      			// native events
      			case 'click':
					srcEl = $(event.target);
					cmd = srcEl.attr('href') || srcEl.attr('data-cmd');
					if (!cmd) {
						srcEl = srcEl.hasClass('nolink') || srcEl.attr('data-cmd') ? srcEl : srcEl.parents('.nolink, [data-cmd]');
						if (!srcEl.length) return;
					}

					if (['input'].indexOf(event.target.nodeName.toLowerCase()) === -1) {
						event.stopPropagation();
						event.preventDefault();
					}
					if (srcEl.hasClass('disabled')) return;

					cmd = srcEl.attr('href') || srcEl.attr('data-cmd');
					return self.doEvent(cmd, srcEl, event);
      			// codemirror events
      			case 'cursorActivity':
      				cursor = event.doc.getCursor();
      				line = event.doc.getLine(cursor.line);
      				xpath = line.match(/select="(.+?)"/i);

      				self.doEvent('clear-left-markers');

      				if (xpath) {
						editor = self.leftEditor;
      					const matchStart = line.indexOf(xpath[1]);
      					const matchEnd = matchStart + xpath[1].length;
      					if (matchStart <= cursor.ch && matchEnd >= cursor.ch) {
							editor.markers.push( editor.markText({line: cursor.line, ch: matchStart}, {line: cursor.line, ch: matchEnd}, {className: 'matched-xpath'}) );
      						
      						self.doEvent('highlight-matches', xpath[1]);
      					}
      				}
      				break;
      			// custom events
				case 'initiate-editors':
					self.leftEditor = CodeMirror.fromTextArea($('section.xslt-view textarea')[0], {
					        mode: 'text/html',
							lineWrapping: false,
							lineNumbers: true,
						});
					self.rightEditor = CodeMirror.fromTextArea($('section.json-view textarea')[0], {
					        mode: 'application/ld+json',
							matchBrackets: true,
					        autoCloseBrackets: true,
							lineWrapping: false,
							lineNumbers: true
						});

					self.leftEditor.setOption('theme', 'laura');
					self.leftEditor.markers = [];
					self.rightEditor.setOption('theme', 'emilia');
					self.rightEditor.markers = [];

					// bind event handlers
					/**/
					self.leftEditor.on('cursorActivity', (event) => {
						event.type = 'cursorActivity';
						self.doEvent(event);
					});

					self.leftEditor.focus();
					self.leftEditor.setCursor({line: 3, ch: 27});
					break;
				case 'clear-left-markers':
					self.leftEditor.markers.map(m => m.clear());
					self.leftEditor.markers = [];
					break;
				case 'clear-right-markers':
					self.rightEditor.markers.map(m => m.clear());
					self.rightEditor.markers = [];
					break;
				case 'highlight-matches':
					xpath = el;
					data = JSON.parse( debug.rightEditor.doc.getValue() );
					try {
						matches = JSON.search(data, xpath);
						trace = JSON.trace;
					} catch (err) {
						return;
					}
					
      				self.doEvent('clear-right-markers');
					editor = self.rightEditor;

					trace.map(item => {
						const lineStart = item[0] - 1;
						const lineEnd = lineStart + item[1];
						const lstr = editor.doc.getLine( lineEnd );
						self.leftEditor.markers.push( editor.markText({line: lineStart, ch: 0}, {line: lineEnd, ch: lstr.length}, {className: 'matched-json'}) );
					});
					break;
			}
		}
	};

	window.debug = debug;
	$(window).ready(() => debug.init());

})(window, document);