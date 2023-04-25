extends Node2D

const TILE_SOURCE = 1
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@onready var map := $TileMap
@onready var camera := $TileMap/Camera2D

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	var menu_one = JavaScriptBridge.create_callback(self._on_open_menu_one)
	var menu_any = JavaScriptBridge.create_callback(self._on_open_menu_any)
	var print_tile = JavaScriptBridge.create_callback(self._on_print_tile)
	var move_cursor = JavaScriptBridge.create_callback(self._on_move_cursor)

	window.nethackGodot = {
		"openMenuAny": menu_any,
		"openMenuOne": menu_one,
		"printTile": print_tile,
		"moveCursor": move_cursor,
	}

	JavaScriptBridge.eval("import('./nethack.js')")

func _on_open_menu_one(items):
	print(items)

func _on_open_menu_any(items):
	print(items)

func _on_print_tile(x, y, tile):
	print(tile)
	map.set_cell(TILE_LAYER, Vector2(x, y), TILE_SOURCE, _to_tilev(tile))

func _to_tilev(tile: int) -> Vector2:
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)


func _on_move_cursor(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
