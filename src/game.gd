extends Node

const TILE_SOURCE = 1
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@export var map: TileMap
@export var camera: Camera2D

var link = NetHackLink.new()

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	window.nethackGodot = link.init(self)

	JavaScriptBridge.eval("import('./nethack.js')")
	
func _unhandled_input(event: InputEvent):
	if event is InputEventKey and event.is_pressed():
		print(event)
		var window = JavaScriptBridge.get_interface("window")
		window.nethackJS.sendInput(event.keycode)


func _on_open_menu_one(args):
	print('Menu One: %s' % [args])

func _on_open_menu_any(args):
	print('Menu Any: %s' % [args])

func _on_open_dialog(args):
	print('Dialog:  %s' % [args])

func _on_open_question(args):
	print('Question: %s' % [args])


func _on_move_cursor(args):
	_move_camera(args[0], args[1])

func _on_center_view(args):
	_move_camera(args[0], args[1])

func _move_camera(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos

func _on_print_line(args):
	print('Print: %s' % [args])


func _on_update_status(args):
	print('Status: %s' % [args])

func _on_update_inventory(args):
	print('Inventory: %s' % [args])

func _on_update_map(args):
	for tile in args:
		print(tile.x, tile.y, tile.tile)
		map.set_cell(TILE_LAYER, Vector2(tile.x, tile.y), TILE_SOURCE, _to_tilev(tile.tile))

func _to_tilev(tile: int) -> Vector2:
	# TODO: map correctly -> tileset needs to be updated for 3.7
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)

