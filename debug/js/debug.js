
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
		shell: {
			init: function() {
				
			},
			execute: function(cmd, args) {
				console.log(cmd, args)
			}
		},
		contextmenu: {
			org: {},
			init: function() {
				// fast references
				var self = this,
					str;
				this.doc = $(document);
				this.body = this.doc.find('body');
				this.root = this.body.find('.menus');

				// attach contextmenu at root level
				this.body.attr({'data-context': 'debug-app'});

				// prepare xsl pre-processor
				str = this.body.find('script[type="debug/xsl-template"]').text().trim();
				this.templates = Defiant.xmlFromString(str);

				this.processor = new XSLTProcessor();
				this.processor.importStylesheet(this.templates);

				// get ledger
				str = this.body.find('script[type="debug/xml-ledger"]').text().trim();
				this.ledger = Defiant.xmlFromString(str);

				// makes sure that new menu items are tagged with ID's
				this.tagIds(this.ledger);

				// bind event handlers
				this.root.on('mouseover mousedown', '.menu-item', this.doEvent)
						.on('mousedown', this.doEvent);
				this.doc.on('contextmenu', '[data-context]', this.doEvent);
				this.doc.on('mousedown', '[data-menu]', function(event) {
					self.doEvent('clear-contextmenu');
					self.doEvent('trigger-contextmenu', $(this), event);
				});
			},
			doEvent: function(event) {
				var self = debug.contextmenu,
					cmd = (typeof(event) === 'string')? event : event.type,
					el = $(this),
					pEl,
					ctx,
					invoke,
					thisDim,
					ownerDim,
					menuDim,
					args,
					action,
					menuParent,
					xMenuItem,
					xPath,
					menu,
					app,
					win,
					winId,
					width,
					height,
					top,
					left,
					htm;

				switch (cmd) {
					// native events
					case 'mouseover':
						menu = el.parents('.context-menu');

						// purge adjacent siblings
						menu.next('.context-menu').remove();
						menu.find('.down').removeClass('down');

						// correct menu state
						menuParent = menu.attr('data-menu_parent');
						if (menuParent) {
							self.root.find('.menu-item[_id="'+ menuParent +'"]').addClass('down');
						}

						// get menu node
						xMenuItem = Defiant.node.selectSingleNode(self.ledger, '//*[@mId="'+ el.attr('data-mId') +'"]');

						if (el.hasClass('hasSub')) {
							invoke = xMenuItem.getAttribute('invoke');
							thisDim = el[0].getBoundingClientRect();
							ownerDim = menu[0].getBoundingClientRect();

							if (invoke) xPath = '//*[@for="'+ invoke +'"]';
							else xPath = '//*[@mId="'+ el.attr('data-mId') +'"]';
							
							// render menu
							menu = self.render({
									template: 'menu',
									match: xPath,
									append: self.root
								}).find('.context-menu:last');

							// prepare for correct menu state
							menu.attr({'data-menu_parent': el.attr('data-mId')});

							// prepare dimensions for rendered menu
							menuDim = menu[0].getBoundingClientRect();
							height = menuDim.height;
							width  = menuDim.width;
							top    = thisDim.top - 2;
							left   = parseInt(ownerDim.left + ownerDim.width - 1, 10);

							// constaints
							if (left + width > window.innerWidth) left = ownerDim.left - width;
							if (top + height + 11 > window.innerHeight) top -= height - thisDim.height - 7;

							// position rendered menu
							menu.css({
								top: top +'px',
								left: left +'px'
							});
						}
						break;
					case 'mousedown':
						// prevent default behaviour
						event.preventDefault();

						// visual update of original element
						if (self.org.el === 'tool') {
							self.org.el.removeClass('active');
						}

						// clear contextmenu if clicked on a non-menu-item
						if (el[0] === self.root[0]) {
							return self.doEvent('clear-contextmenu');
						}
						
						// purge contextmenu view
						self.doEvent('clear-contextmenu');

						// get menu node
						xMenuItem = Defiant.node.selectSingleNode(self.ledger, '//*[@mId="'+ el.attr('data-mId') +'"]');
						// execute shell command, if any
						action = xMenuItem.getAttribute('action');
						args = xMenuItem.getAttribute('args');
						if (action) {
							debug.shell.execute(action, args);
							return;
						}

						if (!action) return;

						// check group logic
						var cGroup = xMenuItem.getAttribute('check-group'),
							cSiblings,
							cLen;
						if (cGroup) {
							cSiblings = Defiant.node.selectNodes(self.ledger, '//*[@check-group="'+ cGroup +'"]');
							cLen = cSiblings.length;
							if (cLen > 1) {
								while (cLen--) {
									cSiblings[cLen].removeAttribute('isChecked');
									xMenuItem.setAttribute('isChecked', '1');
								}
							} else {
								if (xMenuItem.getAttribute('isChecked') === '1') {
									xMenuItem.removeAttribute('isChecked');
								} else {
									xMenuItem.setAttribute('isChecked', 1);
								}
							}
						}
						break;
					case 'contextmenu':
						// dev-mode: meta-key stops custom behaviour
						if (event.metaKey) return;

						// prevent default behaviour
						event.preventDefault();
						event.stopPropagation();

						// save info about original event
						self.org.el = el.addClass('ctx-active');

						ctx = this.getAttribute('data-context');
						xPath = '//*[@for="'+ ctx +'"]';

						// render target menu
						menu = self.render({
							template : 'menu',
							match    : xPath,
							target   : self.root
						});

						// stop if no menu has been generated
						if (!menu.length) return;

						// turn on the cover
						self.root.addClass('cover');

						// prepare dimensions for rendered menu
						menuDim = menu[0].getBoundingClientRect();
						height = menuDim.height;
						width  = menuDim.width;
						top    = event.clientY;
						left   = event.clientX;
						
						// constaints
						if (top + height + 11 > window.innerHeight) top -= height;
						if (left + width > window.innerWidth) left -= (width - 6);
						// position rendered menu
						menu.css({
							top: top +'px',
							left: left +'px'
						});
						break;
					// custom events
					case 'trigger-contextmenu':
						// save info about original event
						self.org.el = arguments[1].addClass('active');

						ctx = self.org.el.attr('data-menu');
						xPath = '//*[@for="'+ ctx +'"]';

						// render target menu
						menu = self.render({
							template : 'menu',
							match    : xPath,
							target   : self.root.addClass('cover')
						});

						// prepare dimensions for rendered menu
						thisDim = self.org.el[0].getBoundingClientRect();
						menuDim = menu[0].getBoundingClientRect();
						height = menuDim.height;
						width  = menuDim.width;
						top    = thisDim.top + thisDim.height + 2;
						left   = thisDim.left + 1;

						// constaints
						if (top + height + 11 > window.innerHeight) top -= height + thisDim.height + 7;
						if (left + width > window.innerWidth) left -= width - thisDim.width;

						// position rendered menu
						menu.css({
							top: top +'px',
							left: left +'px'
						});
						break;
					case 'clear-contextmenu':
						el = self.org.el;
						if (el) {
							if (el[0].nodeName.toLowerCase() === 'selectbox') {
								el.removeClass('active');
							}
							el.removeClass('ctx-active');
						}
						self.root.removeClass('cover').html('');
						break;
				}
			},
			tagIds: function(doc) {
				var leafs = Defiant.node.selectNodes(doc, '//*[@tag_children]//*[not(@mId)]'),
					now = Date.now();
				leafs.map((item, i) => item.setAttribute('mId', 'c'+ now + i));
			},
			render: function(opt) {
				var span = document.createElement('span'),
					xpath = '//xsl:template[@name="'+ opt.template +'"]',
					template = Defiant.node.selectSingleNode(this.templates, xpath),
					fragment;

				template.setAttribute('match', opt.match);
				fragment = this.processor.transformToFragment(this.ledger, document);
				template.removeAttribute('match');

				span.appendChild(fragment);
				fragment = span.innerHTML.replace(/\n\t{1,}/g, ' ');
				
				if (opt.append) {
					return opt.append.append(fragment);
				} else if (opt.target) {
					return opt.target.html(fragment).find('> :last-child');
				} else {
					return fragment;
				}
			}
		}
	};

	window.debug = debug;
	$(window).ready(() => debug.init());

})(window, document);