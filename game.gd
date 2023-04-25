extends Node2D

const TILE_SOURCE = 1
const TILE_LAYER = 0

@onready var map := $TileMap
@onready var camera := $TileMap/Camera2D


func _on_net_hack_print_tile(x, y, tile):
	print(tile)
	map.set_cell(TILE_LAYER, Vector2(x, y), TILE_SOURCE, _to_tilev(tile))

func _to_tilev(tile: int) -> Vector2:
	if glyph == 341:
		return Vector2(28, 8)
	
	return Vector2(39, 29)


func _on_net_hack_center(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
