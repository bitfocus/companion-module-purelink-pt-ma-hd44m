const {
	InstanceBase,
	Regex,
	runEntrypoint,
	InstanceStatus,
	TCPHelper,
	combineRgb,
	CompanionVariableValues,
} = require('@companion-module/base')
const configFields = require('./configFields')
const actions = require('./actions')
const feedbacks = require('./feedbacks')
const presets = require('./presets')
const variables = require('./variables')

var tcpCommandBuffer = []
var tcpSendTimeout
var tcpSendTimeoutTime = 100
var currentCmd = false

let tcpReceivebuffer = ''

var INPUTS = [
	{ id: '1', label: 'Input #1', name: 'Input1', var_name: 'ipt_name_1' },
	{ id: '2', label: 'Input #2', name: 'Input2', var_name: 'ipt_name_2' },
	{ id: '3', label: 'Input #3', name: 'Input3', var_name: 'ipt_name_3' },
	{ id: '4', label: 'Input #4', name: 'Input4', var_name: 'ipt_name_4' },
]

var OUTPUTS = [
	{ id: '1', label: 'Output #1', name: 'Output1', var_name: 'out_name_1', xpt: undefined, var_xpt: 'xpt_out_1' },
	{ id: '2', label: 'Output #2', name: 'Output2', var_name: 'out_name_2', xpt: undefined, var_xpt: 'xpt_out_2' },
	{ id: '3', label: 'Output #3', name: 'Output3', var_name: 'out_name_3', xpt: undefined, var_xpt: 'xpt_out_3' },
	{ id: '4', label: 'Output #4', name: 'Output4', var_name: 'out_name_4', xpt: undefined, var_xpt: 'xpt_out_4' },
]

const PRESETS = [
	{ id: '1', label: 'Preset #1', name: 'Preset1', var_name: 'pst_name_1' },
	{ id: '2', label: 'Preset #2', name: 'Preset2', var_name: 'pst_name_2' },
	{ id: '3', label: 'Preset #3', name: 'Preset3', var_name: 'pst_name_3' },
	{ id: '4', label: 'Preset #4', name: 'Preset4', var_name: 'pst_name_4' },
	{ id: '5', label: 'Preset #5', name: 'Preset5', var_name: 'pst_name_5' },
	{ id: '6', label: 'Preset #6', name: 'Preset6', var_name: 'pst_name_6' },
	{ id: '7', label: 'Preset #7', name: 'Preset7', var_name: 'pst_name_7' },
	{ id: '8', label: 'Preset #8', name: 'Preset8', var_name: 'pst_name_8' },
]

class MatrixInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		Object.assign(this, {
			...configFields,
			...actions,
			...feedbacks,
			...presets,
			...variables,
		})
	}

	async init(config) {
		this.config = config

		this.updateActionsDefinitions()
		this.updateFeedbacksDefinitions()
		this.updateVariableDefinitions()
		this.updatePresetsDefinitions()

		// INIT CONNECTION
		this.initTCP()
	}

	// When module gets deleted
	async destroy() {
		this.killTCP()
	}

	async configUpdated(config) {
		this.killTCP()
		this.config = config

		if (this.config.timeout > 5 === false) this.config.timeout = 5
		else if (this.config.timeout > 500) this.config.timeout = 500

		this.updateActionsDefinitions()
		this.updateFeedbacksDefinitions()
		this.updateVariableDefinitions()
		this.updatePresetsDefinitions()

		this.initTCP()
	}

	updateActionsDefinitions() {
		this.setActionDefinitions(this.getActions())
	}
	updateFeedbacksDefinitions() {
		this.setFeedbackDefinitions(this.getFeedbacks())
	}
	updateVariableDefinitions() {
		this.setVariableDefinitions(this.getVariables())
		this.initVariablesValues()
	}
	updatePresetsDefinitions() {
		this.setPresetDefinitions(this.getPresets())
	}

	// OUTPUTS
	getOutputsList(all) {
		var list = [...OUTPUTS]
		if (all === true) list.push({ id: '0', label: 'All Outputs' })
		return list
	}
	getOutByID(id) {
		var out = false
		var l = OUTPUTS.length
		for (var i = 0; i < l; i++) {
			if (OUTPUTS[i].id == id) {
				out = Object.assign({}, OUTPUTS[i])
				out.num = i
				break
			}
		}
		return out
	}
	getFirstOutID() {
		return OUTPUTS[0].id
	}

	// INPUTS
	getInputsList() {
		return [...INPUTS]
	}
	getIptByID(id) {
		var ipt = false
		var l = INPUTS.length
		for (var i = 0; i < l; i++) {
			if (INPUTS[i].id == id) {
				ipt = Object.assign({}, INPUTS[i])
				ipt.num = i
				break
			}
		}
		return ipt
	}
	getFirstIptID() {
		return INPUTS[0].id
	}

	// PRESETS
	getPresetsList() {
		return [...PRESETS]
	}
	getPstByID(id) {
		var pst = false
		var l = PRESETS.length
		for (var i = 0; i < l; i++) {
			if (PRESETS[i].id == id) {
				pst = Object.assign({}, PRESETS[i])
				pst.num = i
				break
			}
		}
		return pst
	}
	getPstByName(name) {
		var pst = false
		var l = PRESETS.length
		for (var i = 0; i < l; i++) {
			if (PRESETS[i].name == name) {
				pst = Object.assign({}, PRESETS[i])
				pst.num = i
				break
			}
		}
		return pst
	}
	getFirstPstID() {
		return PRESETS[0].id
	}

	// TCP CONNECTION
	initTCP() {
		this.killTCP()

		this.log('info', `PT-MA-HD44M MATRIX | INIT TCP CONNECTION >>> ${this.config.host} ${this.config.port}`)

		if (this.config.host && this.config.port) {
			this.log('info', `PT-MA-HD44M MATRIX | Opening TCP connection to ${this.config.host}:${this.config.port}`)
			this.socket = new TCPHelper(this.config.host, this.config.port, { reconnect: true })

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
				this.setVariableValues({ connect_status: status })
				this.checkFeedbacks('connect_status')

				this.log('info', `PT-MA-HD44M MATRIX | TCP connection status changed >>> ${status}`)
				if (status == 'ok') {
					this.sendCommand('#get info')
				} else {
					this.clearTcpCommandBuffer()
				}
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', 'PT-MA-HD44M MATRIX | Network error: ' + err.message)
			})

			this.socket.on('data', (chunk) => {
				let i = 0
				let line = ''
				let offset = 0
				tcpReceivebuffer += chunk.toString()
				while ((i = tcpReceivebuffer.indexOf('\n', offset)) !== -1) {
					line = tcpReceivebuffer.slice(offset, i)
					offset = i + 1
					line = line.replaceAll('\r\r', '')
					if (line != '') this.socket.emit('receiveline', line)
				}
				tcpReceivebuffer = tcpReceivebuffer.slice(offset)
			})
			this.socket.on('receiveline', (data) => {
				this.parseReceivedMessage(data.toString())
			})
		}
	}

	killTCP() {
		this.clearTcpCommandBuffer()
		tcpReceivebuffer = ''
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}
		this.setVariableValues({ connect_status: 'disconnected' })
		this.checkFeedbacks('connect_status')
	}

	// SEND COMMAND
	sendCommand(cmd, clbk) {
		if (cmd != '') {
			tcpCommandBuffer.push({ cmd: cmd, clbk: clbk })
			this.sendNextCommand()
		}
	}
	sendPriorityCommand(cmd, clbk) {
		if (cmd != '') {
			tcpCommandBuffer.unshift({ cmd: cmd, clbk: clbk })
			this.sendNextCommand()
		}
	}

	async sendNextCommand() {
		if (tcpSendTimeout || tcpCommandBuffer.length == 0) return
		tcpSendTimeout = true
		var cue = tcpCommandBuffer.shift()
		var cmd = cue.cmd
		var escCmd = unescape(await this.parseVariablesInString(cmd))
		if (escCmd != '') {
			this.log('debug', `PT-MA-HD44M MATRIX | SENDIND COMMAND >>> ${escCmd} | callback: ${cue.clbk}`)
			const sendBuf = Buffer.from(escCmd + '\n', 'latin1')
			if (this.socket !== undefined && this.socket.isConnected) {
				currentCmd = cue
				this.socket.send(sendBuf)
				tcpSendTimeout = setTimeout(
					function (self) {
						self.onSendCommandTimeout()
					},
					this.config.timeout,
					this,
				)
			} else this.log('warn', `PT-MA-HD44M MATRIX | CANNOT SEND COMMAND - Socket not connected >>> ${cmd}`)
		} else if (tcpCommandBuffer.length > 0) this.sendNextCommand()
	}

	onSendCommandTimeout() {
		this.log('warn', `PT-MA-HD44M MATRIX | SEND COMMAND TIMEOUT >>> ${currentCmd.cmd}`)
		tcpSendTimeout = undefined
		currentCmd = false
		this.sendNextCommand()
	}

	clearTcpCommandBuffer() {
		if (tcpSendTimeout) {
			clearTimeout(tcpSendTimeout)
			tcpSendTimeout = undefined
		}
		tcpCommandBuffer = []
		currentCmd = false
	}

	// PARSE RECEIVED MESSAGE
	parseReceivedMessage(msg) {
		if (tcpSendTimeout) {
			clearTimeout(tcpSendTimeout)
			tcpSendTimeout = undefined
		}

		this.log('debug', `PT-MA-HD44M MATRIX | receive message > "${msg}"`)

		let namePos = msg.indexOf('[name=')
		let endNamePos = msg.indexOf(']')
		let dataPos = msg.indexOf('[Data=')
		let endDataPos = msg.indexOf(' : ', dataPos)
		let xptPos = msg.indexOf('Video matrix')

		// GET INFOS - INPUT NAME
		if (msg.slice(0, 6) == '<Input' && namePos > 0 && endNamePos > 0) {
			let ipt = this.getIptByID(msg.substr(6, 1))
			let name = msg.slice(namePos + 6, endNamePos)
			if (ipt && ipt.name != name) {
				this.log('info', `PT-MA-HD44M MATRIX | INPUT #${ipt.id} - NAME CHANGED >>> ${name}`)
				ipt.name = name
				INPUTS[ipt.num] = ipt
				this.setVariableValue(ipt.var_name, name)
			}
		}
		// GET INFOS - OUTPUT NAME
		else if (msg.slice(0, 7) == '<Output' && namePos > 0 && endNamePos > 0) {
			let out = this.getOutByID(msg.substr(7, 1))
			let name = msg.slice(namePos + 6, endNamePos)
			if (out && out.name != name) {
				this.log('info', `PT-MA-HD44M MATRIX | OUTPUT #${out.id} - NAME CHANGED >>> ${name}`)
				out.name = name
				OUTPUTS[out.num] = out
				this.setVariableValue(out.var_name, name)
			}
		}
		// GET INFOS - PRESET NAME
		else if (msg.slice(0, 7) == '<Preset' && namePos > 0 && endNamePos > 0) {
			let pst = this.getPstByID(msg.substr(7, 1))
			let name = msg.slice(namePos + 6, endNamePos)
			if (pst && pst.name != name) {
				this.log('info', `PT-MA-HD44M MATRIX | PRESET #${pst.id} - NAME CHANGED >>> ${name}`)
				pst.name = name
				PRESETS[pst.num] = pst
				this.setVariableValue(pst.var_name, name)
			}
		}

		// OUTPUT XPT
		else if (msg.slice(0, 7) == '<Output' && xptPos > 0 && dataPos > 0 && endDataPos > 0) {
			let out = this.getOutByID(msg.substr(7, 1))
			let xpt = (parseInt(msg.slice(dataPos + 6, endDataPos)) + 1).toString()
			if (out && out.xpt != xpt) {
				this.log('info', `PT-MA-HD44M MATRIX | OUTPUT #${out.id} - XPT CHANGED >>> ${xpt}`)
				out.xpt = xpt
				OUTPUTS[out.num] = out
				this.setVariableValue(out.var_xpt, xpt)
				this.checkFeedbacks('crosspoint_status')
			}
		}

		// SET NAME
		else if (msg.slice(0, 8) == 'Set name') {
			let nameID = parseInt(msg.slice(8))
			let name = msg.slice(msg.indexOf(' > ') + 3)
			// INPUTS
			if (nameID < 4) {
				let ipt = INPUTS[nameID]
				if (ipt.name != name) {
					this.log('info', `INPUT #${ipt.id} - NAME = ${name}`)
					ipt.name = name
					INPUTS[nameID] = ipt
					this.setVariableValue(ipt.var_name, name)
				}
			}
			// OUTPUTS
			else if (nameID < 8) {
				let out = OUTPUTS[nameID - 4]
				if (out.name != name) {
					this.log('info', `OUTPUT #${out.id} - NAME = ${name}`)
					out.name = name
					OUTPUTS[nameID - 4] = out
					this.setVariableValue(out.var_name, name)
				}
			}
			// PRESETS
			else {
				let pst = PRESETS[nameID - 8]
				if (pst.name != name) {
					this.log('info', `PRESET #${pst.id} - NAME = ${name}`)
					pst.name = name
					PRESETS[nameID - 8] = pst
					this.setVariableValue(pst.var_name, name)
				}
			}
		}

		// PRESET
		else if (msg.slice(0, 7) == 'Preset:') {
			let p = msg.split(' ')
			let pst = this.getPstByName(p[1])

			// SAVE
			if (p[2] == 'Save') {
				this.log('info', `PT-MA-HD44M MATRIX | PRESET #${pst.id} SAVED >>> ${p[1]}`)
				this.saveLastPstID(pst.id)
			}
			// CALL
			else if (p[2] == 'Call') {
				this.log('info', `PT-MA-HD44M MATRIX | PRESET #${pst.id} RECALLED >>> ${p[1]}`)
				this.saveLastPstID(pst.id)

				// REFRESH INFO
				this.sendPriorityCommand('#get info')
			}
			// CLEAR
			else if (p[2] == 'Clear') {
				this.log('info', `PT-MA-HD44M MATRIX | PRESET #${pst.id} CLEARED >>> ${p[1]}`)
				if (this.getLastPstID() == pst.id) this.saveLastPstID(0)
			}
		}

		currentCmd = false

		this.sendNextCommand()
	}

	// CURRENT PRESET
	getLastPstID() {
		return this.getVariableValue('pst_last')
	}
	saveLastPstID(id) {
		id = parseInt(id)
		if (id < 0 || id > 8) return
		let last = this.getLastPstID()
		if (last != id) {
			this.setVariableValue('pst_last', id.toString())
			this.checkFeedbacks('last_pst')
		}
	}

	// SET VARIABLE VALUE
	setVariableValue(name, value) {
		const variables = {}
		variables[name] = value
		this.setVariableValues(variables)
	}
}

runEntrypoint(MatrixInstance, [])
