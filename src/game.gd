extends Node2D

const TILE_SOURCE = 1
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@onready var map := $TileMap
@onready var camera := $TileMap/Camera2D


var menu_one
var menu_any
var print_tile
var move_cursor

func _ready():
	var window = JavaScriptBridge.get_interface("window")
	var obj = JavaScriptBridge.create_object("Object")
	menu_one = JavaScriptBridge.create_callback(self._on_open_menu_one)
	menu_any = JavaScriptBridge.create_callback(self._on_open_menu_any)
	print_tile = JavaScriptBridge.create_callback(self._on_print_tile)
	move_cursor = JavaScriptBridge.create_callback(self._on_move_cursor)

	obj.openMenuAny = menu_any
	obj.openMenuOne = menu_one
	obj.printTile = print_tile
	obj.moveCursor = move_cursor
	window.nethackGodot = obj

	JavaScriptBridge.eval("import('./nethack.js')")

func _on_open_menu_one(args):
	print(args)

func _on_open_menu_any(args):
	print(args)

func _on_print_tile(args):
	var x = args[0]
	var y = args[1]
	var tile = args[2]
	map.set_cell(TILE_LAYER, Vector2(x, y), TILE_SOURCE, _to_tilev(tile))

func _to_tilev(tile: int) -> Vector2:
	# TODO: map correctly
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)


func _on_move_cursor(args):
	var x = args[0]
	var y = args[1]
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
