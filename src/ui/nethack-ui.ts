import { Item, Status, Tile } from "../models";
import { Dialog } from "./dialog";
import { Game } from "./game";

const game = new Game();

window.nethackUI = {
  openMenu: (winid: number, prompt: string, count: number, ...items: Item[]) => game.openMenu(prompt, count, items),
  openQuestion: (question: string, ...choices: string[]) => game.console.appendLine(`\n${question} ${choices}`),
  openGetLine: (question: string, ...autocomplete: string[]) => game.openGetLine(question, autocomplete),
  openDialog: (winid: number, text: string) => game.openDialog(text),
  closeDialog: (winid: number) => Dialog.removeAll(),

  printLine: (line: string) => game.console.appendLine(line),

  moveCursor: (x: number, y: number) => game.tilemap.recenter({ x, y }),
  centerView: (x: number, y: number) => game.tilemap.recenter({ x, y }),
  updateMap: (...tiles: Tile[]) => game.tilemap.addTile(...tiles),
  updateStatus: (s: Status) => game.status.update(s),
  updateInventory: (...items: Item[]) => game.inventory.updateItems(items),
};
