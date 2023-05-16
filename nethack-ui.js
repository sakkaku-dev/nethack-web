document.onkeypress = (e) => {
    if (e.ctrlKey)
        return; // should have been processed in keydown
    e.preventDefault();
    window.nethackJS.sendInput(e.charCode || e.keyCode);
};
document.onkeydown = (e) => {
    if (!e.ctrlKey)
        return; // key events without ctrl is handled in `keypress` events
    if (e.keyCode == 17)
        return; // ctrl is pressed down
    e.preventDefault();
    var code = e.charCode || e.keyCode;
    // some browsers do not `apply` the control key to charCode
    if (code >= 65 && code <= 90) {
        // A~Z
        code = code - 64;
    }
    else if (code >= 97 && code <= 122) {
        code = code - 96;
    }
    window.nethackJS.sendInput(code);
};
const dialog = document.querySelector("#dialog");
const output = document.querySelector("#output");
const inventory = document.querySelector("#inventory");
const status = document.querySelector("#status");
const canvas = document.querySelector("canvas");
// TODO: set fixed or get correct size?
canvas.width = 1920;
canvas.height = 1080;
const ctx = canvas.getContext("2d");
const tileset = new Image();
tileset.src = "Nevanda.png";
const tileSize = 32;
const tileCol = 40;
const drawTile = (x, y, tile) => {
    const row = Math.floor(tile / tileCol);
    const col = tile % tileCol;
    ctx.drawImage(tileset, col * tileSize, row * tileSize, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
};
const clear = (elem) => {
    Array.from(elem.children).forEach((c) => elem.removeChild(c));
};
const createItemList = (items) => {
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
        }
        else {
            elem.innerHTML = `${String.fromCharCode(i.accelerator)} - ${i.str}`;
        }
        return elem;
    })
        .forEach((i) => list.appendChild(i));
    return list;
};
const createMenu = (items, count) => {
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
const createDialogText = (text) => {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(text));
    dialog.appendChild(p);
    dialog.style.display = "block";
};
const appendOutputLine = (line) => {
    output.innerHTML += line;
    output.scrollTo(0, output.scrollHeight);
};
window.nethackUI = {
    openMenu(winid, prompt, count, ...items) {
        clear(dialog);
        const elem = document.createElement("div");
        elem.innerHTML = prompt;
        dialog.appendChild(elem);
        dialog.appendChild(createMenu(items, count));
        const btn = document.createElement("button");
        btn.innerHTML = "Submit";
        btn.onclick = () => {
            const inputs = Array.from(document.querySelectorAll("#menu input"));
            const ids = inputs
                .filter((i) => i.checked && !i.disabled)
                .map((i) => parseInt(i.value));
            window.nethackJS.selectMenu(ids);
        };
        dialog.appendChild(btn);
    },
    openQuestion: (question, ...choices) => appendOutputLine(`\n${question} ${choices}\n`),
    openDialog: (winid, text) => createDialogText(text),
    printLine: (line) => appendOutputLine(line + "\n"),
    closeDialog: (winid) => {
        clear(dialog);
        dialog.style.display = "none";
    },
    moveCursor(x, y) { },
    centerView(x, y) { },
    updateMap(...tiles) {
        tiles.forEach((tile) => {
            drawTile(tile.x, tile.y, tile.tile);
        });
    },
    updateStatus(s) {
        status.innerHTML = `${s.title} ${s.align}`; // TODO: set player name
        status.innerHTML += `\nStr: ${s.str} Dex: ${s.dex} Con: ${s.con} Int: ${s.int} Wis: ${s.wis} Cha: ${s.cha}`;
        status.innerHTML += `\nDlvl ${s.dungeonLvl} HP: ${s.hp}/${s.hpMax} Pw: ${s.power}/${s.powerMax} AC: ${s.armor} EXP: ${s.expLvl} $: ${s.gold}`;
    },
    updateInventory(...items) {
        clear(inventory);
        inventory.appendChild(createItemList(items));
    },
};
