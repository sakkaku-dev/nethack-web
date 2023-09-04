import { Subject, debounceTime } from 'rxjs';
import { Item } from '../../models';
import { Console } from '../components/console';
import { Dialog } from '../components/dialog';
import { Inventory } from '../components/inventory';
import { Menu } from '../components/menu';
import { StatusLine } from '../components/status';
import { TileSet, TileMap } from '../components/tilemap';
import { Screen } from './screen';
import { Question } from '../components/question';
import { Gameover } from '../components/gameover';
import { Settings, TileSetImage } from '../../helper/settings';

export class GameScreen extends Screen {
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
        this.inventory = new Inventory(sidebar, this.tilemap);
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
            case TileSetImage.Chozo:
                return new TileSet('Chozo32-360.png', 32, 40);
            default:
                return new TileSet('nethack_default.png', 32, 40);
        }
    }

    onSettingsChange(setting: Settings) {
        const newTileset = this.createTileset(setting.tileSetImage);
        const newRogueTileSet = this.createTileset(setting.rogueTileSetImage);
        if (!newTileset.equals(this.tilemap.tileSet) || !newRogueTileSet.equals(this.tilemap.rogueTileSet)) {
            this.tilemap.setTileSets(newTileset, newRogueTileSet);
        }

        this.tilemap.setMapBorder(setting.enableMapBorder);
    }

    onResize(): void {
        this.resize$.next();

        const version = document.querySelector('#version') as HTMLLinkElement;
        version.style.display = 'none';
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
            this.activeMenu = new Menu(prompt, this.tilemap);
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
