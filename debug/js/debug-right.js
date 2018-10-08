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

		this.xmlDoc = JSON.toXML(data);
		data = Defiant.node.prettyPrint(this.xmlDoc);
		this.xmlEditor.doc.setValue(data);

		this.locked();
		//this.mode();
	},
	doEvent: function(event) {
		var self = debug.right,
			cmd  = (typeof(event) === 'string') ? event : event.type,
			el,
			cursor,
			line,
			xpath,
			editor,
			matches,
			trace,
			docText,
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
				el = self.el.find('.editor-container');
				xpath = arguments[1];
				if (el.hasClass('show-xml')) {
					self.doEvent('highlight-xml-matches', xpath);
				} else {
					self.doEvent('highlight-json-matches', xpath);
				}
				break;
			case 'highlight-xml-matches':
				xpath = arguments[1];
				editor = self.xmlEditor;
  				self.doEvent('clear-markers');

  				docText = Defiant.node.prettyPrint(self.xmlDoc).replace(/\n {1,}/mg, '\n');
				matches = Defiant.node.selectNodes(self.xmlDoc, xpath)

				matches.map(item => {
					let node = '';
					let cIndex = 0;

					switch (item.nodeType) {
						case 1: // type: node
							node = Defiant.node.prettyPrint(item)
										.replace(/\n {1,}/mg, '\n')
										.replace(/ xmlns:d="defiant-namespace"/, '');
							cIndex = docText.indexOf(node);
							break;
						case 2: // type: attribute
							break;
						case 3: // type: text
							break;
						case 9: // type: text
							break;
					}
					const lineStart = docText.slice(0, cIndex).split('\n').length - 1;
					const lineEnd = lineStart + node.split('\n').length - 1;
					const lstr = editor.doc.getLine( lineEnd );
					editor.markers.push( editor.markText({line: lineStart, ch: 0}, {line: lineEnd, ch: lstr.length}, {className: 'matched-xml'}) );
				});
				break;
			case 'highlight-json-matches':
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
	gutter: function() {
		var current = this.jsonEditor.getOption('lineNumbers'),
			xMenu = Defiant.node.selectSingleNode(debug.ledger, '//menu[@action="right -g"]');
		
		this.jsonEditor.setOption('lineNumbers', !current);
		this.jsonEditor.setOption('foldGutter', !current);
		this.jsonEditor.setOption('gutters', current ? [] : this.gOptions);
		
		this.xmlEditor.setOption('lineNumbers', !current);
		this.xmlEditor.setOption('foldGutter', !current);
		this.xmlEditor.setOption('gutters', current ? [] : this.gOptions);

		this.el.find('.view-foot .btn-gutter')[current ? 'removeClass' : 'addClass']('on');
		
		if (current) xMenu.removeAttribute('isChecked');
		else xMenu.setAttribute('isChecked', '1');
	},
	locked: function() {
		var el = this.el.find('.view-foot .btn-locked'),
			current = el.hasClass('on');

		el[current ? 'removeClass' : 'addClass']('on');
		this.jsonEditor.setOption('readOnly', current ? '' : 'nocursor');
	},
	mode: function() {
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