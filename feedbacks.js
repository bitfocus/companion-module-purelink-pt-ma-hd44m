const { InstanceBase, combineRgb } = require('@companion-module/base')

module.exports = {
	getFeedbacks() {
		const feedbacks = {}

		feedbacks.crosspoint_status = {
			name: 'Crosspoint Status',
			type: 'boolean',
			label: 'Crosspoint Status',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [
				{
					id: 'outID',
					type: 'dropdown',
					label: 'OUTPUT',
					choices: this.getOutputsList(false),
					default: this.getFirstOutID(false),
				},
				{
					id: 'xpt',
					type: 'dropdown',
					label: 'INPUT',
					choices: this.getInputsList(false),
					default: this.getFirstIptID(false),
				},
			],
			callback: (feedback) => {
				var out = this.getOutByID(feedback.options.outID)
				return out.xpt == feedback.options.xpt
			},
		}

		feedbacks.last_pst = {
			name: 'Last Recalled Preset',
			type: 'boolean',
			label: 'Last Recalled Preset',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [
				{
					id: 'pst',
					type: 'dropdown',
					label: 'PRESET',
					choices: this.getPresetsList(),
					default: this.getFirstPstID(),
				},
			],
			callback: (feedback) => {
				return feedback.options.pst == this.getLastPstID()
			},
		}

		feedbacks.connect_status = {
			name: 'Connection Status',
			type: 'boolean',
			label: 'Matrix connection status',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: (feedback) => {
				return this.getVariableValue('connect_status') == 'ok'
			},
		}

		return feedbacks
	},
}
