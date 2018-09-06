
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

			// init sub-objects
			for (var name in self) {
				if (typeof(self[name].init) === 'function') {
					self[name].init();
				}
			}

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
				case 'initiate-editors':
					self.xslEditor = CodeMirror.fromTextArea($('section.xslt-view textarea')[0], {
					        mode: 'text/html',
							lineWrapping: false,
							lineNumbers: true,
						});
					self.jsonEditor = CodeMirror.fromTextArea($('section.json-view textarea[name="json-data"]')[0], {
					        mode: 'application/ld+json',
							matchBrackets: true,
					        autoCloseBrackets: true,
							lineWrapping: false,
							lineNumbers: true
						});
					self.xmlEditor = CodeMirror.fromTextArea($('section.json-view textarea[name="xml-data"]')[0], {
					        mode: 'text/html',
							lineWrapping: false,
							lineNumbers: true,
						});

					data = JSON.parse( debug.jsonEditor.doc.getValue() );
					data = Defiant.node.prettyPrint(JSON.toXML(data));
					debug.xmlEditor.doc.setValue(data);

					self.xslEditor.setOption('theme', 'laura');
					self.xslEditor.markers = [];
					self.jsonEditor.setOption('theme', 'emilia');
					self.jsonEditor.markers = [];
					self.xmlEditor.setOption('theme', 'felicia');
					self.xmlEditor.markers = [];

					// bind event handlers
					self.xslEditor.on('cursorActivity', (event) => {
						event.type = 'cursorActivity';
						self.doEvent(event);
					});

					self.xslEditor.focus();
					self.xslEditor.setCursor({line: 7, ch: 27});
					break;
				case 'clear-left-markers':
					self.xslEditor.markers.map(m => m.clear());
					self.xslEditor.markers = [];
					break;
				case 'clear-right-markers':
					self.jsonEditor.markers.map(m => m.clear());
					self.jsonEditor.markers = [];
					break;
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
		contextmenu: {
			init: function() {
				// fast references
				this.doc = $(document);
				this.body = $('body');
				this.rootEl = this.body.find('.menus');

				// prepare xsl pre-processor
				str = this.body.find('script[type="debug/xsl-template"]').text().trim();
				this.xsl = Defiant.xmlFromString(str);
				// get ledger
				var str = this.body.find('script[type="debug/xml-ledger"]').text().trim();
				this.ledger = Defiant.xmlFromString(str);
				this.tagIds(this.ledger);

				// bind event handlers
				this.doc.on('contextmenu', 'body, *[data-context]', this.doEvent);
				this.rootEl.on('mousedown mouseover mouseout', '.menu-item', this.doEvent);
			},
			clear: function() {
				this.rootEl.html('');
			},
			doEvent: function(event) {
				var self = debug.contextmenu,
					xMenuItem,
					menuXPath,
					menuXNode,
					ctxId,
					rootMenu,
					pMenu,
					subMenu,
					dim,
					oHeight,
					oWidth,
					top,
					left,
					el;

				if (event.ctrlKey) return;
				event.preventDefault();
				event.stopPropagation();

				switch (event.type) {
					case 'mousedown':
						ctxId = this.getAttribute('data-id');
						xMenuItem = Defiant.node.selectSingleNode(self.ledger, '//context//*[@_id="'+ ctxId +'"]');
						if (xMenuItem && !xMenuItem.getAttribute('disabled') && xMenuItem.getAttribute('action')) {
							_sys.shell.exec( xMenuItem.getAttribute('action') );
						}
						break;
					case 'mouseout':
						$(this).removeClass('over');
						break;
					case 'mouseover':
						el = $(this).addClass('over');
						pMenu = this.parentNode.parentNode;
						ctxId = el.attr('data-id');

						$('.menu-item', pMenu).removeClass('down');
						if (pMenu.pMenuEl) {
							$(pMenu.pMenuEl).addClass('down');
						}
						// delete adjacent siblings
						while (pMenu.nextSibling) {
							pMenu.parentNode.removeChild( pMenu.nextSibling );
						}
						if (!el.hasClass('hasSub')) return;
						
						subMenu = self.rootEl.append(self.transform({
									match: '//context//*[@_id=\''+ ctxId +'\']',
									template: 'menu'
								})).find('.context-menu:last');

						dim = subMenu[0].getBoundingClientRect();
						oHeight = dim.height;
						oWidth = dim.width;
						top = pMenu.offsetTop + this.offsetTop;
						left = pMenu.offsetLeft + pMenu.offsetWidth;
						
						if (left + oWidth > window.innerWidth) left = pMenu.offsetLeft - oWidth;
						if (top + oHeight + 11 > window.innerHeight) top -= oHeight - this.offsetHeight;

						subMenu[0].pMenuEl = this;
						subMenu.css({
							'top': top +'px',
							'left': left +'px'
						});
						break;
					case 'contextmenu':
						if (!this.getAttribute('data-context')) return;
						menuXPath = '//context//*[@for=\''+ this.getAttribute('data-context') +'\']';
						menuXNode = Defiant.node.selectSingleNode(self.ledger, menuXPath);
						if (!menuXNode) return;

						rootMenu = self.rootEl.append(self.transform({
									match: menuXPath,
									template: 'menu'
								})).find('.context-menu');

						dim = rootMenu[0].getBoundingClientRect();
						oHeight = dim.height;
						oWidth = dim.width;
						top = event.clientY;
						left = event.clientX;

						if (top + oHeight + 11 > window.innerHeight) {
							top -= oHeight;
						}
						if (left + oWidth > window.innerWidth) {
							left -= (oWidth - 6);
						}

						dim = this.getBoundingClientRect();
						self.info = {
							el: this,
							target: event.target,
							offsetY: dim.top,
							offsetX: dim.left,
							clientY: event.clientY,
							clientX: event.clientX
						};

						rootMenu.css({
							'top': parseInt(top, 10) +'px',
							'left': parseInt(left, 10) +'px'
						});
						break;
				}
			},
			tagIds: function(doc) {
				var leafs = Defiant.node.selectNodes(doc, '//*[@tag_children]//*[not(@_id)]'),
					now = Date.now();
				leafs.map((item, i) => item.setAttribute('_id', 'c'+ now + i));
			},
			transform: function(options) {
				var span = document.createElement('span'),
					treeTemplate = Defiant.node.selectSingleNode(this.xsl, '//xsl:template[@name="'+ options.template +'"]'),
					xslPrc = new XSLTProcessor(),
					xMenu;

				if (options.template === 'menu') {
					xMenu = Defiant.node.selectSingleNode(this.ledger, options.match);
					if (xMenu.getAttribute('invoke')) {
						options.match = '//context//*[@for=\''+ xMenu.getAttribute('invoke') +'\']';
					}
				}
				treeTemplate.setAttribute('match', options.match);
				xslPrc.importStylesheet(this.xsl);
				span.appendChild(xslPrc.transformToFragment(this.ledger, document));
				treeTemplate.removeAttribute('match');

				return span.innerHTML;
			}
		}
	};

	window.debug = debug;
	$(window).ready(() => debug.init());

})(window, document);