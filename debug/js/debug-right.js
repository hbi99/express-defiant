{
	gOptions: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
	init: function() {
		this.el = debug.body.find('.json-view');

		this.jsonEditor = CodeMirror.fromTextArea($('section.json-view textarea[name="json-data"]')[0], {
		        mode: 'application/ld+json',
				matchBrackets: true,
				autoCloseBrackets: true,
				lineWrapping: false,
				lineNumbers: true,
		        foldGutter: true,
		        gutters: this.gOptions
			});
		this.xmlEditor = CodeMirror.fromTextArea($('section.json-view textarea[name="xml-data"]')[0], {
		        mode: 'text/html',
				lineWrapping: false,
				lineNumbers: true,
		        foldGutter: true,
		        gutters: this.gOptions
			});

		this.jsonEditor.setOption('theme', 'emilia');
		this.jsonEditor.markers = [];
		this.xmlEditor.setOption('theme', 'felicia');
		this.xmlEditor.markers = [];

		var data = JSON.parse( this.jsonEditor.doc.getValue() );
		this.snapshot = Defiant.getSnapshot(data);

		data = Defiant.node.prettyPrint(JSON.toXML(data));
		this.xmlEditor.doc.setValue(data);
	},
	doEvent: function(event) {
		var self = debug.right,
			cmd  = (typeof(event) === 'string') ? event : event.type,
			cursor,
			line,
			xpath,
			editor,
			matches,
			trace,
			data;
		
		//console.log(cmd);
		switch(cmd) {
      		// custom events
			case 'clear-markers':
				self.jsonEditor.markers.map(m => m.clear());
				self.jsonEditor.markers = [];
				self.xmlEditor.markers.map(m => m.clear());
				self.xmlEditor.markers = [];
				break;
			case 'highlight-matches':
				xpath = arguments[1];
				editor = self.jsonEditor;
  				self.doEvent('clear-markers');

				try {
					matches = JSON.search(self.snapshot, xpath);
					trace = JSON.trace;
				} catch (err) {
					return;
				}

				trace.map(item => {
					const lineStart = item[0] - 1;
					const lineEnd = lineStart + item[1];
					const lstr = editor.doc.getLine( lineEnd );
					editor.markers.push( editor.markText({line: lineStart, ch: 0}, {line: lineEnd, ch: lstr.length}, {className: 'matched-json'}) );
				});
				break;
		}
	},
	lock: function() {
		this.jsonEditor.setOption('readOnly', 'nocursor');
	},
	gutter: function() {
		var current = this.jsonEditor.getOption('lineNumbers'),
			xMenu = Defiant.node.selectSingleNode(debug.ledger, '//menu[@action="right -g"]');
		
		this.jsonEditor.setOption('lineNumbers', !current);
		this.jsonEditor.setOption('foldGutter', !current);
		this.jsonEditor.setOption('gutters', current ? [] : this.gOptions);

		this.el.find('.view-foot .btn-gutter')[current ? 'removeClass' : 'addClass']('on');
		
		if (current) xMenu.removeAttribute('isChecked');
		else xMenu.setAttribute('isChecked', '1');
	},
	fontSize: function() {
		
	},
	mode: function(mode) {
		var container = this.el.find('.editor-container'),
			isCurrentXml = container.hasClass('show-xml');

		if (isCurrentXml) {
			container.removeClass('show-xml');
			debug.right.jsonEditor.refresh();
		} else {
			container.addClass('show-xml');
			debug.right.xmlEditor.refresh();
		}
	}
}