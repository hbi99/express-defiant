{
	init: function() {
		this.jsonEditor = CodeMirror.fromTextArea($('section.json-view textarea[name="json-data"]')[0], {
		        mode: 'application/ld+json',
				matchBrackets: true,
		        autoCloseBrackets: true,
				lineWrapping: false,
				lineNumbers: true
			});
		this.xmlEditor = CodeMirror.fromTextArea($('section.json-view textarea[name="xml-data"]')[0], {
		        mode: 'text/html',
				lineWrapping: false,
				lineNumbers: true,
			});
console.log(1);
		this.jsonEditor.setOption('theme', 'emilia');
		this.jsonEditor.markers = [];
		this.xmlEditor.setOption('theme', 'felicia');
		this.xmlEditor.markers = [];

		var data = JSON.parse( this.jsonEditor.doc.getValue() );
		data = Defiant.node.prettyPrint(JSON.toXML(data));
		this.xmlEditor.doc.setValue(data);
	},
	doEvent: function(event) {
		var self = debug.right,
			cmd  = (typeof(event) === 'string') ? event : event.type;
		
		//console.log(cmd);
		switch(cmd) {
      		// custom events
			case 'clear-markers':
				self.jsonEditor.markers.map(m => m.clear());
				self.jsonEditor.markers = [];
				self.xmlEditor.markers.map(m => m.clear());
				self.xmlEditor.markers = [];
				break;
		}
	},
	gutter: () => {
		
	},
	fontSize: () => {
		
	},
	mode: (mode) => {
		console.log(mode);
	}
}