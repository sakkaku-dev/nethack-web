extends Node

const TILE_SOURCE = 1
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@export var map: TileMap
@export var camera: Camera2D

# reference needs to be stored until the callback is called
var obj = JavaScriptBridge.create_object("Object")
# obj.open_menu_any = JavaScriptBridge.create_callback(self._on_open_menu_any)
# obj.open_menu_one = JavaScriptBridge.create_callback(self._on_open_menu_one)
# obj.open_dialog = JavaScriptBridge.create_callback(self._on_open_dialog)
# obj.open_question = JavaScriptBridge.create_callback(self._on_open_question)

# obj.move_cursor = JavaScriptBridge.create_callback(self._on_move_cursor)
# obj.center_view = JavaScriptBridge.create_callback(self._on_center_view)
# obj.print_line = JavaScriptBridge.create_callback(self._on_print_line)

# obj.update_status = JavaScriptBridge.create_callback(self._on_update_status)
# obj.update_map = JavaScriptBridge.create_callback(self._on_update_map)
# obj.update_inventory= JavaScriptBridge.create_callback(self._on_update_inventory)


func _ready():
	obj.openMenuAny = JavaScriptBridge.create_callback(self._on_open_menu_any)
	obj.openMenuOne = JavaScriptBridge.create_callback(self._on_open_menu_one)
	obj.openDialog = JavaScriptBridge.create_callback(self._on_open_dialog)
	obj.openQuestion = JavaScriptBridge.create_callback(self._on_open_question)

	obj.moveCursor = JavaScriptBridge.create_callback(self._on_move_cursor)
	obj.centerView = JavaScriptBridge.create_callback(self._on_center_view)
	obj.printLine = JavaScriptBridge.create_callback(self._on_print_line)

	obj.updateStatus = JavaScriptBridge.create_callback(self._on_update_status)
	obj.updateMap = JavaScriptBridge.create_callback(self._on_update_map)
	obj.updateInventory= JavaScriptBridge.create_callback(self._on_update_inventory)
	
	var window = JavaScriptBridge.get_interface("window")
	window.nethackGodot = obj

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
		map.set_cell(TILE_LAYER, Vector2(tile.x, tile.y), TILE_SOURCE, _to_tilev(tile.tile))

func _to_tilev(tile: int) -> Vector2:
	# TODO: map correctly -> tileset needs to be updated for 3.7
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)

