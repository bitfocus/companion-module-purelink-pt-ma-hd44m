module.exports = {
	getVariables() {
		const variables = [];
		
		// CONNECTED
		variables.push({ variableId: 'connect_status', name: 'Connection Status' });
		
		// INPUTS
		var list = this.getInputsList(false);
		list.forEach((i) => {
			variables.push({ variableId: i.var_name, name: `${i.label} - NAME` });
		});
		
		// OUTPUTS
		list = this.getOutputsList(false);
		list.forEach((i) => {
			variables.push({ variableId: i.var_name, name: `${i.label} - NAME` });
			variables.push({ variableId: i.var_xpt , name: `${i.label} - XPT` });
		});
		
		// PRESETS
		list = this.getPresetsList(false);
		list.forEach((i) => {
			variables.push({ variableId: i.var_name, name: `${i.label} - NAME` });
		});
		
		// LAST PRESET
		variables.push({ variableId: "pst_last", name: `Last Recalled Preset` });
		
		return variables;
	},
	initVariablesValues() {
		const variables = {};
		
		// INPUTS NAMES
		var list = this.getInputsList();
		list.forEach((i) => { variables[i.var_name] = i.name; });
		
		// OUTPUTS NAMES
		list = this.getOutputsList();
		list.forEach((i) => { variables[i.var_name] = i.name; });
		
		// PRESETS NAMES
		list = this.getPresetsList();
		list.forEach((i) => { variables[i.var_name] = i.name; });
		
		// LAST PRESET
		variables.pst_last = 0;
		
		this.setVariableValues(variables);
	}
};
