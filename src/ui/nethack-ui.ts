import { BehaviorSubject, Subject, debounceTime } from "rxjs";
import { Item, Status, Tile } from "../models";
import { TileMap, TileSet } from "./tilemap";

const output = document.querySelector("#output") as HTMLElement;
const inventory = document.querySelector("#inventory") as HTMLElement;
const status = document.querySelector("#status") as HTMLElement;
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const cursor = document.querySelector("#cursor") as HTMLElement;

document.onkeydown = (e) => {
  if (e.key === "Control" || e.key === "Shift") return;
  e.preventDefault();

  let code = e.key.charCodeAt(0);
  if (e.ctrlKey) {
    if (code >= 65 && code <= 90) {
      // A~Z
      code = code - 64;
    } else if (code >= 97 && code <= 122) {
      code = code - 96;
    }
  }
  window.nethackJS.sendInput(code);
};

const tileset = new TileSet("Nevanda.png", 32, 40);
const tilemap = new TileMap(canvas, cursor, tileset);
const resize$ = new Subject<void>();
document.body.onresize = (e) => resize$.next();
resize$.pipe(debounceTime(200)).subscribe(() => tilemap.onResize());


const clear = (elem: HTMLElement) => {
  Array.from(elem.children).forEach((c) => elem.removeChild(c));
};
const createItemList = (items: Item[]) => {
  const list = document.createElement("ul");
  list.style.listStyleType = "none";
  items
    .map((i) => {
      const elem = document.createElement("li");
      elem.style.fontWeight = i.active ? "bold" : "";
      if (i.identifier === 0) {
        elem.innerHTML = i.str;
        elem.style.fontSize = "1.1rem";
        elem.style.margin = "0.5rem 0";
      } else {
        elem.innerHTML = `${String.fromCharCode(i.accelerator)} - ${i.str}`;
      }
      return elem;
    })
    .forEach((i) => list.appendChild(i));
  return list;
};
const createMenu = (items: Item[], count: number) => {
  const list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.id = "menu";

  items.forEach((i) => {
    const div = document.createElement("div");
    const elem = document.createElement("input");
    const label = document.createElement("label");
    const id = `menu-${i.identifier}`;
    const hasAccel = i.accelerator !== 0;
    const accel = String.fromCharCode(i.accelerator);
    elem.type = count === 1 ? "radio" : "checkbox";
    elem.name = "menuSelect";
    elem.id = id;
    elem.disabled = i.identifier === 0;
    elem.checked = i.active;
    elem.value = `${i.identifier}`;
    label.htmlFor = id;
    label.innerHTML = `${hasAccel ? accel : " "} - ${i.str}`;

    div.appendChild(elem);
    div.appendChild(label);
    list.appendChild(div);
  });

  return list;
};
const createDialogText = (id: number, text: string) => {
  const dialog = document.createElement("pre");
  dialog.classList.add("dialog");
  dialog.innerHTML = text;
  document.body.appendChild(dialog);
  setTimeout(() => {
    dialog.classList.add("open");
  }, 100);
  return dialog;
};
const appendOutputLine = (line: string) => {
  output.innerHTML += line;
  output.scrollTo(0, output.scrollHeight);
};

window.nethackUI = {
  openMenu(winid: number, prompt: string, count: number, ...items: Item[]) {
    const dialog = createDialogText(winid, prompt);
    dialog.appendChild(createMenu(items, count));

    const btn = document.createElement("button");
    btn.innerHTML = "Submit";
    btn.onclick = () => {
      const inputs = Array.from(document.querySelectorAll("#menu input")) as HTMLInputElement[];
      const ids = inputs.filter((i) => i.checked && !i.disabled).map((i) => parseInt(i.value));
      window.nethackJS.selectMenu(ids);
    };
    dialog.appendChild(btn);
  },

  openQuestion: (question: string, ...choices: string[]) =>
    appendOutputLine(`\n${question} ${choices}\n`),
  openDialog: (winid: number, text: string) => createDialogText(winid, text),
  printLine: (line: string) => appendOutputLine(line + "\n"),
  closeDialog: (winid: number) => {
    document.querySelectorAll(`.dialog`).forEach((elem) => {
      elem.classList.remove("open");
      setTimeout(() => elem.remove(), 100);
    });
  },

  moveCursor: (x: number, y: number) => tilemap.recenter({ x, y }),
  centerView: (x: number, y: number) => tilemap.recenter({ x, y }),
  updateMap: (...tiles: Tile[]) => tiles.forEach((tile) => tilemap.addTile(tile)),

  updateStatus(s: Status) {
    status.innerHTML = `${s.title} ${s.align}`; // TODO: set player name
    status.innerHTML += `\nStr: ${s.str} Dex: ${s.dex} Con: ${s.con} Int: ${s.int} Wis: ${s.wis} Cha: ${s.cha}`;
    status.innerHTML += `\nDlvl ${s.dungeonLvl} HP: ${s.hp}/${s.hpMax} Pw: ${s.power}/${s.powerMax} AC: ${s.armor} EXP: ${s.expLvl} $: ${s.gold}`;
  },
  updateInventory(...items: Item[]) {
    clear(inventory);
    inventory.appendChild(createItemList(items));
  },
};
