{
	drag: {},
	init: function() {
		this.doc = debug.doc;
		this.pEl = debug.body.find('.editors');
		this.el = this.pEl.find('.divider-vertical');
		this.left = this.pEl.find('section.xslt-view');
		this.right = this.pEl.find('section.json-view');

		this.el.on('mousedown', this.doEvent);
	},
	doEvent: function(event) {
		var self = debug.divider,
			drag = self.drag,
			rect,
			left,
			lw,
			rw,
			dvdr = 1.5;
		switch(event.type) {
			case 'mousedown':
				// prevent default behaviour
				event.preventDefault();

				rect = self.el[0].getBoundingClientRect();
				self.drag.pRect = self.pEl[0].getBoundingClientRect();
				self.drag.offsetX = event.clientX - rect.left + (event.clientX - self.el[0].offsetLeft);
				self.drag.clickX = event.clientX;

				self.el.css({ left: self.el[0].offsetLeft +'px' });
				self.pEl.addClass('onresize');
				self.doc.on('mousemove mouseup', self.doEvent);
				break;
			case 'mousemove':
				left = event.clientX - drag.offsetX;
				lw = Math.round((left / (drag.pRect.width - (dvdr * 2))) * 1000000) / 10000;
				rw = Math.round((100 - lw) * 10000) / 10000;

				self.el.css({ left: left +'px' });
				self.left.css({ width: `calc(${lw}% - ${dvdr}px)` });
				self.right.css({ width: `calc(${rw}% - ${dvdr}px)` });
				/**/
				break;
			case 'mouseup':
				self.el.css({'left': ''});
				self.pEl.removeClass('onresize');
				self.doc.off('mousemove mouseup', self.doEvent);
				break;
		}
	}
}