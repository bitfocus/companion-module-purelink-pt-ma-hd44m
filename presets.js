const { combineRgb } = require('@companion-module/base');
module.exports = {
	getPresets() {
		const presets = {};
		
		const outList = this.getOutputsList(false);
		const iptList = this.getInputsList();
		const pstList = this.getPresetsList();
		
		// CROSSPOINTS BY OUTPUT
		outList.forEach((out) => {
			iptList.forEach((ipt) => {
				presets[`xpt_${out.id}_${ipt.id}`] = {
					type: 'button',
					category: out.label+" - XPT",
					style: {
						text: `$(PT-MA-HD44M:${out.var_name})\n$(PT-MA-HD44M:${ipt.var_name})`,
						//size: '14',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0)
					},
					steps: [{
						down: [{
							actionId: 'setCrosspoint',
							options: { out: out.id, ipt: ipt.id }
						}]
					}],
					feedbacks: [
						{
							feedbackId: 'crosspoint_status',
							options: { outID: out.id, xpt: ipt.id },
							style: { bgcolor: combineRgb(255, 0, 0) }
						},
						{
							feedbackId: 'connect_status',
							options: {},
							isInverted: true,
							style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
						}
					]
				};
			});
		});
		
		// CROSSPOINTS ALL OUTPUTS
		iptList.forEach((ipt) => {
			presets[`xpt_all_${ipt.id}`] = {
				type: 'button',
				category: "All Outputs - XPT",
				style: {
					text: `ALL #${ipt.id}`,
					//size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [{
					down: [{
						actionId: 'setCrosspoint',
						options: { out: '0', ipt: ipt.id }
					}]
				}],
				feedbacks: [
					{
						feedbackId: 'connect_status',
						options: {},
						isInverted: true,
						style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
					}
				]
			};
		});
		
		// RECALL PRESETS
		pstList.forEach((pst) => {
			presets[`recall_pst${pst.id}`] = {
				type: 'button',
				category: "Preset - Recall",
				style: {
					text: `Recall\n$(PT-MA-HD44M:${pst.var_name})`,
					//size: '14',
					color: combineRgb(24, 76, 119),
					bgcolor: combineRgb(128, 198, 255)
				},
				steps: [{
					down: [{
						actionId: 'recallPreset',
						options: { pst: pst.id }
					}]
				}],
				feedbacks: [
					{
							feedbackId: 'last_pst',
							options: { pst: pst.id },
							style: { color: combineRgb(255, 255, 255), bgcolor: combineRgb(27, 158, 62) }
						},
					{
						feedbackId: 'connect_status',
						options: {},
						isInverted: true,
						style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
					}
				]
			};
		});
		
		// SAVE PRESETS
		pstList.forEach((pst) => {
			presets[`save_pst${pst.id}`] = {
				type: 'button',
				category: "Preset - Save",
				style: {
					text: `Save\n$(PT-MA-HD44M:${pst.var_name})`,
					//size: '14',
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(249, 177, 21)
				},
				steps: [{
					down: [{
						actionId: 'savePreset',
						options: { pst: pst.id }
					}]
				}],
				feedbacks: [
					{
						feedbackId: 'connect_status',
						options: {},
						isInverted: true,
						style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
					}
				]
			};
		});
		
		// CLEAR PRESETS
		pstList.forEach((pst) => {
			presets[`clear_pst${pst.id}`] = {
				type: 'button',
				category: "Preset - Clear",
				style: {
					text: `Clear\n$(PT-MA-HD44M:${pst.var_name})`,
					//size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(213, 2, 2)
				},
				steps: [{
					down: [{
						actionId: 'clearPreset',
						options: { pst: pst.id }
					}]
				}],
				feedbacks: [
					{
						feedbackId: 'connect_status',
						options: {},
						isInverted: true,
						style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
					}
				]
			};
		});
		
		// REFRESH INFO
		presets[`refresh_info`] = {
			type: 'button',
			category: "Refresh Info",
			style: {
				text: `Refresh Info`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0)
			},
			steps: [{
				down: [{
					actionId: 'refreshInfo',
					options: {}
				}]
			}],
			feedbacks: [
				{
					feedbackId: 'connect_status',
					options: {},
					isInverted: true,
					style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
				}
			]
		};

		return presets;
	}
};