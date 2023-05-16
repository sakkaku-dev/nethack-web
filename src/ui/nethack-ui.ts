import { Item, Status, Tile } from "../models";

class Camera {
    private x = 0;
    private y = 0;
}

document.onkeypress = (e) => {
    if (e.ctrlKey) return; // should have been processed in keydown
    e.preventDefault();

    window.nethackJS.sendInput(e.charCode || e.keyCode);
};

document.onkeydown = (e) => {
    if (!e.ctrlKey) return; // key events without ctrl is handled in `keypress` events
    if (e.keyCode == 17) return; // ctrl is pressed down
    e.preventDefault();

    var code = e.charCode || e.keyCode;
    // some browsers do not `apply` the control key to charCode
    if (code >= 65 && code <= 90) {
        // A~Z
        code = code - 64;
    } else if (code >= 97 && code <= 122) {
        code = code - 96;
    }
    window.nethackJS.sendInput(code);
};

const dialog = document.querySelector("#dialog") as HTMLElement;
const output = document.querySelector("#output") as HTMLElement;
const inventory = document.querySelector("#inventory") as HTMLElement;
const status = document.querySelector("#status") as HTMLElement;
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
// TODO: set fixed or get correct size?
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const ctx = canvas.getContext("2d")!;
const tileset = new Image();
tileset.src = "Nevanda.png";
const tileSize = 32;
const tileCol = 40;

const drawTile = (x: number, y: number, tile: number) => {
    const row = Math.floor(tile / tileCol);
    const col = tile % tileCol;
    ctx.drawImage(
        tileset,
        col * tileSize,
        row * tileSize,
        tileSize,
        tileSize,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
    );
};

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
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.id = "menu";

    items.forEach((i) => {
        const div = document.createElement("div");
        const elem = document.createElement("input");
        const label = document.createElement("label");
        const id = `menu-${i.identifier}`;
        const accel = String.fromCharCode(i.accelerator);
        elem.type = count === 1 ? "radio" : "checkbox";
        elem.name = "menuSelect";
        elem.id = id;
        elem.disabled = i.identifier === 0;
        elem.checked = i.active;
        elem.value = `${i.identifier}`;
        label.htmlFor = id;
        label.innerHTML = `${accel ? accel + " - " : ""}${i.str}`;

        div.appendChild(elem);
        div.appendChild(label);
        list.appendChild(div);
    });

    return list;
};
const createDialogText = (text: string) => {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(text));
    dialog.appendChild(p);
    dialog.style.display = "block";
};
const appendOutputLine = (line: string) => {
    output.innerHTML += line;
    output.scrollTo(0, output.scrollHeight);
};

window.nethackUI = {
    openMenu(winid: number, prompt: string, count: number, ...items: Item[]) {
        clear(dialog);

        const elem = document.createElement("div");
        elem.innerHTML = prompt;
        dialog.appendChild(elem);

        dialog.appendChild(createMenu(items, count));

        const btn = document.createElement("button");
        btn.innerHTML = "Submit";
        btn.onclick = () => {
            const inputs = Array.from(document.querySelectorAll("#menu input")) as HTMLInputElement[];
            const ids = inputs
                .filter((i) => i.checked && !i.disabled)
                .map((i) => parseInt(i.value));
            window.nethackJS.selectMenu(ids);
        };

        dialog.appendChild(btn);
    },

    openQuestion: (question: string, ...choices: string[]) =>
        appendOutputLine(`\n${question} ${choices}\n`),
    openDialog: (winid: number, text: string) => createDialogText(text),
    printLine: (line: string) => appendOutputLine(line + "\n"),
    closeDialog: (winid: number) => {
        clear(dialog);
        dialog.style.display = "none";
    },

    moveCursor(x: number, y: number) { },
    centerView(x: number, y: number) { },
    updateMap(...tiles: Tile[]) {
        tiles.forEach((tile) => {
            drawTile(tile.x, tile.y, tile.tile);
        });
    },

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
