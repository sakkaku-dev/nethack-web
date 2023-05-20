import { Subject, debounceTime } from "rxjs";
import { TileMap, TileSet } from "./tilemap";
import { Inventory } from "./inventory";
import { Console } from "./console";
import { StatusLine } from "./status";
import { Menu } from "./menu";
import { Item } from "../models";
import { Dialog } from "./dialog";
import { InputHandler } from "./input";
import { Line } from "./line";

export class Game implements InputHandler {

    public tileset: TileSet;
    public tilemap: TileMap;
    public inventory: Inventory;
    public console: Console;
    public status: StatusLine;

    private resize$ = new Subject<void>();
    private inputHandler: InputHandler = this;

    constructor() {
        document.onkeydown = (e) => {
            console.log(e.key);
            this.inputHandler.onInput(e);
        }

        document.body.onresize = (e) => this.resize$.next();
        this.resize$.pipe(debounceTime(200)).subscribe(() => this.tilemap.onResize());

        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        const cursor = document.querySelector("#cursor") as HTMLElement;

        this.tileset = new TileSet("Nevanda.png", 32, 40);
        this.tilemap = new TileMap(canvas, cursor, this.tileset);
        this.inventory = new Inventory(document.querySelector('#inventory') as HTMLElement, this.tileset);
        this.console = new Console(document.querySelector("#output") as HTMLElement);
        this.status = new StatusLine(document.querySelector("#status") as HTMLElement);
    }

    onInput(e: KeyboardEvent): void {
        if (e.key === "Control" || e.key === "Shift") return;
        e.preventDefault();

        if (e.key.length === 1) {
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
        } else {
            console.log('Unhandled key: ', e.key);
        }
    }

    public openMenu(prompt: string, count: number, items: Item[]) {
        const menu = new Menu(prompt, items, count, this.tileset);
        menu.onSelect = ids => {
            window.nethackJS.selectMenu(ids);
            this.inputHandler = this;
            Dialog.removeAll() // sometimes not closed?
        };
        this.inputHandler = menu;
        document.body.append(menu.elem);
    }

    public openDialog(text: string) {
        const dialog = new Dialog(text);
        dialog.onClose = () => {
            window.nethackJS.sendInput(0);
            this.inputHandler = this;
        };
        this.inputHandler = dialog;
        document.body.append(dialog.elem);
    }

    public openGetLine(question: string, autocomplete: string[]) {
        const line = new Line(question, autocomplete);
        line.onLineEnter = (line) => {
            window.nethackJS.sendLine(line);
            this.inputHandler = this;
            Dialog.removeAll(); // Usually not opened as a dialog, so close it ourself
        };
        this.inputHandler = line;
        document.body.append(line.elem);
        line.focus();
    }
}