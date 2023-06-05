import { Subject, debounceTime } from 'rxjs';
import { Item } from '../../models';
import { Console } from '../components/console';
import { Dialog } from '../components/dialog';
import { Inventory } from '../components/inventory';
import { Line } from '../components/line';
import { Menu } from '../components/menu';
import { StatusLine } from '../components/status';
import { TileSet, TileMap } from '../components/tilemap';
import { Screen } from './screen';
import { Question } from '../components/question';
import { Gameover } from '../components/gameover';
import { Settings, TileSetImage } from '../../helper/settings';

export class GameScreen extends Screen {
    public tileset?: TileSet;
    public tilemap: TileMap;
    public inventory: Inventory;
    public console: Console;
    public status: StatusLine;

    private resize$ = new Subject<void>();
    private activeMenu?: Menu;

    constructor() {
        super();

        this.tilemap = new TileMap(this.elem);
        this.console = new Console(this.elem);

        const sidebar = document.querySelector('#sidebar') as HTMLElement;
        this.inventory = new Inventory(sidebar);
        this.status = new StatusLine(sidebar);
        this.elem.appendChild(sidebar);

        this.resize$.pipe(debounceTime(200)).subscribe(() => this.tilemap?.onResize());
    }

    private createTileset(image: TileSetImage) {
        switch (image) {
            case TileSetImage.Nevanda:
                return new TileSet('Nevanda.png', 32, 40);
            case TileSetImage.Dawnhack:
                return new TileSet('dawnhack_32.bmp', 32, 40);
            default:
                return new TileSet('nethack_default.png', 32, 40);
        }
    }

    onSettingsChange(setting: Settings) {
        console.log('Settings changed', setting);
        const newTileset = this.createTileset(setting.tileSetImage);
        if (!newTileset.equals(this.tileset)) {
            this.tileset = newTileset;
            this.tilemap.setTileSet(this.tileset);
            this.inventory.setTileSet(this.tileset);
        }

        this.tilemap.setMapBorder(setting.enableMapBorder);
    }

    onResize(): void {
        this.resize$.next();
    }

    onMenu(prompt: string, count: number, items: Item[]): void {
        this.openMenu(prompt, count, items);
    }

    onCloseDialog(): void {
        super.onCloseDialog();
        this.activeMenu = undefined;
    }

    public openMenu(prompt: string, count: number, items: Item[]) {
        if (!this.activeMenu) {
            const dialog = new Dialog();
            this.activeMenu = new Menu(prompt, this.tileset!);
            dialog.elem.appendChild(this.activeMenu.elem);
            this.elem.appendChild(dialog.elem);
        }

        this.activeMenu.updateMenu(items, count);
    }

    public openQuestion(question: string, choices: string[], defaultChoice: string) {
        const dialog = new Question(question, choices, defaultChoice);
        this.elem.appendChild(dialog.elem);
    }

    public openGameover() {
        const gameover = new Gameover();
        this.inputHandler = gameover;
        this.elem.appendChild(gameover.elem);
    }
}
