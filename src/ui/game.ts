import { StartScreen } from "./screens/start-screen";
import { GameScreen } from "./screens/game-screen";
import { Screen } from "./screens/screen";
import { GameStatus, Item, NetHackUI, Status, Tile } from "../models";
import { Dialog } from "./components/dialog";

export class Game implements NetHackUI {
    private start: StartScreen;
    private game: GameScreen;

    private current?: Screen;

    constructor() {
        document.body.onresize = (e) => this.current?.onResize();
        document.onkeydown = (e) => {
            this.current?.onInput(e);
        };

        window.onload = () => {
            this.changeScreen(this.start);
        };

        this.game = new GameScreen();
        this.start = new StartScreen();
        this.start.onStartGame = () => {
            this.changeScreen(this.game);
            window.nethackJS.startGame();
        };
    }

    openMenu = (winid: number, prompt: string, count: number, ...items: Item[]) =>
        this.current?.onMenu(prompt, count, items);
    openQuestion = (question: string, ...choices: string[]) =>
        this.game.console.appendLine(`\n${question} ${choices}`);
    openGetLine = (question: string, ...autocomplete: string[]) =>
        this.game.openGetLine(question, autocomplete);
    openDialog = (winid: number, text: string) => this.game.openDialog(text);
    closeDialog = (winid: number) => Dialog.removeAll();
    printLine = (line: string) => this.game.console.appendLine(line);
    moveCursor = (x: number, y: number) => this.game.tilemap.recenter({ x, y });
    centerView = (x: number, y: number) => this.game.tilemap.recenter({ x, y });
    clearMap = () => this.game.tilemap.clearMap();
    updateMap = (...tiles: Tile[]) => this.game.tilemap.addTile(...tiles);
    updateStatus = (s: Status) => this.game.status.update(s);
    updateInventory = (...items: Item[]) => this.game.inventory.updateItems(items);
    onGameover = (status: GameStatus) => {
        if (status === GameStatus.EXITED) {
            window.location.reload();
        } else if (status === GameStatus.ERROR) {
            this.game.openErrorDialog(() => {
                window.location.reload();
            });
        }
    }

    changeScreen(screen: Screen) {
        if (this.current) {
            document.body.removeChild(this.current.elem);
        }

        this.current = screen;
        document.body.appendChild(this.current.elem);
    }
}
