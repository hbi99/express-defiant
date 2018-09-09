{
	errStr: {
		'101': 'Command not found.',
		'102': 'Too many corresponding commands. Use switch form.',
		'103': 'Bad command registered.',
		'104': 'Unknown mode.'
	},
	init: function() {
		// fast references
		this.doc = $(document);

		// bind event handlers
		this.doc.on('click', '[data-shell]', this.doEvent);
	},
	doEvent: function(event) {
		var self = debug.shell,
			type = typeof(event) === 'object' ? event.type : event,
			cmd;
		switch(type) {
			case 'click':
				cmd = this.getAttribute('data-shell');
				self.execute(cmd);
				break;
		}
	},
	error: function(cmd, errnum) {
		return {
			cmd: cmd,
			error: (typeof(errnum) === 'number')? this.errStr[errnum] : errnum
		};
	},
	execute: function(sCmd) {
		var ledger = debug.ledger,
			xCmd,
			fPath,
			func = window,
			pFunc,
			cmd = sCmd.match(/(\w+) -(\w+) (.+)/i),
			arg = [],
			dispatch = {};

		if (cmd === null) {
			cmd = sCmd.match(/(\w+) -(\w+)/i);
			if (cmd === null) {
				cmd = (sCmd.indexOf(' ') > -1) ? sCmd.match(/(\w+) (\w+)/i) : sCmd;
			}
		} else {
			arg = cmd[3].split(' ');
		}
		// try to find command in ledger
		xCmd = Defiant.node.selectNodes(ledger, '//shell/*[@object="'+ cmd[1] +'"]/*[@switch="'+ cmd[2] +'"]');
		if (!xCmd.length) {
			xCmd = Defiant.node.selectNodes(ledger, '//shell//*[@name="'+ cmd +'"]');
			// another attepmt to find command
			if (!xCmd.length) {
				cmd = sCmd.split(' ');
				if (cmd.length > 1) {
					xCmd = Defiant.node.selectNodes(ledger, '//shell//*[@name="'+ cmd[0] +'"]');
					arg = cmd.splice(1);
				} else {
					xCmd = Defiant.node.selectNodes(ledger, '//shell//*[@alias="'+ cmd +'"]');
				}
			}
		}
		//console.log($.prettyPrint(xCmd[0]));
		if (xCmd.length > 1) {
			return this.error(sCmd, 102);
		}
		if (xCmd.length) {
			xCmd = xCmd[0];
			fPath = xCmd.parentNode.getAttribute('long').split('.');
			fPath.push(xCmd.getAttribute('name'));
		}
		if (!fPath) {
			return this.error(sCmd, 101);
		}
		// proxy command and execute it
		while (fPath.length) {
			pFunc = func;
			func = func[fPath.shift()];
		}
		if (typeof func === 'function') {
			dispatch = func.apply(pFunc, arg);
		}
		return { cmd: sCmd, ret: dispatch };
	}
}