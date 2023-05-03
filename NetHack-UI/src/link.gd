# This is generated. Do not edit
class_name NetHackLink

var openMenu
var openDialog
var openQuestion
var closeDialog
var moveCursor
var centerView
var printLine
var updateMap
var updateStatus
var updateInventory

func init(cb):
	var obj = JavaScriptBridge.create_object("Object")
	openMenu = JavaScriptBridge.create_callback(cb.openMenu)
	obj.openMenu = openMenu

	openDialog = JavaScriptBridge.create_callback(cb.openDialog)
	obj.openDialog = openDialog

	openQuestion = JavaScriptBridge.create_callback(cb.openQuestion)
	obj.openQuestion = openQuestion

	closeDialog = JavaScriptBridge.create_callback(cb.closeDialog)
	obj.closeDialog = closeDialog

	moveCursor = JavaScriptBridge.create_callback(cb.moveCursor)
	obj.moveCursor = moveCursor

	centerView = JavaScriptBridge.create_callback(cb.centerView)
	obj.centerView = centerView

	printLine = JavaScriptBridge.create_callback(cb.printLine)
	obj.printLine = printLine

	updateMap = JavaScriptBridge.create_callback(cb.updateMap)
	obj.updateMap = updateMap

	updateStatus = JavaScriptBridge.create_callback(cb.updateStatus)
	obj.updateStatus = updateStatus

	updateInventory = JavaScriptBridge.create_callback(cb.updateInventory)
	obj.updateInventory = updateInventory

	return obj