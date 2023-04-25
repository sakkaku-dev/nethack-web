class_name NetHack
extends Node

signal print_tile(x, y, glyph)
signal center(x, y)

signal message(str)
signal open_menu(type, items, prompt)
signal selected_items(items)

const CMD = {
	GET_HISTORY = "shim_getmsghistory",
	YN_FUNCTION = "shim_yn_function",
	MESSAGE_MENU = "shim_message_menu",

	STATUS_INIT = "shim_status_init",

	INIT_WINDOW = "shim_init_nhwindows",
	CREATE_WINDOW = "shim_create_nhwindow",
	DISPLAY_WINDOW = "shim_display_nhwindow",
	CLEAR_WINDOW = "shim_clear_nhwindow",

	MENU_START = "shim_start_menu",
	MENU_END = "shim_end_menu",
	MENU_ADD = "shim_add_menu",
	MENU_SELECT = "shim_select_menu",

	PRINT_TILE = "shim_print_tile",
	# PRINT_GLYPH = "shim_print_glyph",
	CURSOR = "shim_curs",
}

enum WindowType {
	MESSAGE = 1,
	STATUS = 2,
	MAP = 3,
	MENU = 4,
	TEXT = 5
}

enum WindowId {
	MESSAGE = 1,
	MAP = 2,
	INVENTORY = 3,
}

enum Select {
	NONE = 0,
	ONE = 1,
	ANY = 2,
}

var init = """
const Module = {
	ENV: {
		'USER': 'player'
	},
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

return nethack.default(Module);
"""

var cb

var idCounter = 0
var win = {}

const ignored = [CMD.INIT_WINDOW, CMD.DISPLAY_WINDOW, CMD.STATUS_INIT, CMD.CLEAR_WINDOW]

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	
	cb = JavaScriptBridge.create_callback(self._callback)
	window.nethackCallback = cb
	
	JavaScriptBridge.eval("import('./nethack.js').then(nethack => {" +init+ "})", true)

func _callback(args):
	var cmd = args[0]

	if cmd == CMD.CREATE_WINDOW:
		return _create_window(args[1])

	if cmd == CMD.MENU_START:
		_menu_start(args[1])
		return
		
	if cmd == CMD.MENU_ADD:
		_menu_add(args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8])
		return

	if cmd == CMD.MENU_END:
		_menu_end(args[1], args[2])
		return
	
	if cmd == CMD.MENU_SELECT:
		return await _menu_select(args[1], args[2], args[3])
	
	if cmd == CMD.PRINT_TILE:
		_print_tile(args[1], args[2], args[3], args[4])
		return
	
	if cmd == CMD.CURSOR:
		_center_to(args[1], args[2], args[3])
		return

	if cmd in ignored:
		return 0

	print(args)
	match cmd:
		CMD.GET_HISTORY:
			return ''

		CMD.YN_FUNCTION, CMD.MESSAGE_MENU:
			return 121 # 'y' in ascii

	return 0

func _create_window(type):
	idCounter += 1
	win[idCounter] = {'type': type}
	print('Create new window %s of type %s: %s' % [idCounter, WindowType.keys()[type], win[idCounter]])
	return idCounter


func _menu_start(id):
	win[id]['menu'] = []

func _menu_add(id, glyph, identifier, accelerator, group_accel, attr, text, preselected):
	var menu = win[id]['menu']
	menu.append({
		'glyph': glyph,
		'identifier': identifier,
		'accelerator': accelerator,
		'group_accel': group_accel,
		'attr': attr,
		'str': text,
		'preselected': preselected,
	})

func _menu_end(id, prompt):
	win[id]['menu_prompt'] = prompt;
	

func _menu_select(id, select, selected):
	var menu = win[id]['menu']
	var prompt = win[id]['menu_prompt']
	if menu.size() > 0 and select != Select.NONE:
		print('Open menu: %s' % menu)

		open_menu.emit(select, menu, prompt)
		var items = await selected_items

		for item in items:
			selected.append({'item': item, 'count': 1})
		return items.size()
	
	return 0

func _print_tile(_id, x, y, tile):
	print_tile.emit(x, y, tile)

func _center_to(_id, x, y):
	center.emit(x, y)
