class_name NetHackLink

var openMenuAny
var openMenuOne
var openDialog
var openQuestion
var moveCursor
var centerView
var printLine
var updateMap
var updateStatus
var updateInventory

func init(cb):
	var obj = JavaScriptBridge.create_object("Object")
	openMenuAny = JavaScriptBridge.create_callback(cb.openMenuAny)
	obj.openMenuAny = openMenuAny

	openMenuOne = JavaScriptBridge.create_callback(cb.openMenuOne)
	obj.openMenuOne = openMenuOne

	openDialog = JavaScriptBridge.create_callback(cb.openDialog)
	obj.openDialog = openDialog

	openQuestion = JavaScriptBridge.create_callback(cb.openQuestion)
	obj.openQuestion = openQuestion

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