extends Node

const TILE_SOURCE = 3
const TILE_LAYER = 0
const TILE_SIZE_X = 40

const DIALOG = preload("res://src/dialog.tscn")

@export var map: TileMap
@export var camera: Camera2D

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
		# if code >= KEY_SPACE and code <= KEY_ASCIITILDE: # only allow ASCII code
		print(event)
		var window = JavaScriptBridge.get_interface("window")
		window.nethackJS.sendInput(event.keycode) # TODO: how to send modifiers?


func openMenuOne(args):
	print('Menu One: %s' % [args])

func openMenuAny(args):
	print('Menu Any: %s' % [args])

func openDialog(args):
	print('Dialog:  %s' % [args])
	var dialog = DIALOG.instantiate()
	add_child(dialog)
	
	var id = args[0]
	var txt = args[1]
	dialogs[id] = dialog
	dialog.open(txt)
	
func openQuestion(args):
	print('Question: %s' % [args])
	var question = args[0]
	var choices = []
	for i in range(1, args.size()):
		choices.append(args[i])

	printLine([question + " %s" % [choices]])

func closeDialog(args):
	print('Close Dialog: %s' % [args])
	var id = args[0]
	if id in dialogs:
		remove_child(dialogs[id])


func moveCursor(args):
	_move_camera(args[0], args[1])

func centerView(args):
	_move_camera(args[0], args[1])

func _move_camera(x, y):
	var pos = map.map_to_local(Vector2(x, y))
	camera.position = pos
	print("Move camera to %s" % pos)

func printLine(args):
	print('Print: %s' % [args])
	console.text += args[0] + "\n"


func updateStatus(args):
	print('Status: %s' % [args])

func updateInventory(args):
	print('Inventory: %s' % [args])
	inventory.update(args)

func updateMap(args):
	for tile in args:
		print("Tile: %s, %s - %s"  % [tile.x, tile.y, tile.tile])
		map.set_cell(TILE_LAYER, Vector2(tile.x, tile.y), TILE_SOURCE, _to_tilev(tile.tile))

func _to_tilev(tile: int) -> Vector2:
	# TODO: map correctly -> tileset needs to be updated for 3.7
	# https://github.com/NullCGT/SpliceHack
	var row = floor(tile / float(TILE_SIZE_X))
	var col = tile % TILE_SIZE_X
	return Vector2(col, row)

