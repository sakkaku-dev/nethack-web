class_name Menu
extends Control

signal selected(ids)

@export var prompt_label: Label
@export var items_container: Control

var select_count = 0
var selected_ids = []
var start_accel = 97 # a
var previous_accel = start_accel
var item_map = {}

func _unhandled_input(ev: InputEvent):
	if ev is InputEventKey:
		if ev.unicode in item_map:
			_on_pressed(item_map[ev.unicode])
			get_viewport().set_input_as_handled()

func open(prompt: String, items: Array, count: int) -> void:
	select_count = count
	
	if prompt:
		prompt_label.text = prompt
		prompt_label.show()
	else:
		prompt_label.hide()
	
	for item in items:
		if item.identifier == 0:
			var label = Label.new()
			label.text = item.str
			items_container.add_child(label)
		else:
			var btn = Button.new()
			var accel = item.accelerator
			
			# Assuming if one does not have accel, all other too
			if item.accelerator == 0:
				accel = previous_accel
				previous_accel += 1
				
			btn.text = "%s - %s" % [String.chr(accel), item.str]
			item_map[accel] = item.identifier

			btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
			btn.toggle_mode = true
			btn.pressed.connect(func(): self._on_pressed(item.identifier))
			items_container.add_child(btn)

func _on_pressed(id: int):
	if select_count == 1:
		selected.emit([id])
	else:
		if id in selected_ids:
			selected_ids.erase(id)
		else:
			selected_ids.append(id)
