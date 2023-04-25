extends Node2D

const TILE_SOURCE = 1
const TILE_LAYER = 0
const TILE_SIZE_X = 40

@onready var map := $TileMap
@onready var camera := $TileMap/Camera2D


func _on_net_hack_print_tile(x, y, tile):
	print(tile)
	map.set_cell(TILE_LAYER, Vector2(x, y), TILE_SOURCE, _to_tilev(tile))

func _to_tilev(tile: int) -> Vector2:
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)


func _on_net_hack_center(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
