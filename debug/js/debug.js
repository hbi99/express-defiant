
@@include('./jquery.js')
@@include('./defiant.js')
@@include('./codemirror/codemirror.js')

@@include('./codemirror/addon/foldcode.js')
@@include('./codemirror/addon/foldgutter.js')
@@include('./codemirror/addon/brace-fold.js')
@@include('./codemirror/addon/xml-fold.js')

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

			// get ledger
			var str = this.body.find('script[type="debug/xml-ledger"]').text().trim();
			this.ledger = Defiant.xmlFromString(str);

			// makes sure that new menu items are tagged with ID's
			this.tagIds(this.ledger);

			// init sub-objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}

			this.left.editor.focus();
			this.left.editor.setCursor({line: 7, ch: 27});
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
      			// custom events
				case 'matches':
					break;
			}
		},
		tagIds: function(doc) {
			var leafs = Defiant.node.selectNodes(doc, '//*[@tag_children]//*[not(@mId)]'),
				now = Date.now();
			leafs.map((item, i) => item.setAttribute('mId', 'c'+ now + i));
		},
		left: @@include('./debug-left.js'),
		right: @@include('./debug-right.js'),
		shell: @@include('./debug-shell.js'),
		context: @@include('./debug-context.js')
	};

	window.debug = debug;
	$(window).ready(() => debug.init());

})(window, document);