const { Regex } = require('@companion-module/base');
module.exports = {
	getConfigFields() {
		return [
			{
				id: 'info',
				type: 'static-text',
				width: 12,
				label: 'Information',
				value: "This module allow to controls a PureLink PureTools PT-MA-HD44M video matrix crosspoints.<br/>It's based on this native <a target='_blank' href='https://cloud.purelink.de/index.php/s/cMPB4FsRSCNb5fk/download'>protocol</a><br/>",
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Matrix IP',
				width: 8,
				regex: Regex.IP,
				default: '192.168.1.168'
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Matrix Port',
				width: 4,
				regex: Regex.PORT,
				min: 1,
				max: 65535,
				default: '5000'
			},
			{
				type: 'number',
				id: 'timeout',
				label: 'Send Command Timeout (in ms)',
				width: 12,
				regex: Regex.PORT,
				min: 5,
				max: 500,
				default: 100
			}
		];
	}
};