extends Node2D

const TILE_SOURCE = 1
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@onready var map := $TileMap
@onready var camera := $TileMap/Camera2D

# reference needs to be stored until the callback is called
var menu_any = JavaScriptBridge.create_callback(self._on_open_menu_any)
var menu_one = JavaScriptBridge.create_callback(self._on_open_menu_one)
var print_tile = JavaScriptBridge.create_callback(self._on_print_tile)
var move_cursor = JavaScriptBridge.create_callback(self._on_move_cursor)
var center_view = JavaScriptBridge.create_callback(self._on_center_view)
var update_status = JavaScriptBridge.create_callback(self._on_update_status)
var show_menu_text = JavaScriptBridge.create_callback(self._on_show_menu_text)
var show_full_text = JavaScriptBridge.create_callback(self._on_show_full_text)
var show_message = JavaScriptBridge.create_callback(self._on_show_message)

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	var obj = JavaScriptBridge.create_object("Object")
	obj.openMenuAny = menu_any
	obj.openMenuOne = menu_one
	obj.printTile = print_tile
	obj.moveCursor = move_cursor
	obj.centerView = center_view
	obj.updateStatus = update_status
	obj.showMenuText= show_menu_text
	obj.showFullText = show_full_text
	obj.showMessage = show_message
	window.nethackGodot = obj

	JavaScriptBridge.eval("import('./nethack.js')")

func _on_open_menu_one(args):
	print('Menu One: %s' % [args])

func _on_open_menu_any(args):
	print('Menu Any: %s' % [args])

func _on_print_tile(args):
	var x = args[0]
	var y = args[1]
	var tile = args[2]
	map.set_cell(TILE_LAYER, Vector2(x, y), TILE_SOURCE, _to_tilev(tile))

func _to_tilev(tile: int) -> Vector2:
	# TODO: map correctly -> tileset needs to be updated for 3.7
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)


func _on_move_cursor(args):
	_move_camera(args[0], args[1])

func _on_center_view(args):
	_move_camera(args[0], args[1])

func _move_camera(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos

func _on_update_status(args):
	print('Status: %s' % [args])

func _on_show_menu_text(args):
	print('Message:  %s' % [args])
