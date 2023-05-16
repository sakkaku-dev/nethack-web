extends Control

@export var accel_label: Label
@export var sprite: TextureRect
@export var active_border: Control

func set_item(item):
	accel_label.text = char(item.accelerator)
	self.tooltip_text = str(item.str)
	
	var mat = sprite.material.duplicate() as ShaderMaterial
	mat.set_shader_parameter("pos", Utils.to_tilev(item.tile))
	sprite.material = mat
	
	active_border.visible = item.active
	
