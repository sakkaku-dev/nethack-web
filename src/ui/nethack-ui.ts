import { Item, Status, Tile } from "../models";
import { Dialog } from "./components/dialog";
import { Game } from "./game";

const game = new Game();
const main = game.game;

window.nethackUI = {
  openMenu: (winid: number, prompt: string, count: number, ...items: Item[]) => main.openMenu(prompt, count, items),
  openQuestion: (question: string, ...choices: string[]) => main.console.appendLine(`\n${question} ${choices}`),
  openGetLine: (question: string, ...autocomplete: string[]) => main.openGetLine(question, autocomplete),
  openDialog: (winid: number, text: string) => main.openDialog(text),
  closeDialog: (winid: number) => Dialog.removeAll(),
  printLine: (line: string) => main.console.appendLine(line),
  moveCursor: (x: number, y: number) => main.tilemap.recenter({ x, y }),
  centerView: (x: number, y: number) => main.tilemap.recenter({ x, y }),
  clearMap: () => main.tilemap.clearMap(),
  updateMap: (...tiles: Tile[]) => main.tilemap.addTile(...tiles),
  updateStatus: (s: Status) => main.status.update(s),
  updateInventory: (...items: Item[]) => main.inventory.updateItems(items),
};
