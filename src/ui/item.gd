extends VBoxContainer

@export var accel_label: Label

func set_item(item):
	accel_label.text = char(item.accelerator)
	self.tooltip_text = str(item.str)

	# TODO: show correct image
