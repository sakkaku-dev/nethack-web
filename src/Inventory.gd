class_name Inventory
extends Control

const ITEM = preload("res://src/item.tscn")

func update(items: Array):
	for c in get_children():
		remove_child(c)

	var current_group = null
	
	for item in items:
		print("Item: %s, %s" % [item.identifier, item.str])

		if item.identifier == 0:
			if current_group:
				add_child(current_group)
				current_group = _create_new_grid()
			
			var label = Label.new()
			label.text = str(item.str)
			add_child(label)
			continue
		
		if not current_group:
			current_group = _create_new_grid()

		var item_node = ITEM.instantiate()
		item_node.set_item(item)
		current_group.add_child(item_node)
			
	if current_group:
		add_child(current_group)

func _create_new_grid() -> GridContainer:
	var grid = GridContainer.new()
	grid.columns = 4
	grid.add_theme_constant_override("h_separation", 15)
	grid.add_theme_constant_override("v_separation", 5)
	return grid
