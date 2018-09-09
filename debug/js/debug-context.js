{
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
		var root = debug,
			self = debug.context,
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
				xMenuItem = Defiant.node.selectSingleNode(root.ledger, '//*[@mId="'+ el.attr('data-mId') +'"]');

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
				xMenuItem = Defiant.node.selectSingleNode(root.ledger, '//*[@mId="'+ el.attr('data-mId') +'"]');

				action = xMenuItem.getAttribute('action');
				args = xMenuItem.getAttribute('args');

				// check group logic
				var cGroup = xMenuItem.getAttribute('cg'),
					cSiblings,
					cLen;
				if (cGroup) {
					cSiblings = Defiant.node.selectNodes(root.ledger, '//*[@cg="'+ cGroup +'"]');
					cLen = cSiblings.length;
					if (cLen > 1) {
						while (cLen--) {
							cSiblings[cLen].removeAttribute('isChecked');
							xMenuItem.setAttribute('isChecked', '1');
						}
					} else {
						if (xMenuItem.getAttribute('isChecked') === '1') {
							if (!args) args = false;
							xMenuItem.removeAttribute('isChecked');
						} else {
							if (!args) args = true;
							xMenuItem.setAttribute('isChecked', 1);
						}
					}
				}

				// execute shell command, if any
				if (action) {
					debug.shell.execute(action, args);
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
				if (el) el.removeClass('active ctx-active');
				self.root.removeClass('cover').html('');
				break;
		}
	},
	render: function(opt) {
		var span = document.createElement('span'),
			xpath = '//xsl:template[@name="'+ opt.template +'"]',
			template = Defiant.node.selectSingleNode(this.templates, xpath),
			fragment;

		template.setAttribute('match', opt.match);
		fragment = this.processor.transformToFragment(debug.ledger, document);
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