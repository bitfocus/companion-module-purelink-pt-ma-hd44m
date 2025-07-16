const { Regex } = require('@companion-module/base');

module.exports = {
	getActions() {
		const actions = {};
		
		actions.setCrosspoint = {
			name: 'Set crosspoint',
			options: [
				{
					id: 'out',
					type: 'dropdown',
					label: 'OUTPUT',
					choices: this.getOutputsList(true),
					default: this.getFirstOutID()
				},
				{
					id: 'ipt',
					type: 'dropdown',
					label: 'INPUT',
					choices: this.getInputsList(),
					default: this.getFirstIptID()
				}
			],
			callback: async (event) => {
				let out = this.getOutByID(event.options.out);
				let ipt = this.getIptByID(event.options.ipt);
				this.log('info', `PT-MA-HD44M MATRIX | SET CROSSPOINT >>> ${out.label} > ${ipt.label}`);
				this.sendPriorityCommand(`#video_d out${event.options.out} matrix=${event.options.ipt}`);
			}
		};
		
		actions.recallPreset = {
			name: 'Preset - Recall',
			options: [
				{
					id: 'pst',
					type: 'dropdown',
					label: 'PRESET',
					choices: this.getPresetsList(),
					default: this.getFirstPstID()
				}
			],
			callback: async (event) => {
				let pst = this.getPstByID(event.options.pst);
				this.log('info', `PT-MA-HD44M MATRIX | RECALL PRESET >>> ${pst.label}`);
				this.sendPriorityCommand(`#preset:${event.options.pst} exe=0`);
			}
		};
		
		actions.savePreset = {
			name: 'Preset - Save',
			options: [
				{
					id: 'pst',
					type: 'dropdown',
					label: 'PRESET',
					choices: this.getPresetsList(),
					default: this.getFirstPstID()
				}
			],
			callback: async (event) => {
				let pst = this.getPstByID(event.options.pst);
				this.log('info', `PT-MA-HD44M MATRIX | SAVE PRESET >>> ${pst.label}`);
				this.sendPriorityCommand(`#preset:${event.options.pst} exe=1`);
			}
		};
		
		actions.clearPreset = {
			name: 'Preset - Clear',
			options: [
				{
					id: 'pst',
					type: 'dropdown',
					label: 'PRESET',
					choices: this.getPresetsList(),
					default: this.getFirstPstID()
				}
			],
			callback: async (event) => {
				let pst = this.getPstByID(event.options.pst);
				this.log('info', `PT-MA-HD44M MATRIX | CLEAR PRESET >>> ${pst.label}`);
				this.sendPriorityCommand(`#preset:${event.options.pst} exe=2`);
			}
		};
		
		actions.refreshInfo = {
			name: 'Refresh Info',
			options: [],
			callback: async () => {
				this.log('info', `PT-MA-HD44M MATRIX | REFRESH INFO`);
				this.sendPriorityCommand(`#get info`);
			}
		};
		
		actions.sendCommand = {
			name: 'Send Command',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command:',
					tooltip: 'Use %hh to insert Hex codes\nObsolete, use Send HEX command instead',
					default: '',
					useVariables: true,
				}
			],
			callback: async (event) => {
				this.log('info', `PT-MA-HD44M MATRIX | SEND COMMAND >>> ${event.options.cmd}`);
				await this.sendPriorityCommand(event.options.cmd, false);
			}
		};

		return actions;
	}
};