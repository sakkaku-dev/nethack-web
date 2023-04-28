extends CenterContainer

@export var text_node: RichTextLabel

func open(text: String):
	text_node.text = text
