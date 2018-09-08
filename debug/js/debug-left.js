{
	init: function() {
		var self = debug.left;

		this.editor = CodeMirror.fromTextArea($('section.xslt-view textarea')[0], {
		        mode: 'text/html',
				lineWrapping: false,
				lineNumbers: true,
			});

		this.editor.setOption('theme', 'laura');
		this.editor.markers = [];

		// bind event handlers
		// this.editor.on('cursorActivity', (event) => {
		// 	event.type = 'cursorActivity';
		// 	self.doEvent(event);
		// });

		this.editor.focus();
		this.editor.setCursor({line: 7, ch: 27});
	},
	doEvent: function(event) {
		var self = debug.left,
			cmd  = (typeof(event) === 'string') ? event : event.type;
		
		//console.log(cmd);
		switch(cmd) {
      		// custom events
			case 'clear-markers':
				self.editor.markers.map(m => m.clear());
				self.editor.markers = [];
				break;
		}
	}
}