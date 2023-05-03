extends Node

const TILE_SOURCE = 0
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@export var DIALOG: PackedScene
@export var MENU: PackedScene

@export var map: TileMap
@export var camera: Camera2D
@export var cursor: Node2D

@export var status: StatusNode
@export var inventory: Inventory
@export var console: RichTextLabel

var link = NetHackLink.new()
var dialogs = {}

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	window.nethackGodot = link.init(self)
	JavaScriptBridge.eval("import('./nethack.js')")
	
	console.text = ""
	
func _unhandled_input(event: InputEvent):
	if event is InputEventKey and event.is_pressed():
		var code = event.keycode
		if code >= KEY_SPACE and code <= KEY_ASCIITILDE or code == KEY_ENTER: # only allow ASCII code
			var is_ctrl = Input.is_key_pressed(KEY_CTRL)
			var window = JavaScriptBridge.get_interface("window")
			var unicode = event.unicode
			if is_ctrl:
				window.nethackJS.sendInput(KEY_CTRL & code)
			else:
				window.nethackJS.sendInput(unicode)

func _to_js_array(arr: Array):
	var js_arr = JavaScriptBridge.create_object("Array")
	for x in arr:
		js_arr.push(x)
	return js_arr

func openMenu(args):
	var id = args.pop_front()
	var prompt = args.pop_front()
	var count = args.pop_front()

	var menu = MENU.instantiate() as Menu
	_register_dialog(id, menu)
	menu.open(prompt, args, count)
	menu.selected.connect(func(ids): self._send_select(ids, id))


func _send_select(ids: Array, id: int):
	closeDialog([id]) # sometimes destroy command is not sent
	var window = JavaScriptBridge.get_interface("window")
	window.nethackJS.selectMenu(_to_js_array(ids))

func openDialog(args):
	var dialog = DIALOG.instantiate()
	var id = args[0]
	var txt = args[1]
	_register_dialog(id, dialog)
	dialog.open(txt)

func _register_dialog(id, dialog):
	if id in dialogs:
		print('removing existing dialog wih id %s' % id)
		var node = dialogs[id] as Node
		remove_child(node)

	dialogs[id] = dialog
	add_child(dialog)

func openQuestion(args):
	var question = args[0]

	# Choices is contained in question?
	# var choices = []
	# for i in range(1, args.size()):
	# 	choices.append(args[i])

	var line = question
	# if choices.size() > 0:
	# 	line += " " + str(choices)
	printLine([line])

func closeDialog(args):
	var id = args[0]
	if id in dialogs:
		remove_child(dialogs[id])


func moveCursor(args):
	var pos = _move_camera(args[0], args[1])
	cursor.position = pos

func centerView(args):
	_move_camera(args[0], args[1])

func _move_camera(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
	return pos

func printLine(args):
	console.text += args[0] + "\n"


func updateStatus(args):
	status.update(args[0])

func updateInventory(args):
	inventory.update(args)

func updateMap(args):
	for tile in args:
		map.set_cell(TILE_LAYER, Vector2(tile.x, tile.y), TILE_SOURCE, _to_tilev(tile.tile))

func _to_tilev(tile: int) -> Vector2:
	# TODO: map correctly -> tileset needs to be updated for 3.7
	# https://github.com/NullCGT/SpliceHack
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)

