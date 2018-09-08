
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
		init: function() {
			// fast references
			this.win = $(window);
			this.doc = $(document);
			this.body = $('body');

			// init sub-objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}

			//this.doEvent('initiate-editors');
		},
		doEvent: function(event, el, orgEvent) {
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
						editor = self.xslEditor;
      					const matchStart = line.indexOf(xpath[1]);
      					const matchEnd = matchStart + xpath[1].length;
      					if (matchStart <= cursor.ch && matchEnd >= cursor.ch) {
							editor.markers.push( editor.markText({line: cursor.line, ch: matchStart}, {line: cursor.line, ch: matchEnd}, {className: 'matched-xpath'}) );
      						
      						self.doEvent('highlight-matches', xpath[1]);
      					}
      				}
      				break;
      			// custom events
				case 'highlight-matches':
					xpath = el;
					data = JSON.parse( debug.jsonEditor.doc.getValue() );
					try {
						matches = JSON.search(data, xpath);
						trace = JSON.trace;
					} catch (err) {
						return;
					}
					
      				self.doEvent('clear-right-markers');
					editor = self.jsonEditor;

					trace.map(item => {
						const lineStart = item[0] - 1;
						const lineEnd = lineStart + item[1];
						const lstr = editor.doc.getLine( lineEnd );
						self.xslEditor.markers.push( editor.markText({line: lineStart, ch: 0}, {line: lineEnd, ch: lstr.length}, {className: 'matched-json'}) );
					});
					break;
			}
		},
		left: @@include('./debug-left.js'),
		right: @@include('./debug-right.js'),
		shell: @@include('./debug-shell.js'),
		contextmenu: @@include('./debug-context.js')
	};

	window.debug = debug;
	$(window).ready(() => debug.init());

})(window, document);