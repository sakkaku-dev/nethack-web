extends Node2D

var init = """
const Module = {
	onRuntimeInitialized: () => {
		Module.ccall(
			'shim_graphics_set_callback',
			null, 
			['string'],
			['nethackCallback'],
			{async: true},
		);
	}
}

nethack.default(Module);
"""

var cb

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	
	cb = JavaScriptBridge.create_callback(self._callback)
	window.nethackCallback = cb
	
	JavaScriptBridge.eval("import('./nethack.js').then(nethack => {" +init+ "})", true)

func _callback(args):
	print(args)

	var cmd = args[0]
	match cmd:
		NetHack.CMD.GET_HISTORY:
			return ''

		NetHack.CMD.YN_FUNCTION, NetHack.CMD.MESSAGE_MENU:
			return 121 # 'y' in ascii

	return 0
