class_name Utils

const TILE_SIZE_X = 40

static func to_tilev(tile: int) -> Vector2:
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)
