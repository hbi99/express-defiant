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
			cursor,
			line,
			xpath,
			editor;
		
		//console.log(cmd);
		switch(cmd) {
  			// codemirror events
  			case 'cursorActivity':
  				cursor = event.doc.getCursor();
  				line = event.doc.getLine(cursor.line);
  				xpath = line.match(/select="(.+?)"/i);

  				self.doEvent('clear-markers');

  				if (xpath) {
					editor = self.editor;
  					const matchStart = line.indexOf(xpath[1]);
  					const matchEnd = matchStart + xpath[1].length;
  					if (matchStart <= cursor.ch && matchEnd >= cursor.ch) {
						editor.markers.push( editor.markText({line: cursor.line, ch: matchStart}, {line: cursor.line, ch: matchEnd}, {className: 'matched-xpath'}) );
  						
  						debug.right.doEvent('highlight-matches', xpath[1]);
  					}
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