import { Subject, debounceTime } from "rxjs";
import { Item } from "../../models";
import { Console } from "../components/console";
import { Dialog } from "../components/dialog";
import { Inventory } from "../components/inventory";
import { Line } from "../components/line";
import { Menu, MenuItem } from "../components/menu";
import { StatusLine } from "../components/status";
import { TileSet, TileMap } from "../components/tilemap";
import { Screen } from "./screen";

const SPECIAL_KEY_MAP: Record<string, number> = {
    'Enter': 13,
    'Escape': 27,
}

export class GameScreen extends Screen {

    public tileset: TileSet;
    public tilemap: TileMap;
    public inventory: Inventory;
    public console: Console;
    public status: StatusLine;

    private resize$ = new Subject<void>();
    private resizeListener = (e: Event) => this.resize$.next();

    constructor() {
        super();

        this.tileset = new TileSet("Nevanda.png", 32, 40);
        this.tilemap = new TileMap(this.elem, this.tileset);
        this.inventory = new Inventory(this.elem, this.tileset);
        this.console = new Console(this.elem);
        this.status = new StatusLine(this.elem);

        this.resize$.pipe(debounceTime(200)).subscribe(() => this.tilemap?.onResize());

        this.changeInput(this);
    }

    show() {
        super.show();
        document.body.onresize = this.resizeListener.bind(this);
    }

    hide() {
        super.hide();
        document.body.removeEventListener('onresize', this.resizeListener.bind(this));
    }

    input(e: KeyboardEvent): void {
        if (e.key === "Control" || e.key === "Shift") return;

        if (e.key.length === 1 || SPECIAL_KEY_MAP[e.key]) {
            e.preventDefault();

            let code = 0;

            const specialKey = SPECIAL_KEY_MAP[e.key];
            if (specialKey) {
                code = specialKey;
            } else {
                code = e.key.charCodeAt(0);
                if (e.ctrlKey) {
                    if (code >= 65 && code <= 90) {
                        // A~Z
                        code = code - 64;
                    } else if (code >= 97 && code <= 122) {
                        code = code - 96;
                    }
                }
            }
            window.nethackJS.sendInput(code);
        } else {
            console.log('Unhandled key: ', e.key);
        }
    }


    public openMenu(prompt: string, count: number, items: Item[]) {
        const menuItems: MenuItem[] = items.map(i => ({ text: i.str, id: i.identifier, tile: i.tile, active: i.active, accelerator: i.accelerator }));
        const menu = new Menu(prompt, menuItems, count, this.tileset!);
        menu.onSelect = ids => {
            window.nethackJS.selectMenu(ids.map(i => parseInt(i)));
            this.resetInput();
            Dialog.removeAll();
        };
        this.changeInput(menu);
        this.elem.appendChild(menu.elem);
    }

    public openDialog(text: string) {
        const dialog = new Dialog(text);
        dialog.onClose = () => {
            window.nethackJS.sendInput(0);
            this.resetInput();
        };
        this.changeInput(dialog);
        this.elem.appendChild(dialog.elem);
    }

    public openGetLine(question: string, autocomplete: string[]) {
        const line = new Line(question, autocomplete);
        line.onLineEnter = (line) => {
            window.nethackJS.sendLine(line);
            this.resetInput();
            Dialog.removeAll(); // Usually not opened as a dialog, so close it ourself
        };
        this.changeInput(line);
        this.elem.appendChild(line.elem);
        line.focus();
    }

    public openErrorDialog(closed: () => void) {
        const title = 'An unexpected error occurred.';
        const unsaved = 'Unfortunately the game progress could not be saved.';
        const backup = 'Use the "Load from backup" in the main menu to restart from your latest save.';
        const dialog = new Dialog(`${title}\n${unsaved}\n\n${backup}`)
        dialog.onClose = () => {
            this.resetInput();
            closed();
        }
        this.changeInput(dialog);
        this.elem.appendChild(dialog.elem);
    }
}