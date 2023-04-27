class_name Status
extends Control

@export var title: Label
@export var align: Label

@export var str_: Label
@export var dex: Label
@export var con: Label
@export var int_: Label
@export var wis: Label
@export var cha: Label

@export var hp: Label
@export var ac: Label
@export var power: Label
@export var exp_: Label
@export var gold: Label
@export var dungeon: Label

@export var carry: Label
@export var condition: Label
@export var hunger: Label

func _ready():
	carry.text = ""
	condition.text = ""
	hunger.text = ""
	_update_exp(0, 1)

func update(status):
	title.text = status.title
	align.text = status.align

	str_.text = str(status.str)
	dex.text = str(status.dex)
	con.text = str(status.con)
	int_.text = str(status.int)
	wis.text = str(status.wis)
	cha.text = str(status.cha)

	hp.text = str(status.hp) + "/" + str(status.hpMax)
	ac.text = str(status.armor)
	power.text = str(status.power) + "/" + str(status.powerMax)
	dungeon.text = str(status.dungeonLvl)
	gold.text = str(status.gold)

	_update_exp(status.exp, status.expLvl)

	if status.carryCap:
		carry.text = status.carryCap

	if status.condition:
		condition.text = status.condition

	if status.hunger:
		hunger.text = status.hunger

func _update_exp(status_exp: int, lvl: int):
	var ex = 0
	if status_exp:
		ex = status_exp
	exp_.text = "%s (LV %s)" % [ex, lvl]
