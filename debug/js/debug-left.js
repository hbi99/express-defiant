{
	gOptions: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
	init: function() {
		var self = debug.left;

		this.el = debug.body.find('.xslt-view');

		this.editor = CodeMirror.fromTextArea($('section.xslt-view textarea')[0], {
		        mode: 'text/html',
				lineWrapping: false,
				lineNumbers: true,
		        foldGutter: true,
		        gutters: this.gOptions
			});

		this.editor.setOption('theme', 'laura');
		this.editor.markers = [];

		// bind event handlers
		this.editor.on('cursorActivity', (event) => {
			event.type = 'cursorActivity';
			self.doEvent(event);
		});
	},
	doEvent: function(event) {
		var self = debug.left,
			cmd  = (typeof(event) === 'string') ? event : event.type,
			slice,
			selects,
			cursor,
			line,
			xpath,
			editor;
		
		//console.log(cmd);
		switch(cmd) {
  			// codemirror events
  			case 'cursorActivity':
				editor = self.editor;
  				cursor = event.doc.getCursor();
  				line = event.doc.getLine(cursor.line);
  				xpath = [];
  				// clear markers
  				self.doEvent('clear-markers');

  				slice = event.doc.getRange({line: 0, ch: 0}, {line: cursor.line-1});
  				slice = slice.replace(/<(.[^(><.)]+)(.+?)?>[\s\S]*?<\/\1>/mig, (match) => {
  					const nl = match.match(/\n/g);
  					return nl ? nl.map(i => '\n').join('') : '';
  				});
  				slice = slice.replace(/<.+?\/>/mig, '') +'\n'+ line;
  				selects = slice.split('\n');

				selects.map((item, index) => {
					if (!item.trim() || item.indexOf(' select="') < 0) return;
					const select = item.match(/ select="(.+?)"/i)[1];
  					const matchStart = item.indexOf(select);
  					const matchEnd = matchStart + select.length;
  					if (matchStart <= cursor.ch && matchEnd >= cursor.ch) {
						editor.markers.push( editor.markText({line: index, ch: matchStart}, {line: index, ch: matchEnd}, {className: 'matched-xpath'}) );
					}
					xpath.push(select);
				});

  				if (xpath.length) {
					debug.right.doEvent('highlight-matches', xpath.join('/'));
  				}
  				break;
      		// custom events
			case 'clear-markers':
				self.editor.markers.map(m => m.clear());
				self.editor.markers = [];
				break;
		}
	},
	gutter: function() {
		var current = this.editor.getOption('lineNumbers');
		this.editor.setOption('lineNumbers', !current);
		this.editor.setOption('foldGutter', !current);
		this.editor.setOption('gutters', current ? [] : this.gOptions);
	},
	locked: function() {
		var el = this.el.find('.view-foot .btn-locked'),
			current = el.hasClass('on');

		el[current ? 'removeClass' : 'addClass']('on');
	}
}