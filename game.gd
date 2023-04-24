extends Node2D

const TILE_SOURCE = 1
const TILE_LAYER = 0

@onready var map := $TileMap
@onready var camera := $TileMap/Camera2D


func _on_net_hack_print_glyph(x, y, glyph):
	map.set_cell(TILE_LAYER, Vector2(x, y), TILE_SOURCE, _glyph_to_tile(glyph))

func _glyph_to_tile(glyph: int) -> Vector2:
	if glyph == 341:
		return Vector2(28, 8)
	
	return Vector2(39, 29)


func _on_net_hack_center(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
